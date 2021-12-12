FROM node as builder

WORKDIR /usr/app
COPY package*.json ./
COPY package-lock.json ./

RUN npm install

COPY . .
CMD node index.js