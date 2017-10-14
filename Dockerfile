FROM node:boron

# Upgrade NPM to v5 (Yarn is needed because of this bug https://github.com/npm/npm/issues/16807)
# The used solution is suggested here https://github.com/npm/npm/issues/16807#issuecomment-313591975
RUN yarn global add npm@5
# Install global packages
RUN npm install -g gulp mocha

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
