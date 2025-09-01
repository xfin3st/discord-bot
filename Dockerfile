# Leichtes Node-Image
FROM node:20-alpine

# Arbeitsverzeichnis
WORKDIR /app

# Nur package.json zuerst -> bessere Layer-Caches
COPY package.json ./

# Prod-Dependencies installieren
RUN npm install --omit=dev

# Rest des Codes
COPY . .

# Environment wird über .env / Compose gesetzt
CMD ["npm", "start"]
