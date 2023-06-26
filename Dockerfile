FROM node:latest

RUN apt-get update

RUN apt-get install -y docker.io

WORKDIR /the/workdir/path

COPY package*.json .

RUN npm install

COPY . .

EXPOSE 8080

CMD ["node", "server.js"]