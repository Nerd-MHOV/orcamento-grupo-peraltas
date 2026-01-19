FROM node:20-slim

WORKDIR /app

# Install build dependencies for native modules and OpenSSL
RUN apt-get update && apt-get install -y python3 make g++ openssl libssl-dev && rm -rf /var/lib/apt/lists/*

# Instala dependências
COPY package.json ./

# Copia o restante do código
COPY . .

# Install all dependencies with npm (handles native modules better)
RUN npm install --legacy-peer-deps

# Generate Prisma Client
RUN npx prisma generate
# Compila o TypeScript
RUN npm run build

# Define variável de ambiente (ajuste conforme necessário)
ENV NODE_ENV=production

CMD ["npm", "start"]
