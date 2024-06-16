# Getting Started

A simple task management application built with NodeJs, Express, Typescript, EJS, Prisma, and PostgreSQL. This application allows users to create, read, update, and delete tasks. It also includes user registration and authentication, as well as role-based access control.

## Prerequisites
- Postgres (Not required if running using Docker)
- Node.js
- Docker
- Docker Compose

## Running app (Using Docker)
To run the app, use `docker-compose up`. Make sure you have docker installed in your machine.

## Installing

1.  Clone the repository to your local machine.
2.  Install the dependencies by running npm install.
3.  Copy the .env.example file to a new file named .env and fill in the necessary environment variables.
4.  Run the Prisma migrations to set up your database schema. This can be done by running npx prisma migrate dev.

## Running the Application

1.  Start PostgreSQL with PORT `5432`  (No need if running already)
2.  Start the application by running npm run dev. This will start the application in development mode with hot-reloading enabled.
3.  The application will be available at http://localhost:3000 (<PORT> with the port number specified in your .env file).

## Features

- User registration and authentication
- Role-based access control
- Task management (create, read, update, delete tasks)
- User management (for admins)
