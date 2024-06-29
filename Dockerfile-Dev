FROM node:20

# Install global packages
RUN npm install -g gulp-cli mocha

# Copy package.json and package-lock.json into image
WORKDIR /usr/src/habitica
COPY ["package.json", "package-lock.json", "./"]
# Copy the remaining source files in.
COPY . /usr/src/habitica
# Install dependencies
RUN npm install
RUN npm run postinstall
RUN npm run client:build
RUN gulp build:prod
