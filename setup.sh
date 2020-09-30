#!/bin/bash

export eNutri_WEB_URL="http://127.0.0.1:8080"


# For security and convenience purposes, generate these randomly
# We only want printable characters, so we filter the rest out
export eNutri_MASTER_KEY=$(head /dev/random | tr -dc A-Za-z0-9 | head -c 32)
export eNutri_APP_ID=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 32)

cat << END
eNutri Install Script V1

Please note down the following configuration:
Public Facing URL:	$eNutri_WEB_URL
App ID:			$eNutri_APP_ID
Master Key:		$eNutri_MASTER_KEY
END

echo -e "\nSetting up Parse Server..."
parse-server/setup.sh | awk '{print "parse:\t" $0}'

echo -e "\nSetting up HTTPD..."
httpd/setup.sh | awk '{print "httpd:\t" $0}'

echo -e "\nSetting up Parse Dashboard..."
parse-dashboard/setup.sh | awk '{print "parse-dashboard:\t" $0}'

echo -e "\nInitializing Database..."
parse-server/init.sh | awk '{print "init:\t" $0}'

echo -e "\nDone. Have a nice day :)"
