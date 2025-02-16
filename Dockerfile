FROM node:slim

RUN apt-get update -y \
  && apt-get install -y openssl build-essential python3

WORKDIR /usr/src/app

COPY package*.json ./

COPY . .

RUN yarn install --frozen-lockfile --production=false
RUN yarn build

EXPOSE 3000

CMD ["sh", "-c", "until pg_isready -h db -p 5432; do sleep 2; done && yarn prisma:deploy && yarn start"]
