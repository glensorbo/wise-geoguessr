# 🌐 REST

HTTP request files for testing the API with [kulala.nvim](https://github.com/mistweaverco/kulala.nvim).

## 📁 Files

| File                | Routes                                                                                                                                                                      |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `health.http`       | `GET /healthcheck`                                                                                                                                                          |
| `user.http`         | `GET /api/user`, `POST /api/user`, `GET /api/user/:id`, `DELETE /api/user/:id`, `PATCH /api/user/:id/role`, `POST /api/user/:id/reset-password`, `PATCH /api/user/:id/name` |
| `auth.http`         | `POST /api/auth/login`, `POST /api/auth/create-user`, `POST /api/auth/set-password`, `POST /api/auth/change-password`, `POST /api/auth/refresh`, `POST /api/auth/logout`    |
| `telemetry.http`    | `POST /api/telemetry/traces`                                                                                                                                                |
| `results.http`      | `GET /api/results/years`, `GET /api/results?year=YYYY`, `GET /api/results/:roundId`, `POST /api/results`                                                                    |
| `hall-of-fame.http` | `GET /api/hall-of-fame`                                                                                                                                                     |

## 📝 Request bodies

### `POST /api/results`

| Field      | Type     | Required | Description                                             |
| ---------- | -------- | -------- | ------------------------------------------------------- |
| `date`     | `string` | ✅       | `YYYY-MM-DD` format                                     |
| `scores`   | `object` | ✅       | `{ playerName: score }` — at least one entry            |
| `gameLink` | `string` | —        | Valid URL linking to the GeoGuessr challenge (optional) |

## ⚙️ Environment

Kulala uses `http-client.env.json` for environment variables. This file is **gitignored** (it may contain real tokens). Copy the example to get started:

```sh
cp rest/http-client.env.json.example rest/http-client.env.json
```

Then fill in your values. Switch environments in Neovim with kulala's env switcher.

| Variable       | Description                                                  |
| -------------- | ------------------------------------------------------------ |
| `BASE_URL`     | Server base URL                                              |
| `JWT_TOKEN`    | Bearer auth token for authenticated routes                   |
| `SIGNUP_TOKEN` | Short-lived signup token returned by `/api/auth/create-user` |
| `USER_ID`      | UUID of a user — used in `/api/user/:id`                     |
| `ROUND_ID`     | UUID of a round — used in `/api/results/:roundId`            |

To get a `JWT_TOKEN` for local dev, call `POST /api/auth/login` with the seeded admin credentials. Copy the returned `token` into `http-client.env.json`.

## 🚀 Usage

Open any `.http` file and use your kulala keybinds to send requests. Place the cursor inside a request block and trigger the send action.
