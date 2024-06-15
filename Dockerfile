# Use the official Node.js image as base
FROM node:22.2.0-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install --force

# Copy the rest of the application code to the working directory
COPY . .

# Expose port 3000
EXPOSE 3000

CMD ["./startup.sh"]
