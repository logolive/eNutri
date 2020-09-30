#!/bin/bash

docker container stop enutri_parse enutri_httpd enutri_mongodb enutri_parsedash
docker container rm enutri_parse enutri_httpd enutri_mongodb enutri_parsedash
docker volume prune -f
