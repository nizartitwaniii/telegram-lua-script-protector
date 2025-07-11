FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json
COPY package.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . .

# Create scripts directory
RUN mkdir -p scripts

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "index.js"]
