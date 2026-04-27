# Use an official Ubuntu as a parent image
FROM ubuntu:22.04

# Avoid interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Update and install essential build tools and GTest development files
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    libgtest-dev \
    && rm -rf /var/lib/apt/lists/*

# Compile Google Test (GTest) source code
# Ubuntu provides the source in /usr/src/gtest; we must compile it to libraries
RUN cd /usr/src/gtest && \
    cmake . && \
    make && \
    cp lib/*.a /usr/lib

# Set the working directory inside the container
WORKDIR /app

# Copy all project files into the container
COPY . .

# Create a build directory and compile both the App and the Tests
RUN mkdir -p build && cd build && \
    cmake .. && \
    make

# Default command to run the main application
CMD ["./build/ProductRecommendation"]