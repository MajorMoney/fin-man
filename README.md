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

Mongo is **not** published on the LAN. Only the backend container can reach it. Containers restart after a reboot (`restart: unless-stopped`).

### Deploy a new version to the Pi

On the laptop: commit and `git push origin main`.

On the Pi:

```bash
cd ~/fin-man
git pull
docker compose -f docker-compose.pi.yml up -d --build
```

Mongo keeps using `~/fin-man-data/mongo`. Do not run `docker compose down -v` on the Pi.

Useful:

```bash
docker compose -f docker-compose.pi.yml logs -f backend
docker compose -f docker-compose.pi.yml stop
docker compose -f docker-compose.pi.yml start
```

---

## Project structure

```
fin-man-web/             Angular app
server/                  NestJS API
postman/                 Postman collection
docker-compose.yml       Laptop full stack
docker-compose.dev.yml   Laptop Mongo only
docker-compose.pi.yml    Pi full stack
```

Import `postman/` into Postman for API calls against the local backend.
