#!/bin/bash

# CB-ILD Quick Start Script
# GSoC 2026 - Mifos Credit Bureau Information Lifecycle Dashboard

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "🚀 CB-ILD Quick Start Setup"
echo "Project Directory: $PROJECT_DIR"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}▶${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check prerequisites
print_step "Checking prerequisites..."

# Check Docker
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    print_success "Docker found: $DOCKER_VERSION"
else
    print_error "Docker not found. Install from https://www.docker.com"
    exit 1
fi

# Check Docker Compose
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    print_success "Docker Compose found: $COMPOSE_VERSION"
else
    print_warning "Docker Compose not found. Trying 'docker compose'..."
    if docker compose --version &> /dev/null; then
        print_success "Docker Compose (V2) available"
    else
        print_error "Docker Compose not found. Install from https://www.docker.com/products/docker-desktop"
        exit 1
    fi
fi

# Determine which docker compose command to use
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
else
    DOCKER_COMPOSE_CMD="docker compose"
fi

echo ""
print_step "Select setup option:"
echo "1) Docker Setup (Recommended - all services in containers)"
echo "2) Manual Setup (Local development)"
echo "3) Backend Only (Manual)"
echo "4) Frontend Only (Manual)"
echo ""
read -p "Enter choice [1-4]: " SETUP_CHOICE

case $SETUP_CHOICE in
    1)
        print_step "Starting Docker setup..."
        echo ""
        print_warning "Stopping existing containers..."
        $DOCKER_COMPOSE_CMD down 2>/dev/null || true
        
        print_step "Building and starting services..."
        cd "$PROJECT_DIR"
        $DOCKER_COMPOSE_CMD up --build -d
        
        echo ""
        print_step "Waiting for services to start... (30 seconds)"
        sleep 30
        
        echo ""
        print_step "Checking service health..."
        
        # Check MySQL
        if $DOCKER_COMPOSE_CMD exec -T mysql mysqladmin ping -h localhost &> /dev/null; then
            print_success "MySQL is running"
        else
            print_error "MySQL failed to start"
        fi
        
        # Check Backend
        if curl -s http://localhost:8080/api/health &> /dev/null; then
            print_success "Backend is running"
        else
            print_warning "Backend still starting... (check logs with: docker logs cbild-backend)"
        fi
        
        echo ""
        print_success "Docker setup complete!"
        echo ""
        echo "📱 Access the application:"
        echo "  Frontend:   ${BLUE}http://localhost:4200${NC}"
        echo "  Backend:    ${BLUE}http://localhost:8080${NC}"
        echo "  Swagger UI: ${BLUE}http://localhost:8080/swagger-ui.html${NC}"
        echo ""
        echo "🔐 Default Credentials:"
        echo "  Admin:        admin / admin123"
        echo "  KYC Officer:  kyc_officer / kyc123"
        echo "  Analyst:      analyst / analyst123"
        echo "  Compliance:   compliance / comply123"
        echo ""
        echo "📊 Useful commands:"
        echo "  View logs:    $DOCKER_COMPOSE_CMD logs -f"
        echo "  Stop:         $DOCKER_COMPOSE_CMD down"
        echo "  Restart:      $DOCKER_COMPOSE_CMD restart"
        ;;
        
    2)
        print_step "Starting manual setup..."
        echo ""
        print_warning "Prerequisites needed:"
        echo "  ✓ Java 17+   (java -version)"
        echo "  ✓ Maven 3.9+ (mvn -version)"
        echo "  ✓ Node 18+   (node -v)"
        echo "  ✓ MySQL 8.0  (running on localhost:3306)"
        echo ""
        
        read -p "Do you have all prerequisites installed? (y/n) " -n 1 -r
        echo ""
        
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "Please install prerequisites and run again"
            exit 1
        fi
        
        # Verify Java
        if command -v java &> /dev/null; then
            JAVA_VERSION=$(java -version 2>&1 | head -1)
            print_success "Java: $JAVA_VERSION"
        else
            print_error "Java not found"
            exit 1
        fi
        
        # Verify Maven
        if command -v mvn &> /dev/null; then
            MVN_VERSION=$(mvn -version 2>&1 | head -1)
            print_success "Maven: $MVN_VERSION"
        else
            print_error "Maven not found"
            exit 1
        fi
        
        # Verify Node
        if command -v node &> /dev/null; then
            NODE_VERSION=$(node -v)
            print_success "Node: $NODE_VERSION"
        else
            print_error "Node not found"
            exit 1
        fi
        
        echo ""
        echo "Continuing with backend and frontend setup..."
        echo "Run these commands in separate terminals:"
        echo ""
        echo "Terminal 1 (Backend):"
        echo "  cd \"$PROJECT_DIR/backend\""
        echo "  mvn clean install -DskipTests"
        echo "  mvn spring-boot:run"
        echo ""
        echo "Terminal 2 (Frontend):"
        echo "  cd \"$PROJECT_DIR/frontend\""
        echo "  npm install"
        echo "  npm start"
        echo ""
        print_success "Manual setup instructions printed"
        ;;
        
    3)
        print_step "Backend-only setup..."
        cd "$PROJECT_DIR/backend"
        
        if command -v java &> /dev/null; then
            print_success "Building backend..."
            mvn clean install -DskipTests
            print_success "Starting backend..."
            mvn spring-boot:run
        else
            print_error "Java not found"
            exit 1
        fi
        ;;
        
    4)
        print_step "Frontend-only setup..."
        cd "$PROJECT_DIR/frontend"
        
        if command -v npm &> /dev/null; then
            print_success "Installing dependencies..."
            npm install
            print_success "Starting frontend..."
            npm start
        else
            print_error "Node/npm not found"
            exit 1
        fi
        ;;
        
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

echo ""
print_success "Setup script completed!"
