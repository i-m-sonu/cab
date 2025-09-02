#!/bin/bash

# Start Backend Server
echo "Starting backend server..."
cd backend
PORT=4000 node server.js &
BACKEND_PID=$!

# Start Frontend Server  
echo "Starting frontend server..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo "Backend running on port 4000 (PID: $BACKEND_PID)"
echo "Frontend running on port 3000 (PID: $FRONTEND_PID)"
echo "Press Ctrl+C to stop both servers"

# Wait for user interrupt
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
