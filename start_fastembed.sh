#!/bin/bash

echo "Starting FastEmbed Local Embedding Server..."
echo "Installing dependencies..."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Start the server
echo "Starting server on http://localhost:8000"
python fastembed_server.py
