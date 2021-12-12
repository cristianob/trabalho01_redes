FROM tiangolo/node-frontend:10 as build-stage

WORKDIR /app
COPY package*.json /app/
COPY package-lock.json /app/
RUN npm install
COPY ./ /app/

RUN npm run build

# Deploy stage
FROM nginx:alpine

COPY --from=build-stage /app/build/ /usr/share/nginx/html
COPY deployment/docker/nginx.conf /etc/nginx/nginx.conf