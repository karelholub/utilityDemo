const allowedIdentifierTypes = new Set(["email", "user_id", "browser", "phone"]);

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

async function callMeiro(path) {
  const config = getConfig();
  if (config.error) return json(500, { error: config.error });

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

  return json(response.status, data);
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return json(204, {});
  if (event.httpMethod !== "GET") return json(405, { error: "Method not allowed" });

  const params = event.queryStringParameters || {};
  const query = params.query && params.query.trim();
  const profileId = params.profile_id && params.profile_id.trim();
  const identifierType = params.identifier_type && params.identifier_type.trim();
  const identifierValue = params.identifier_value && params.identifier_value.trim();

  if (profileId) {
    return callMeiro(`/api/profiles/${encodeURIComponent(profileId)}`);
  }

  if (query) {
    return callMeiro(`/api/profiles/search-everywhere?query=${encodeURIComponent(query)}`);
  }

  if (identifierType || identifierValue) {
    if (!allowedIdentifierTypes.has(identifierType) || !identifierValue) {
      return json(400, {
        error: "Use identifier_type=email|user_id|browser|phone together with identifier_value."
      });
    }

    const searchParams = new URLSearchParams({
      identifier_type: identifierType,
      identifier_value: identifierValue
    });
    return callMeiro(`/api/profiles/search?${searchParams.toString()}`);
  }

  return json(400, {
    error: "Provide query, profile_id, or identifier_type with identifier_value."
  });
}
