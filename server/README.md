# Sunflower API

This repository contains the source for the SunflowerTrip API built with [Express](https://expressjs.com/). It exposes endpoints for authentication, trip planning, destinations, contacts and other related resources.

## Requirements

- [Node.js](https://nodejs.org/) (version 18 or later recommended)
- A running MySQL instance

## Installation

1. Install dependencies using npm:
   ```bash
   npm install
   ```
2. Create a `.env` file in the repository root with your configuration (see below).

## Environment variables

The application uses a number of environment variables which should be placed in a `.env` file.

| Variable | Description |
|----------|-------------|
| `DB_HOST` | MySQL host |
| `DB_PORT` | MySQL port |
| `DB_USER` | MySQL user |
| `DB_PASS` | MySQL password |
| `DB_NAME` | MySQL database name |
| `JWT_SECRET` | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens |
| `FRONTEND_URL` | Base URL of the frontend used for OAuth callbacks |
| `GOOGLE_CLIENT_ID` | Google OAuth client id |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `TRUECALLER_CLIENT_ID` | Truecaller OAuth client id |
| `TRUECALLER_CLIENT_SECRET` | Truecaller OAuth client secret |
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP server port |
| `SMTP_SECURE` | `true` if the SMTP server requires TLS/SSL |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `SMTP_FROM` | Default `from` address for outgoing mail |
| `PORT` | (optional) Port for the Express server, defaults to `3000` |

You can generate random secrets for the JWT variables using the helper script:

```bash
node scripts/generateSecrets.js
```

## Running the server

Start the API after installing dependencies and creating your `.env` file:

```bash
npm start
```

The server listens on `http://localhost:3000` by default (or on the port defined by `PORT`).
