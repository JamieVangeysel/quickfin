# ---- Dependencies ----
FROM alpine:latest  AS base
# add nodejs, create group node, create user node, create folder to run app in and give exlusive rights to new node user
RUN apk add --no-cache --update nodejs curl tzdata && addgroup -S node && adduser -S node -G node && mkdir -p /usr/src/app && chown node:node /usr/src/app && rm -vrf /var/cache/apk/*
# set timezone to local time
ENV TZ=Europe/Brussels
ENV NODE_ENV=production

FROM base as build
RUN apk add --update yarn
WORKDIR /usr/src/app
# copy project file
COPY package.json ./src ./
# install node packages
RUN yarn


# from base image node
FROM base

# set current user to node
USER node

# change the working directory to new exclusive app folder
WORKDIR /usr/src/app

# copy production node_modules
COPY --chown=node:node --from=build /usr/src/app ./

# command to run when intantiate an image
CMD ["node","index.js"]