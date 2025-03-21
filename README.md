# Project Setup Instructions

This README provides a step-by-step guide to setting up and running the project. Please follow the instructions carefully to ensure that the project is set up correctly.

## Prerequisites

Before you begin, make sure you have the following installed on your system:

- Git
- Yarn
- Docker
- Node v16.\*

You will also need a file ekip-google-creds.json to get the access to firebase.

## Setup Instructions

1. **Clone the Repository:**

   Use Git to clone the repository to your local machine. Navigate to the directory where you want to clone the project and run:

```bash
git clone https://github.com/dunia-app/carte-verte.git
```

2. **Install Dependencies:**

Navigate to the project directory and install the necessary dependencies using Yarn:

```bash
cd carte-verte
yarn install
```

3. **Set Up Docker Containers:**

Run Docker containers for Postgres and Redis. Ensure Docker is running on your system, then execute the following commands:

```bash
docker compose up
```

4. **Create a Database:**

Create a new database in your Postgres container. You can do this using a GUI tool or via the command line.

```bash
docker exec -it postgres psql -U postgres -c "CREATE DATABASE ekip_db;"
```

5. **Configure Environment Variables:**

Set up the required environment variables for your project. This typically involves creating a `.env` file in the root of your project directory and filling it with necessary key-value pairs. Refer to the project's documentation for the specific variables you need to set.

6. **Build the Project:**

Compile the project using Yarn:

```bash
yarn build
```

7. **Run Database Migrations:**

Apply the database migrations to structure your database correctly:

```bash
yarn typeorm migration:run
```

8. **Run Additional Migrations and Seeding:**

Execute any additional migration tasks and seed the database with initial data if required:

```bash
yarn task migrate
yarn seed
```

9. **Start the Project:**

Launch the project in debug mode using Yarn:

```bash
yarn debug
```

Ensure everything is running correctly and test the setup.

10. **Some useful links:**

Change the base url with the chosen server and port

To access GraphQL playground : http://localhost:5001/graphql

11. **Documentation:**

To generate the typedoc of the project :

```bash
yarn typedoc
```

12. **Docker**

To run using docker, first build the image

```bash
docker build -t carte-verte-service .
```

Then run the container

```bash
docker run -e NODE_ENV=development -p 127.0.0.1:5001:5001 carte-verte-service
```

## Troubleshooting

If you encounter any issues during setup, please ensure that all prerequisites are correctly installed and that all steps have been followed accurately. Check the project's documentation for common problems and solutions.

## Conclusion

Following these steps should set up the project environment properly. If you have any questions or need further assistance, please consult the project's documentation or reach out to the support team.
