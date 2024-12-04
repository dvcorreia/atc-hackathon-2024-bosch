
# Confis to change:

`docker-compose.yaml`

```yaml
GF_GRAFANA_NET_INSTANCE_NAME: "analytics.3-9-11.com"
GF_SERVER_ROOT_URL: "https://analytics.3-9-11.com/"
```

# Copy from repository to server:

```shell
scp -r * azureuser@48.209.17.70:/home/azureuser/server
```

# Boot the services

```shell
docker-compose up -d

# or
# docker-compose restart
```

