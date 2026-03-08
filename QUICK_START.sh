#!/bin/bash

echo "=================================="
echo "  SAFETY PLATFORM - QUICK START"
echo "=================================="
echo ""

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama is not installed"
    echo ""
    echo "Please install Ollama first:"
    echo "  curl -fsSL https://ollama.com/install.sh | sh"
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo "✓ Ollama is installed"

# Check if Ollama is running
if ! curl -s http://localhost:11434/api/tags &> /dev/null; then
    echo "   Ollama is not running"
    echo ""
    echo "Starting Ollama in the background..."
    ollama serve &
    sleep 5
fi

echo "✓ Ollama is running"

# Check if model is installed
if ! ollama list | grep -q "phi3:mini"; then
    echo "   Model 'phi3:mini' not found"
    echo ""
    read -p "Download phi3:mini model? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Downloading phi3:mini model (this may take a few minutes)..."
        ollama pull phi3:mini
    else
        echo "Please download a model manually:"
        echo "  ollama pull phi3:mini"
        echo "  ollama pull phi3:mini.2"
        echo "  ollama pull tinyllama"
        exit 1
    fi
fi

echo "✓ Model is available"

# Navigate to backend directory
cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo ""
    echo "Installing dependencies..."
    npm install
fi

echo "✓ Dependencies installed"

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo ""
    echo "Creating .env file..."
    cp .env.example .env
    echo "✓ .env file created"
fi

echo ""
echo "=================================="
echo "  SETUP COMPLETE!"
echo "=================================="
echo ""
echo "Starting the server..."
echo ""

npm run dev
