# Modern Quiz Platform 🚀

A full-stack, role-based quiz application built with **Spring Boot** and **Docker**, featuring a stunning modern UI with glassmorphism aesthetics. Recruiters can create dynamic quizzes manually or auto-generate them using an external API, while students can join using a unique access code.

## ✨ Features

- **Dual Role System:** Separate dashboards for Recruiters and Students.
- **Dynamic Quiz Creation:** 
  - **Manual:** Add custom questions with text, options, and correct answers.
  - **Auto-Generate:** Instantly fetch questions from the **Open Trivia Database API** based on Topic, Difficulty, and Amount.
- **Unique Access Codes:** Every quiz gets a 5-character code for students to join.
- **Modern UI:** Responsive design using CSS Glassmorphism, smooth gradients, and micro-animations.
- **Containerized:** Fully Dockerized for consistent deployment.
- **In-Memory Storage:** Fast performance using concurrent data structures.

## 🛠️ Technologies Used

- **Backend:** Java, Spring Boot (REST API), Maven
- **Frontend:** HTML5, CSS3 (Vanilla), JavaScript (ES6+)
- **DevOps:** Docker, Docker Desktop
- **External API:** Open Trivia Database

## 🚀 How to Run Locally

### Prerequisites
- Java 17 or higher
- Maven
- Docker Desktop (Optional but recommended)

### Method 1: Using Maven
1. Clone the repository:
   ```bash
   git clone https://github.com/imsatviro9/modern-quiz-app.git
   cd modern-quiz-app
   ```
2. Build and run:
   ```bash
   mvn clean package
   mvn spring-boot:run
   ```
3. Access at `http://localhost:8080`

### Method 2: Using Docker (Recommended)
1. Build the image:
   ```bash
   docker build -t quiz-app .
   ```
2. Run the container:
   ```bash
   docker run -d -p 8081:8080 --name quiz-app-web quiz-app
   ```
3. Access at `http://localhost:8081`

## 🌐 Deployment

This project is optimized for deployment on **Render** or **Railway**.
1. Push your code to GitHub.
2. Connect your repository to Render.
3. Render will automatically detect the `Dockerfile` and deploy the service.

---

Built with ❤️ by [imsatviro9](https://github.com/imsatviro9)
