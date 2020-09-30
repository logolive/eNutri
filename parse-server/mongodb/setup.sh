#!/bin/bash

cd $(dirname "$0")

echo -e "Starting MongoDB"
docker run --name enutri_mongodb \
	-v enutri_mongo-db:/data/db \
	-v enutri_mongo-configdb:/data/configdb \
	--restart always \
	-d mongo

echo -e "DONE"
