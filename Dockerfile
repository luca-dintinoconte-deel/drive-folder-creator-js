# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
# If you are building your code for production
# RUN npm ci --only=production
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 8080

# Define environment variable for PORT (optional, Cloud Run sets this)
ENV PORT=8080

# Command to run the application
CMD [ "npm", "start" ]
