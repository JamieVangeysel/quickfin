#
# ---- Base Node ----
FROM alpine:3.16 as base
# add nodejs, create group node, create user node, create folder to run app in and give exlusive rights to new node user
RUN apk add --no-cache --update nodejs curl tzdata && addgroup -S node && adduser -S node -G node && mkdir -p /usr/src/app && chown node:node /usr/src/app && rm -vrf /var/cache/apk/* && update-ca-certificates
# set timezone to local time
ENV TZ=Europe/Brussels

#############
### build ###
#############

# base image
FROM base as build

RUN apk add --update npm
RUN npm set progress=false && npm config set depth 0

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package.json /app/package.json
RUN npm i

# add app
COPY . /app

# generate build
RUN npm run build:ssr

############
### prod ###
############

# base image
FROM base

# copy artifact build from the 'build environment'
COPY --from=build /app/dist /app/dist

WORKDIR /app
CMD node dist/server/quickfin-frontend/main.js