FROM node:lts-alpine AS build

WORKDIR /src

COPY ./package.json .
COPY ./yarn.lock .
COPY ./vite.config.ts . 

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

FROM nginxinc/nginx-unprivileged
COPY ./nginx.default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /src/dist /usr/share/nginx/html
