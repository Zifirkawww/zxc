FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install -g nodemon

COPY . .

EXPOSE 3000

CMD ["npm", "start"]