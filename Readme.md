## :pushpin: Tech stack
- Node
- Express
- React
- Mongo
- Docker

## :bookmark: General Instructions
- :memo: Create .env file by copying contents of .env.sample file
- :label: By default Node server will run on port 5000 and React will run on port 3000 (In case if needed to change this behaviour modify the `.env` file inside the `app` directory)
- :sparkles: Make sure the port 5000 and 6000 of the host machine is not used by other services since docker attaches the backend service to port 5000 and mongodb to 6000 of the host machine (To change this behaviour modify the `.env` file inside the `root` directory)
- :closed_lock_with_key: Demo credentials to login
  - `email: admin@demo.com`
  - `password: #12345`
- :package: Frontend is not dockerized
- :building_construction: MVC architecture has been followed
- :recycle: .env file inside the `app` directory will be used while running without docker and .env file at `root` directory will be used while running with docker

# :rocket: To run the project without docker
## Starting backend (Node server)
- Navigate to backend/app directory
- Run the command `npm install`
- Run the command `npm start`
- Seed the database with user's data by using the command `npx mongoose db:seed:all`

# :whale: To run the project using docker
- Navigate to backend directory
- Run the code `docker-compose up -d`
- Find the container ID of node container by using the command `docker ps`
- Access the docker container shell using the command `docker exec -it CONTAINER_ID sh` (Replace the CONTAINER_ID with actual container id obtained from the previous step)
- Seed the database with user's data by using the command `npx mongoose db:seed:all`