#!/bin/bash

# Expected ENV:
# - eNutri_APP_ID

cd $(dirname "$0")

echo -e "Generating eNutri config.js file"
cat > app/config.js << EOF
'use strict';

// DO NOT MODIFY THIS FILE DIRECTLY, UNLESS YOU KNOW WHAT YOU ARE DOING.
// IT WILL BE OVERWRITTEN BY THE BOOTUP-SCRIPT.
angular.module('eNutri.config', [])
.constant('PARSE_URL', "/parse")
.constant('PARSE_APPID', "$eNutri_APP_ID");
EOF

echo -e "Generating HTTPD config file"
cat > httpd.conf << EOF
ServerRoot "/usr/local/apache2"
Listen 80
LoadModule mpm_event_module modules/mod_mpm_event.so
LoadModule authn_file_module modules/mod_authn_file.so
LoadModule authn_core_module modules/mod_authn_core.so
LoadModule authz_host_module modules/mod_authz_host.so
LoadModule authz_groupfile_module modules/mod_authz_groupfile.so
LoadModule authz_user_module modules/mod_authz_user.so
LoadModule authz_core_module modules/mod_authz_core.so
LoadModule access_compat_module modules/mod_access_compat.so
LoadModule auth_basic_module modules/mod_auth_basic.so
LoadModule reqtimeout_module modules/mod_reqtimeout.so
LoadModule filter_module modules/mod_filter.so
LoadModule mime_module modules/mod_mime.so
LoadModule log_config_module modules/mod_log_config.so
LoadModule env_module modules/mod_env.so
LoadModule headers_module modules/mod_headers.so
LoadModule setenvif_module modules/mod_setenvif.so
LoadModule version_module modules/mod_version.so
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
LoadModule unixd_module modules/mod_unixd.so
LoadModule status_module modules/mod_status.so
LoadModule autoindex_module modules/mod_autoindex.so
LoadModule dir_module modules/mod_dir.so
LoadModule alias_module modules/mod_alias.so

User daemon
Group daemon

ServerAdmin you@example.com

<Directory />
    AllowOverride none
    Require all denied
</Directory>

DocumentRoot "/usr/local/apache2/htdocs"
DirectoryIndex index.html

<Directory "/usr/local/apache2/htdocs">
    Options Indexes FollowSymLinks
    AllowOverride None
    Require all granted
</Directory>

ProxyPass "/parse" "http://parseserver:1337/parse"
ProxyPassReverse "/parse" "http://parseserver:1337/parse"

ErrorLog /proc/self/fd/2
LogLevel warn

LogFormat "%h %l %u %t \"%r\" %>s %b \"%{Referer}i\" \"%{User-Agent}i\"" combined
LogFormat "%h %l %u %t \"%r\" %>s %b" common

CustomLog /proc/self/fd/1 common

RequestHeader unset Proxy early

TypesConfig conf/mime.types

AddType application/x-compress .Z
AddType application/x-gzip .gz .tgz
EOF

# NOTE: Feel free to change the volume to something else.
# Copying is the obvious alternative, leaving you free to
# remove any repo-files during production.
# This is however more convenient for development
echo -e "Starting HTTPD"
docker run --name enutri_httpd \
	-it \
	-p 8080:80 \
	-v "$PWD/app/":/usr/local/apache2/htdocs \
    --link enutri_parse:parseserver \
    --restart always \
	-d httpd:latest \
	|| exit 1

echo -e "Applying config file to HTTPD"
docker cp httpd.conf enutri_httpd:/usr/local/apache2/conf/httpd.conf
docker exec -it enutri_httpd apachectl graceful

echo -e "Cleanup"
rm httpd.conf

echo -e "DONE"
