FIN-MAN Project (Angular + NestJS + MongoDB)

This repository contains the full FIN-MAN application:

fin-man-web/ → Angular Frontend (Nx workspace)

server/ → NestJS Backend with MongoDB (Mongoose)

postman/ → Postman collection

Dockerized setup for easy local development

🚀 Run Everything with Docker

1. Install requirements

Docker

Docker Compose

Git

2. Clone the repo
   git clone <your-repo>
   cd <your-repo>

3. Run the full stack
   ./build-and-run.sh

Or manually:

docker-compose up --build

🌐 URLs
Service URL
Frontend http://localhost:4200

Backend http://localhost:3000

MongoDB mongodb://localhost:27017
🧪 Postman Collection

Import:

postman/<your-collection>.json

🛠 Project Structure
fin-man-web/ # Angular app
server/ # NestJS app
postman/ # Postman collection
docker/ # optional scripts & assets
docker-compose.yml
build-and-run.sh
