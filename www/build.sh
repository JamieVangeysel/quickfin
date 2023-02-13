#!/bin/bash

echo "building image 'jamievangeysel/quickfin-website' and pushing to docker registry"
docker build -t jamievangeysel/quickfin-website ./ && docker push jamievangeysel/quickfin-website
echo "Last runtime: $(date)"

docker image prune --filter label=stage=build --force
echo "removed build stage image"