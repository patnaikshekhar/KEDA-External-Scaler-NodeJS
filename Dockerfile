FROM node:12

WORKDIR /app
EXPOSE 50051

COPY package* ./
RUN npm install

COPY . ./
CMD ["npm", "start"]