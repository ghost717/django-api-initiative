# Użyj oficjalnego obrazu Node.js
FROM node:18-alpine

# Ustaw katalog roboczy w kontenerze
WORKDIR /app

# Skopiuj package.json i package-lock.json (lub yarn.lock)
COPY package*.json ./

# Zainstaluj zależności
RUN npm install

# Skopiuj resztę kodu aplikacji
COPY . .

# Wystaw port, na którym działa serwer deweloperski Next.js
EXPOSE 3000

# Uruchom serwer deweloperski
CMD ["npm", "run", "dev"]```