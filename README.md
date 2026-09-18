# 🚗 AutoCare CRM

A full-stack vehicle service and booking management system designed to help automobile service centers manage customers, vehicles, bookings, mechanics, service records, subscriptions, notifications, and administrative operations through a centralized platform.

## 📌 Overview

AutoCare CRM is a web-based vehicle service management system built using **React.js** for the frontend and **Spring Boot** for the backend.

The platform provides role-based access for different users such as customers, mechanics, administrators, and super administrators. It streamlines vehicle service bookings, mechanic assignment, service management, notifications, reporting, and subscription-related operations.

## ✨ Key Features

### 👤 Authentication & Authorization

* User registration and login
* JWT-based authentication
* Role-based access control
* Protected frontend routes
* Secure backend APIs using Spring Security

### 🚘 Vehicle Management

* Add and manage customer vehicles
* Store vehicle-related information
* Maintain vehicle service records

### 📅 Booking Management

* Create vehicle service bookings
* View upcoming bookings
* Manage booking history
* Cancel bookings
* Assign mechanics to service bookings
* Track booking status

### 🔧 Mechanic Management

* Add and manage mechanics
* Assign mechanics to bookings
* Monitor mechanic workload
* View mechanic performance information

### 📊 Admin Dashboard

* Booking management
* Customer management
* Mechanic management
* Service management
* Reports and analytics
* Task management
* Notifications

### 👑 Super Admin

* Manage administrators
* Manage subscriptions
* Review subscription and renewal requests
* Monitor system-level operations

### 📧 Notifications & Email

* Email-based notifications
* Booking reminders
* Subscription expiry notifications
* SMTP-based email integration

### 💳 Subscription Management

* Subscription-based SaaS structure
* Subscription management for service centers
* Renewal request handling
* Subscription expiry tracking

## 🏗️ Project Architecture

```text
                    ┌──────────────────────┐
                    │      React.js        │
                    │      Frontend        │
                    └──────────┬───────────┘
                               │
                         REST APIs / HTTP
                               │
                               ▼
                    ┌──────────────────────┐
                    │     Spring Boot      │
                    │       Backend        │
                    └──────────┬───────────┘
                               │
                    ┌──────────┴───────────┐
                    │                      │
                    ▼                      ▼
             ┌─────────────┐       ┌──────────────┐
             │   MongoDB   │       │  SMTP Email  │
             │   Database  │       │    Service   │
             └─────────────┘       └──────────────┘
```

## 🛠️ Tech Stack

### Frontend

* React.js
* JavaScript
* JSX
* React Router
* Axios
* Tailwind CSS
* HTML5
* CSS3

### Backend

* Java
* Spring Boot
* Spring Security
* JWT
* Spring Data MongoDB
* REST APIs
* Maven

### Database

* MongoDB

### Tools & Platforms

* Git
* GitHub
* Eclipse
* Visual Studio Code
* Postman

## 📂 Project Structure

```text
AutoCare-CRM/
│
├── autocare-frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   ├── package.json
│   └── package-lock.json
│
├── autocare-crm/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   └── test/
│   ├── pom.xml
│   ├── mvnw
│   └── mvnw.cmd
│
├── .gitignore
└── README.md
```

## ⚙️ Getting Started

### Prerequisites

Make sure the following are installed:

* Java 17 or later
* Node.js and npm
* MongoDB
* Maven
* Git

### 1. Clone the Repository

```bash
git clone https://github.com/sumedhaCode/AutoCare-CRM.git
cd AutoCare-CRM
```

### 2. Backend Setup

Navigate to the backend:

```bash
cd autocare-crm
```

Copy the example configuration and add your local credentials:

```bash
copy src\main\resources\application-example.properties src\main\resources\application.properties
```

Default MongoDB URI:

```text
mongodb://localhost:27017/autocare_db
```

Then start the Spring Boot application:

```bash
mvn spring-boot:run
```

The backend runs on:

```text
http://localhost:8080
```

### 3. Frontend Setup

Open another terminal and navigate to:

```bash
cd autocare-frontend
```

Install dependencies:

```bash
npm install
```

Start the React development server:

```bash
npm start
```

The frontend will normally run on:

```text
http://localhost:3000
```

### Demo logins

These accounts are created automatically on first backend startup:

| Role | Email | Password |
| --- | --- | --- |
| Super Admin | superadmin@gmail.com | Superadmin@123 |
| Garage Admin | garage.admin@gmail.com | Admin@123 |
| Staff / Mechanic | staff.demo@gmail.com | Staff@123 |
| Customer | user.demo@gmail.com | User@123 |

## 🔐 Environment & Security

Sensitive configuration files are intentionally excluded from version control.

Do not commit:

* Database passwords
* JWT secrets
* Email passwords
* API keys
* Environment-specific credentials

Use `application-example.properties` as a template for configuring the application locally.

## 🔄 Git Workflow

To update the project after making changes:

```bash
git status
git add .
git commit -m "Describe your changes"
git push
```

## 🚀 Future Enhancements

* SMS notification integration
* Subscription-based SaaS improvements
* Online payment integration
* Advanced analytics and reporting
* Cloud deployment
* Automated CI/CD pipeline
* Mobile application
* Customer service history analytics

## 👩‍💻 Author

**Sumedha Dehankar**

GitHub: [@sumedhaCode](https://github.com/sumedhaCode)

## 📄 License

This project is developed for educational, portfolio, and project demonstration purposes.
