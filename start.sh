#!/bin/sh

if [ $1 = "production" ]; then
	echo "Starting production server";
	grunt production;
else
	echo "Starting development server";
	grunt development;
fi

node ./src/server.js