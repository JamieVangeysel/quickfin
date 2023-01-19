FROM node:lts-alpine as node
# add nodejs, create group node, create user node, create folder to run app in and give exlusive rights to new node user
RUN apk add --no-cache --update tzdata && mkdir -p /usr/src/app && chown node:node /usr/src/app && rm -vrf /var/cache/apk/*
# set timezone to local time
ENV TZ=Europe/Brussels
RUN npm set progress=false && npm config set depth 0

# ---- Dependencies ----
FROM node AS dependencies
WORKDIR /root/npm

# copy project file
COPY package.json .

# install node packages
RUN npm i --only=production

# copy production node_modules aside
RUN cp -R node_modules prod_node_modules


# from base image node
FROM node AS release

# set current user to node
USER node

# change the working directory to new exclusive app folder
WORKDIR /usr/src/app

# copy production node_modules
COPY --chown=node:node --from=dependencies /root/npm/prod_node_modules ./node_modules

# copy other source files as well
COPY --chown=node:node ./src .

# command to run when intantiate an image
CMD ["node","index.js"]