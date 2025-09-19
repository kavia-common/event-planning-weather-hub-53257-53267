#!/bin/bash
cd /home/kavia/workspace/code-generation/event-planning-weather-hub-53257-53267/event_planner_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

