const sourceId = "1f737c6b-4a4b-4302-a987-fcd8db1bf0f4";

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(body)
  };
}

function getConfig() {
  const baseUrl = process.env.MPCLI_URL;
  const token = process.env.MPCLI_TOKEN;

  if (!baseUrl || !token) {
    return { error: "Missing MPCLI_URL or MPCLI_TOKEN environment variable." };
  }

  return {
    baseUrl: baseUrl.replace(/\/$/, ""),
    token
  };
}

async function fetchMeiro(config, path) {
  const response = await fetch(`${config.baseUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: "application/json"
    }
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    throw new Error(data?.error || data?.message || `${response.status} ${response.statusText}`);
  }

  return data;
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return json(204, {});
  if (event.httpMethod !== "GET") return json(405, { error: "Method not allowed" });

  const config = getConfig();
  if (config.error) return json(500, { error: config.error });

  try {
    const [streams, dashboard, queues, errorStats] = await Promise.all([
      fetchMeiro(config, "/api/event-streams"),
      fetchMeiro(config, "/api/dashboard"),
      fetchMeiro(config, "/api/health/queues"),
      fetchMeiro(config, "/api/error-stats")
    ]);

    const source = Array.isArray(streams)
      ? streams.find(item => item.id === sourceId || item.slug === "sse-website")
      : null;

    const queueCounts = Object.fromEntries(
      Object.entries(queues?.queues || {}).map(([key, value]) => [key, value?.count ?? null])
    );

    const pendingQueueCount = Object.values(queueCounts).reduce(
      (sum, count) => sum + (Number(count) || 0),
      0
    );

    return json(200, {
      checkedAt: new Date().toISOString(),
      source: source
        ? {
            id: source.id,
            name: source.name,
            slug: source.slug,
            isEnabled: source.isEnabled,
            eventCountLastHour: source.eventCountLastHour,
            templateVersion: source.templateVersion
          }
        : null,
      dashboard: {
        totalEventsLastHour: dashboard?.totalEventsLastHour ?? null,
        activeSourcesLastHour: dashboard?.activeSourcesLastHour ?? null,
        activeEventTypesLastHour: dashboard?.activeEventTypesLastHour ?? null,
        errorsLastHour: dashboard?.errorsLastHour ?? null,
        profilesRefreshedLastHour: dashboard?.profilesRefreshedLastHour ?? null
      },
      queues: {
        pendingTotal: pendingQueueCount,
        counts: queueCounts
      },
      errors: {
        totalErrorsLastHour: Number(errorStats?.totalErrorsLastHour || 0)
      }
    });
  } catch (err) {
    return json(502, {
      error: "Meiro Pipes status check failed.",
      detail: err.message
    });
  }
}
