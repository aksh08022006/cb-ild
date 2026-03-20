#!/bin/bash

# CB-ILD Quick Start Script
# This script runs everything needed to start the app locally

echo "🚀 CB-ILD Local Startup Script"
echo "======================================"

# Step 1: Check if Docker is installed
echo ""
echo "📦 Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed!"
    echo "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

echo "✅ Docker found: $(docker --version)"

# Step 2: Check if docker-compose works
echo ""
echo "📦 Checking docker-compose..."
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed!"
    echo "Docker Desktop should include docker-compose. Restart Docker Desktop and try again."
    exit 1
fi

echo "✅ docker-compose found: $(docker-compose --version)"

# Step 3: Navigate to project
echo ""
echo "📂 Navigating to project directory..."
cd /Users/akshkaushik/Downloads/cb-ild
if [ $? -ne 0 ]; then
    echo "❌ Could not navigate to project directory"
    exit 1
fi
echo "✅ In directory: $(pwd)"

# Step 4: Start docker-compose
echo ""
echo "🐳 Starting Docker containers (this may take 3-5 minutes)..."
echo "⏳ Downloading images, building backend and frontend..."
echo ""

docker-compose up --build

# After containers stop
echo ""
echo "🛑 Containers stopped"
echo ""
echo "To restart without rebuild:"
echo "  docker-compose up"
echo ""
echo "To stop containers:"
echo "  docker-compose down"
