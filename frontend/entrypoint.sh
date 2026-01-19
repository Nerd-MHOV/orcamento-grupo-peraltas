#!/bin/sh

# Replace placeholders in config.js with actual environment variables
envsubst '${VITE_API_URL} ${VITE_PATH_IMAGES_BUDGET} ${VITE_PATH_IMAGES}' < /app/dist/config.js.template > /app/dist/config.js

# Start the server
exec serve -s dist -l 3000
