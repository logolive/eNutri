#!/bin/bash

# Expected ENV:
# - eNutri_APP_ID
# - eNutri_MASTER_KEY

cd $(dirname "$0")

echo -e "Setting up MongoDB..."
mongodb/setup.sh | awk '{print "mongoDB:\t" $0}'

echo -e "Generating Parse Server config file"
cat > config.json << EOF
{
	"appId": "$eNutri_APP_ID",
	"masterKey": "$eNutri_MASTER_KEY",
	"databaseURI": "mongodb://mongo/test",
	"allowClientClassCreation": false
}
EOF

echo -e "Building custom Docker image for Parse Server"
docker build -t enutri_parse-server_img .

echo -e "Starting Parse Server"
docker run --name enutri_parse \
	-v enutri_parse-cloud-code:/parse-server/cloud \
	-v enutri_parse-config:/parse-server/config \
	--link enutri_mongodb:mongo \
	--restart always \
	-d enutri_parse-server_img

echo -e "Cleanup"
rm config.json

echo -e "\nDONE"
