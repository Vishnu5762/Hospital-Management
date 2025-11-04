# Stage 1: Build the Application
# Use the JDK 21 base image on the JAMMY distribution (standard for Temurin 21)
FROM eclipse-temurin:21-jdk-jammy AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy the Maven project file and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy the rest of the source code
COPY src ./src

# Package the application into a single executable JAR file
RUN mvn clean install -DskipTests

# Stage 2: Create the Final Production Image
# Use the lighter JRE 21 image on the JAMMY distribution
FROM eclipse-temurin:21-jre-jammy AS production

# Set the working directory in the final image
WORKDIR /usr/app

# Argument to define the name of the built JAR file
ARG JAR_FILE=target/*.jar

# Copy the executable JAR from the builder stage
COPY --from=builder /app/${JAR_FILE} app.jar

# Define the port the application will listen on
ENV PORT 8092

# The entrypoint command to run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
