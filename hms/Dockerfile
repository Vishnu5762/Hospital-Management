# Stage 1: Build the Application
FROM eclipse-temurin:21-jdk-jammy AS builder

# Set the working directory inside the container
WORKDIR /app

# --- CRITICAL FIX: Install Maven ---
# Update package list and install maven
RUN apt-get update && apt-get install -y maven 
# -----------------------------------

# Copy the Maven project file and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy the rest of the source code
COPY src ./src

# Package the application into a single executable JAR file
RUN mvn clean install -DskipTests

# Stage 2: Create the Final Production Image (JRE only)
FROM eclipse-temurin:21-jre-jammy AS production

# Set the working directory in the final image
WORKDIR /usr/app

ARG JAR_FILE=target/*.jar

# Copy the executable JAR from the builder stage
COPY --from=builder /app/${JAR_FILE} app.jar

ENV PORT 8092

# The entrypoint command to run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
