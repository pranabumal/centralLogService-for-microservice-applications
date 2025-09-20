FROM node:18-alpine

WORKDIR /usr/src/app

COPY package.json .
RUN npm install

COPY app.js .
COPY log-data/ ./log-data/

CMD ["node", "app.js"]