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
#RUN npm run client:build
RUN gulp build:prod

CMD npm start & npm run client:dev & wait

# Porta Frontend
EXPOSE 8080

# Porta Backend
EXPOSE 3000

# docker build . -t qwasolucoes-hackathon
# docker run -d --name qwa-habitica -p 3000:3000 -p 8080:8080 qwasolucoes-hackathon:latest
