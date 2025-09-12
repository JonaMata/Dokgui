# Dokgui

A GUI and http git server for Dokku.

## Install

This repo can be directly within dokku.

### Prerequisites

You should have configured dokku with a working global domain using:
```bash
dokku domains:add-global yourdokkudomain.com
dokku domains:set-global yourdokkudomain.com
```

### Configuration
1.  Create a dokku app for Dokgui using:
    ```bash
    dokku apps:create dokgui
    ```
3.  Set the following environment variables on the `dokgui` app:
    ```bash
    dokku config:set dokgui DOKKU_SSH_HOST=<ip of dokku host> DOKKU_SSH_PORT=<ssh port of dokku host>
    ```
4.  Create persistant storage for Dokgui:
    ```bash
    dokku storage:ensure-directory dokgui
    dokku storage:mount dokgui /var/lib/dokku/data/storage/dokgui:/app/.data
    ```

### Deploy

Deploy this repo to dokku using:
```bash
git push dokku@<dokku host ip>:dokgui main
```

### Success

Dokgui should now be reachable on dokgui.yourdokkudomain.com

## Development / Local testing

For testing and development purposes, Dokgui can be run locally.

### Configuration

Add a `.env` file defining your Dokku host IP and SSH port:

```.env
DOKKU_SSH_HOST=you.dokku.ip
DOKKU_SSH_PORT=22
```

### Setup

Make sure to install dependencies:

```bash
npm install
```

### Database migration

Run the necessary database migrations using:

```bash
npm run db:migrate
```

### Development Server

Start the development server on `http://localhost:3000`:

```bash
npm run dev
```


