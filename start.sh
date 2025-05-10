#!/bin/sh

# Run migrations
echo "Running database migrations..."
yarn typeorm migration:run -d dist/config/typeorm.config.js

# Start the application
echo "Starting the application..."
node dist/main.js 