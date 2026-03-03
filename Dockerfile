# Użyj oficjalnego obrazu Node.js
FROM node:20-alpine as frontend-builder

# Ustaw katalog roboczy w kontenerze
WORKDIR /app

# Skopiuj package.json i package-lock.json (lub yarn.lock)
COPY package*.json ./

# Zainstaluj zależności
RUN npm install

# Skopiuj resztę kodu aplikacji
COPY . .

# Wystaw port, na którym działa serwer deweloperski Next.js
# EXPOSE 3000

# # Uruchom serwer deweloperski
# CMD ["npm", "run", "dev"]```
EXPOSE 7860

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
