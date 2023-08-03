# url-monitoring-api

A dockerized uptime monitoring RESTful API server that allows authenticated users to monitor URLs, and get detailed
uptime reports about their availability, average response time, and total uptime/downtime.

# Overview

- Signup with email verification.
- CRUD operations for URL checks (GET, PUT and DELETE can be called only by the user who created the check).
- Authenticated users can get detailed uptime reports about their URLs availability, average response time, and total
  uptime/downtime.
- Authenticated users can group their checks by tags and get reports by tag.
- Stateless authentication using JWT.
- APIs consume and produce application/json.

# Setup

## Local Setup

### To run this project locally on your machine:

### Add the following environment variables to your .env file:

**Server Config**

- PORT : The port number on which the server will listen.
- NODE_ENV : The environment in which the server is running (development, production).

**Database Config**

- DB_URL : The URL or connection string for the database.

**Token Config**

- JWT_SECRET : The secret key used to sign authentication tokens.
- JWT_EXPIRATION : The expiration duration for authentication tokens.

**Email Config**

- SENDGRID_USERNAME : The username of your SendGrid integration.
- SENDGRID_PASSWORD : The password of your SendGrid integration.
- EMAIL_FROM : The authenticated SendGrid email that sends the mail.

### Clone the project:

```
git clone https://github.com/3bdElsamea/url-monitoring-api.git
```

### Go to the project directory:

```
cd url_monitoring_api
```

### Run the server:

**For production environment use:**

```
npm start
```

**For development environment use:**

```
npm run dev
```

## Running the Docker image

1. Download the repo
2. Go to the project directory
3. Run the following command in the terminal:

```
docker-compose -f docker-compose.yml up
```

# API Documentation