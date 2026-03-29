# Housing Rental Microservices Platform

Monorepo architecture using Java 21, Spring Boot 3.x, React 18, PostgreSQL, RabbitMQ, and Docker.

## Architecture
- **Config Server (8888)**: Centralized configuration source.
- **Eureka Server (8761)**: Service discovery mechanism.
- **API Gateway (8080)**: Entry point to backend microservices.
- **Auth Service (8081)**: Authentication, Role management, JWT Provider.
- **User Service (8082)**: User Profile management.
- **Listing Service (8083)**: Property listings management.
- **Booking Service (8084)**: Reservations and bookings.
- **Notification Service (8085)**: Event consumption and logging.
- **Frontend (80)**: React + Vite + Tailwind CSS Application.

## Environment Variables
Before running, copy the example environment file:
```bash
cp .env.example .env
```

## Running the Application
To boot up the entire microservice ecosystem with a single command:
```bash
docker-compose up -d --build
```

You can track the startup health status of all containers:
```bash
docker-compose ps
```

## Useful URLs
- Eureka Dashboard: http://localhost:8761
- RabbitMQ Management: http://localhost:15672 (guest/guest)
- Application Frontend: http://localhost
