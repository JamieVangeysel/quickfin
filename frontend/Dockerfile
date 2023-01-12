#############
### build ###
#############

FROM node:18-alpine as build
# add nodejs, create group node, create user node, create folder to run app in and give exlusive rights to new node user
RUN apk add --no-cache --update tzdata && mkdir -p /usr/src/app && chown node:node /usr/src/app && rm -vrf /var/cache/apk/*
# set timezone to local time
ENV TZ=Europe/Brussels
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
RUN ng build --configuration production --output-path=dist

############
### prod ###
############

# base image
FROM jamievangeysel/nginx

#remove all content form html
RUN rm -rf /usr/share/nginx/html/*

# copy artifact build from the 'build environment'
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf

# expose port 80
EXPOSE 80