FROM node:8

# Install global packages
RUN npm install -g gulp-cli mocha

# Clone Habitica repo and install dependencies
RUN mkdir -p /usr/src/habitrpg
WORKDIR /usr/src/habitrpg
RUN git clone https://github.com/HabitRPG/habitica.git /usr/src/habitrpg
RUN cp config.json.example config.json
RUN npm install

# Create Build dir
RUN mkdir -p ./website/build

# Start Habitica
EXPOSE 3000
CMD ["npm", "start"]
