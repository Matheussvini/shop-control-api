# Use an official Node.js runtime as the base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install
# Copy the rest of the application code to the working directory
COPY . .
# Start the application
CMD ["sh", "-c", "npm run migration:run && npx prisma generate && npm run seed && npm start"]
# Expose a port (replace 3000 with your desired port)
EXPOSE 5002
