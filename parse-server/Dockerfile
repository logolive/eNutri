FROM parseplatform/parse-server:latest

COPY config.json config/config.json

EXPOSE 1337
ENTRYPOINT ["node","/parse-server/bin/parse-server", "config/config.json"]
