FROM node:22-alpine

WORKDIR /app

ENV HOST=0.0.0.0
ENV PORT=8080
ENV NODE_ENV=production

COPY package.json ./
COPY server.mjs ./
COPY generate_sse_sap_export.mjs ./
COPY netlify.toml ./
COPY *.html ./
COPY outputs ./outputs

EXPOSE 8080

USER node

CMD ["npm", "start"]
