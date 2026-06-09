# Use an official, lightweight Node.js base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy dependency configuration files first to leverage Docker layer caching
COPY package*.json ./

# Install all dependencies (including devDependencies like Vite and react-router-dom)
RUN npm install

# Copy the rest of the React application source code into the container
COPY . .

# Expose Vite's default development port
EXPOSE 5173

# Run Vite dev server and expose it to the local network using --host
CMD ["npm", "run", "dev", "--", "--host"]