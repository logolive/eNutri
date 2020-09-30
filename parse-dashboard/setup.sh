#!/bin/bash

# Expected ENV:
# - eNutri_APP_ID
# - eNutri_MASTER_KEY
# - eNutri_WEB_URL

cd $(dirname "$0")

echo -e "Starting Parse Dashboard"
docker run --name enutri_parsedash \
	-p 4040:4040 \
	--restart always \
	-d parseplatform/parse-dashboard \
	--dev \
	--appId "$eNutri_APP_ID" \
	--masterKey "$eNutri_MASTER_KEY" \
	--serverURL "$eNutri_WEB_URL/parse" \
	|| exit 1

echo -e "DONE"