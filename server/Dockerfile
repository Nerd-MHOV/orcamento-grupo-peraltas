FROM node:lts-alpine

WORKDIR /app

# Instala dependências
COPY package.json ./
RUN npm install -g pnpm tsc typescript \
    && pnpm install 

# Copia o restante do código
COPY . .

# Generate Prisma Client
RUN npx prisma generate
# Compila o TypeScript
RUN pnpm run build

# Define variável de ambiente (ajuste conforme necessário)
ENV NODE_ENV=production

CMD ["pnpm", "start"]
