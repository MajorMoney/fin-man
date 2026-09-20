# FIN-MAN

Personal finance app: Angular frontend (`fin-man-web/`), NestJS API (`server/`), MongoDB.

Two databases on purpose:

- **Laptop (dev):** throwaway data while you code.
- **Raspberry Pi (home server):** long-lived data. First boot is empty.

Code moves with git. Data does not sync between machines.

| Compose file | What it runs |
|---|---|
| `docker-compose.dev.yml` | Mongo only, for `npm` on the laptop |
| `docker-compose.yml` | Full stack on the laptop (container check) |
| `docker-compose.pi.yml` | Always-on stack on the Pi |

Do not run the full-stack compose and the npm workflow at the same time. They both need ports `27017`, `3000`, and `4200`.

---

## Dev setup (laptop, day to day)

Apps run with npm. The only extra infra is Mongo.

**Requirements:** Node.js, Docker, Git.

**1. Start Mongo**

```bash
docker compose -f docker-compose.dev.yml up -d
```

Mongo listens on `localhost:27017`. The backend default URI is `mongodb://localhost:27017/fin-man-dev`. Data is stored in the `mongo-dev-data` volume.

**2. API** (terminal 1)

```bash
cd server
npm install
npm run start:dev
```

**3. UI** (terminal 2)

```bash
cd fin-man-web
npm install
npm start
```

- UI: http://localhost:4200
- API: http://localhost:3000

Stop Mongo when you want:

```bash
docker compose -f docker-compose.dev.yml down
```

Do not add `-v` unless you intend to wipe the local database.

---

## Local deploy (full stack in Docker)

Use this to confirm images build and the three services talk to each other. Same idea as the Pi, but on `localhost`. Docker builds your working tree, so you do not need to push first.

Stop any npm servers (and the dev Mongo compose) so ports are free, then from the repo root:

```bash
docker compose up --build
```

- UI: http://localhost:4200
- API: http://localhost:3000
- Mongo: `localhost:27017` (database `fin-man`, volume `mongo-data`)

Stop without deleting data:

```bash
docker compose down
```

`./build-and-run.sh` is an equivalent helper if you prefer it.

---

## Raspberry Pi setup (home server)

Host install is **Docker only**. Do not install Node, nginx, or Mongo on the Pi.

The Pi clone must include `docker-compose.pi.yml`. Commit and push from the laptop before the first clone.

### One-time on the Pi

SSH:

```bash
ssh majormoney@MajorMoneyPi.local
```

**1. Check the board**

```bash
uname -m
free -h
df -h /
```

Need `aarch64` or `arm64` (Mongo 7 does not run on 32-bit), a few GB of disk, and ideally 2GB+ RAM.

