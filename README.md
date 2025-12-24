# WhatsApp Bot Dashboard (Starter)

This starter repo provides:

- An Express backend that manages Docker containers (start/stop/list/logs) — communicates with Docker via the local Docker socket using dockerode.
- A React frontend dashboard to login, list instances, start/stop instances, create instances, and view logs.
- A simple WhatsApp bot template (Node + Baileys) packaged as a Docker image that you can run per instance and pair via QR.
- docker-compose for local testing (backend + frontend). For real VPS usage, run backend with Docker socket mounted.

Security note:
- This is a starting point. Protect your VPS and backend: always run behind HTTPS, restrict access (firewall), and rotate secrets. Using Baileys (WhatsApp Web) can cause account bans; for production prefer WhatsApp Business API.

Quick local dev (Linux/macOS):
1. Copy `.env.example` to `.env` in backend/ and set ADMIN_PASSWORD and ADMIN_TOKEN.
2. Build images: docker-compose build
3. Start: docker-compose up
4. Visit http://localhost:3000

Deploying on a VPS (high-level):
- Run the backend container but mount the Docker socket so it can manage containers:
  docker run -d --name wa-dashboard-backend --restart unless-stopped -p 4000:4000 \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -e ADMIN_PASSWORD=yourpass -e ADMIN_TOKEN=yourtoken backend-image
- Host the frontend (static build) with nginx or run the frontend container.
- Use HTTPS and a reverse proxy (nginx/Traefik).
- Keep secrets off the repository; use env variables or a secret manager.

Repository layout:
- backend/ (Express API)
- frontend/ (React dashboard)
- bot/ (WhatsApp bot template)
- docker-compose.yml
- README.md

If you want, I can:
- Add GitHub Actions to build/push images,
- Add user accounts & persistent DB (Postgres),
- Add HTTPS examples with nginx/Traefik.

Next: below are the source files for backend, frontend, and bot.
