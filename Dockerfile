# ==========================================
# STAGE 1: Build Frontend (Node.js)
# ==========================================
FROM node:20-alpine as frontend-builder

WORKDIR /app/frontend

# Kopiujemy pliki konfiguracyjne
COPY frontend/package.json frontend/package-lock.json ./

# Instalujemy zależności
RUN npm install

# Kopiujemy resztę kodu frontendu
COPY frontend/ ./

# --- KLUCZOWA POPRAWKA 1: Usuwamy lokalny plik env, który mógłby nadpisać ustawienia ---
RUN rm -f .env.local .env

# --- KLUCZOWA POPRAWKA 2: Pusty string oznacza "ten sam serwer" (ścieżka relatywna) ---
# Zmieniłem "/" na "" (pusty string), aby uniknąć podwójnych slashy //api/
ENV NEXT_PUBLIC_API_URL=""

# Budujemy aplikację
RUN npm run build

# ==========================================
# STAGE 2: Setup Backend & Run (Python)
# ==========================================
FROM python:3.11-slim

WORKDIR /app

# Utworzenie użytkownika
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

# Kopiujemy backend
COPY --chown=user backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir --upgrade -r requirements.txt

COPY --chown=user backend/ ./backend

# Kopiujemy frontend
COPY --chown=user --from=frontend-builder /app/frontend/out ./backend/static_ui

WORKDIR /app/backend

# Fix dla SQLite
RUN touch gus_cache.sqlite && chmod 666 gus_cache.sqlite

EXPOSE 7860

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]