# Use an official Ubuntu as a parent image
FROM ubuntu:22.04

# Avoid interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Update and install essential build tools
# Removed libgtest-dev for now
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . .

# Create a build directory and compile the project
# Note: Ensure your CMakeLists.txt doesn't try to find GTest or build tests!
RUN mkdir -p build && cd build && \
    cmake .. && \
    make

# Set the default command to run the main application
CMD ["./build/ProductRecommendation"]