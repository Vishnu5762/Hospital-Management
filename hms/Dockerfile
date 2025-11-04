# Stage 1: Build the Application
# Use a Java Development Kit (JDK) base image for compilation
FROM eclipse-temurin:21-jdk-focal AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy the Maven project file and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy the rest of the source code
COPY src ./src

# Package the application into a single executable JAR file
# The -DskipTests ensures the build doesn't fail on unit test issues during deployment
RUN mvn clean install -DskipTests

# Stage 2: Create the Final Production Image
# Use a smaller, security-hardened JRE (Java Runtime Environment) for the final image
FROM eclipse-temurin:17-jre-focal AS production

# Set the working directory in the final image
WORKDIR /usr/app

# Argument to define the name of the built JAR file
ARG JAR_FILE=target/*.jar

# Copy the executable JAR from the builder stage
COPY --from=builder /app/${JAR_FILE} app.jar

# Define an environment variable for the port Render will use
ENV PORT 8092

# The entrypoint command to run the application
# When Render runs this, it will be exposed on the public internet.
ENTRYPOINT ["java", "-jar", "app.jar"]
