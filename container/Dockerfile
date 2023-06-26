FROM node:latest

RUN apt-get update -y

RUN apt-get install -y unzip

WORKDIR /usr/local/app

COPY package*.json ./

RUN npm install

COPY . .

RUN unzip src.zip

EXPOSE 8080

CMD ["node", "index.js"]

