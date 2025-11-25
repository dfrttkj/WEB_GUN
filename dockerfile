# Use a lightweight Node.js image
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Ensure the logs directory exists
RUN mkdir -p logs

# Expose the port
EXPOSE 8080

# Start the application
CMD ["node", "server.js"]