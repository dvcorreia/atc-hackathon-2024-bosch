## Development

> [!NOTE]  
> **For an optimal developer experience, it is recommended to install [Nix](https://nixos.org/download.html) and [direnv](https://direnv.net/docs/installation.html).**

<details><summary><i>Installing Nix and direnv</i></summary><br>

**Note: These are instructions that _SHOULD_ work in most cases. Consult the links above for the official instructions for your OS.**

Install Nix:

```sh
sh <(curl -L https://nixos.org/nix/install) --daemon
```

Consult the [installation instructions](https://direnv.net/docs/installation.html) to install direnv using your package manager.

On MacOS:

```sh
brew install direnv
```

Install from binary builds:

```sh
curl -sfL https://direnv.net/install.sh | bash
```

The last step is to configure your shell to use direnv. For example for bash, add the following lines at the end of your `~/.bashrc`:

    eval "\$(direnv hook bash)"

**Then restart the shell.**

For other shells, see [https://direnv.net/docs/hook.html](https://direnv.net/docs/hook.html).

**MacOS specific instructions**

Nix may stop working after a MacOS upgrade. If it does, follow [these instructions](https://github.com/NixOS/nix/issues/3616#issuecomment-662858874).

<hr>
</details>

Otherwise, you can have the headaches yourself.


---

# Configure Server

## Confis to change:

`docker-compose.yaml`

```yaml
GF_GRAFANA_NET_INSTANCE_NAME: "analytics.3-9-11.com"
GF_SERVER_ROOT_URL: "https://analytics.3-9-11.com/"
```

## Copy from repository to server:

```shell
scp -r * azureuser@48.209.17.70:/home/azureuser/atc-hackathon-2024-bosch
```

## Boot the services

```shell
cd atc-hackathon-2024-bosch/server
docker-compose up -d

# or (if is already running)
# docker-compose restart
```
