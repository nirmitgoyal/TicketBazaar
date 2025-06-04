#!/bin/bash

# Run tests for the Ticket Bazaar application

echo "Starting Ticket Bazaar tests..."

# Make sure server is running
if ! curl -s http://localhost:5000/api/events > /dev/null; then
  echo "Server not running. Please start the server with 'npm run dev' first."
  exit 1
fi

# Run the reviews test
echo "Running reviews system tests..."
node run-test-reviews.js

echo "All tests completed!"