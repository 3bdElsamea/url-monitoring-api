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

### ```Fill the environment variables in the .env.example file```

### ```and rename it to .env ```

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

- Download the repo
- Go to the project directory
- Run the following command in the terminal:

```
docker-compose -f docker-compose.yml up
```

# API Documentation

## User Routes

- **POST /api/auth/signup** : Sign up with email verification.
- **POST /api/auth/login** : Login with credentials to obtain authentication token.
- **GET /api/auth/verify-email/:token** : Verify email using the verification token.
- **POST /api/auth/resend-email-verification** : Resend email verification link.
- **GET /api/auth/me** : Get the authenticated user's Profile details.
- **PATCH /api/auth/me** : Update the authenticated user's Profile details.

## Url Checks Routes

- **GET /api/checks**: Get all URL checks for the authenticated user.
- **POST /api/checks**: Create a new URL check for the authenticated user.
- **GET /api/checks/:id**: Get details of a specific URL check.
- **PATCH /api/checks/:id**: Update a specific URL check for the authenticated user.
- **DELETE /api/checks/:id**: Delete a specific URL check for the authenticated user.

## Report Routes

- **GET /api/reports**: Get all uptime reports for the authenticated user.
- **POST /api/reports/tags**: Group uptime reports by url check tags for the authenticated user.
- **GET /api/reports/:checkId**: Get uptime report for a specific URL check.

# Postman Workspace Documentation

## User Authentication

[![User Authentication](https://run.pstmn.io/button.svg)](https://documenter.getpostman.com/view/25931255/2s9Xxwxa49)

## Url Checks

[![Url Checks](https://run.pstmn.io/button.svg)](https://documenter.getpostman.com/view/25931255/2s9Xxwxa4B)

## Reports

[![Reports](https://run.pstmn.io/button.svg)](https://documenter.getpostman.com/view/25931255/2s9Xxwxa4E)