**2. Install Docker**

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker majormoney
```

Log out of SSH and back in, then:

```bash
docker version
docker compose version
```

**3. Data directory** (survives rebuilds and re-clones)

```bash
mkdir -p ~/fin-man-data/mongo
```

Override the path with `MONGO_DATA_PATH` if needed. Default in compose is `/home/majormoney/fin-man-data/mongo`.

**4. Clone and start**

If the GitHub repo is private, authenticate on the Pi first.

```bash
cd ~
git clone https://github.com/MajorMoney/fin-man.git
cd fin-man
git pull
docker compose -f docker-compose.pi.yml up -d --build
```

First build is slow (Node + Angular on ARM). If the process is `Killed`, the Pi ran out of RAM.

```bash
docker compose -f docker-compose.pi.yml ps
docker compose -f docker-compose.pi.yml logs -f
```

- UI: http://MajorMoneyPi.local (port 80)
- API: http://MajorMoneyPi.local:3000

Mongo is **not** published on the LAN. Only the backend container can reach it.

**Leave the Pi on** if you want the house server available. Docker is enabled on boot, and each service has `restart: unless-stopped`, so UI, API, and Mongo start again after a reboot or power loss. Data stays in `~/fin-man-data/mongo`.

You can still shut it down whenever you want (power, travel). After the next boot the stack comes back by itself, as long as you did not `docker compose stop` / `down` before shutting down (`unless-stopped` will not restart containers you stopped on purpose).

### Deploy a new version to the Pi

Until the Pi runner is online (see CI/CD below), deploy by hand:

**On the laptop**

```bash
git add -A   # or add specific files
git commit -m "..."
git push origin main
```

**On the Pi**

```bash
ssh majormoney@MajorMoneyPi.local
cd ~/fin-man
git pull
docker compose -f docker-compose.pi.yml up -d --build
```

`--build` rebuilds frontend/backend images from the new code, then replaces those containers. Mongo is not wiped: it keeps using `~/fin-man-data/mongo`.

After CI publishes images and `ENABLE_PI_DEPLOY` is on, a merge to `main` pulls `ghcr.io` tags instead of building on the Pi.

### What you do not do

| Don’t | Why |
|---|---|
| `docker compose down -v` on the Pi | Not needed. Bind-mounted data usually survives anyway, but do not make a habit of volume wipes. |
| Point the laptop app at Pi Mongo | Two DBs on purpose. Dev stays local. |
| Copy `~/fin-man-data` into the repo | Data is not source. |
| Install Node/Mongo/nginx on the Pi | Docker already provides them. |

### Useful Pi commands

```bash
# status
docker compose -f docker-compose.pi.yml ps

# logs
docker compose -f docker-compose.pi.yml logs -f backend
docker compose -f docker-compose.pi.yml logs -f frontend

# stop without deleting data
docker compose -f docker-compose.pi.yml stop

# start again
docker compose -f docker-compose.pi.yml start
```

---

## CI/CD

GitHub Actions runs on GitHub-hosted VMs so the Pi does not compile. Target:

1. **PR / every push** — unit tests and `npm run build` for `server/` and `fin-man-web/`.
2. **Push to `main` after tests pass** — build `linux/arm64` images and push to GHCR:
   - `ghcr.io/majormoney/fin-man-backend:<git-sha>` and `:main`
   - `ghcr.io/majormoney/fin-man-web:<git-sha>` and `:main`
3. **Deploy (off until you enable it)** — Pi self-hosted runner pulls those images and runs `docker compose up -d`. No `--build` on the Pi.

Lint is not gated yet (existing ESLint noise in both apps). Tests and compile are.

### First time on GitHub

1. Push this branch / `main` so `.github/workflows/ci.yml` exists.
2. Repo **Settings → Actions → General**: allow Actions, and set workflow permissions to **Read and write** (needed to push GHCR packages).
3. After the first green `main` run, confirm packages under the GitHub **Packages** tab.

The `deploy` job stays skipped until you set a repository variable. Do that only after a runner is installed on the Pi.

### Enable auto-deploy (after CI is green)

On the Pi (Docker user, not root):

1. Install a GitHub Actions runner (official Linux ARM64 tarball) in e.g. `~/actions-runner`.
2. Configure it for this repo, leave the default labels (`self-hosted`, `Linux`, `ARM64`).
3. Install and start the runner as a service so it survives reboot.

In the GitHub repo: **Settings → Secrets and variables → Actions → Variables** → create `ENABLE_PI_DEPLOY` = `true`.

The next successful `main` publish will SSH-less deploy: pull + `up -d`. Mongo data is unchanged.

Until that variable exists, keep using `git pull` and `docker compose -f docker-compose.pi.yml up -d --build` on the Pi.

---

## Project structure

```
fin-man-web/             Angular app
server/                  NestJS API
postman/                 Postman collection
docker-compose.yml       Laptop full stack
docker-compose.dev.yml   Laptop Mongo only
docker-compose.pi.yml    Pi full stack
.github/workflows/ci.yml GitHub Actions CI + GHCR publish
```

Import `postman/` into Postman for API calls against the local backend.
