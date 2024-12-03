FROM node:23 AS build

WORKDIR /src

COPY ./package.json ./
COPY ./yarn.lock ./
COPY ./vite.config.mjs ./ 

RUN yarn install --immutable --immutable-cache

COPY ./ ./

RUN yarn build

FROM nginxinc/nginx-unprivileged
COPY ./nginx.default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /src/dist /usr/share/nginx/html
