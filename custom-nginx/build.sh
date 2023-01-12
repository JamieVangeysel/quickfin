#!/bin/bash

echo "building image 'jamievangeysel/nginx' and pushing to docker registry"
docker build -t jamievangeysel/nginx ./ && docker push jamievangeysel/nginx
echo "Last runtime: $(date)"

docker image prune --filter label=stage=build --force
echo "removed build stage image"