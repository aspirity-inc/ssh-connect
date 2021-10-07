# SSH Connect

Server for exposing local web server to the public using a SSH client.

## Is it like [ngrok](https://ngrok.com/) or [localtunnel](https://localtunnel.me)?

Yes, but not exactly.

SSH Connect is not a SaaS for everyone to use.
SSH Connect is a server you should deploy on your infrastructure.

Another noticeable difference is that SSH Connect does not require some special client to connect.
You just use any SSH client with a support of [a remote port forwarding](https://www.ssh.com/academy/ssh/tunneling/example#remote-forwarding) and it works.

It is as simple as

```bash
ssh -R 0:localhost:3000 h4k3r@connect.example.com
```

and you have your web server on the port 3000 reachable at `h4k3r.connect.example.com`.

## Installation

SSH Connect is distributed as a docker image.

```bash
docker pull ghcr.io/aspirity-ru/ssh-connect:edge
```

See [deploy documentation](./docs/deploy/readme.md) for more information.

## Configuration

### Volumes

#### `traefik-configs` (directory, required)

Location where to store generated configurations.
This directory should be available for traefik to listen for files changes.

**Path**: /app/traefik-configs

#### `keys` (directory, required)

Server requires one or more private keys in order to handle connections.

**Path**: /app/keys

#### `passphrases` (directory, required)

Provided private keys may be passphrase protected. Passphrase file will be matched by
key filename. If passphrase file is missing server tries to process key as it
does not have passphrase.

**Path**: /app/passphrases

### Environment variables

#### `PUBLIC_HOST` (required)

Base hostname for exposed connection. Note that you should have
DNS records for both `<PUBLIC_HOST>` and `*.<PUBLIC_HOST>`

**Warning**: IP addresses are not supported, because connections are exposed as
an extra-level domain which is not possible in case of IP address as a hostname.

**Examples:**

- `connect.example.com`
- `connect.example.com:33333` (can be with port if needed)

#### `SERVER_HOST` (required)

This hostname is used to resolve connection from
webserver (traefik) to SSH Connect server.

**Examples:**

- `ssh-connect` (as service name in docker compose)
- `host.docker.internal` (mostly for local development)
- `172.12.0.122` (supported too if you know what you are doing)

#### `CONNECTION_PASSWORD`

Password for SSH connection.

**Warning**: If not provided anonymous access provided.

#### `CONNECTION_PASSWORD_FILE`

For security reasons you may not want to provide [`CONNECTION_PASSWORD`](#CONNECTION_PASSWORD) as a variable.
You can use secrets and provide path to the file in `CONNECTION_PASSWORD_FILE`.

**Examples:**

- `/run/secrets/ssh-password`

#### `TRAEFIK_ENTRY_POINTS`

By default generated routers listen on every Traefik's EntryPoint.
Use `TRAEFIK_ENTRY_POINTS` to limit what EntryPoints to use.
More details in [Router's EntryPoints configuration](https://doc.traefik.io/traefik/routing/routers/#entrypoints).

**Examples:**

- `web443`
- `http,https` (support for multiple values, comma separated)
