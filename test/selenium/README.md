# Testing Habitica with Selenium

## Setup
To set up the project, you will need to install Selenium Webdriver, specifically Chromedriver. Place `chromedriver.exe` in the project folder.<br>

In the project folder, run the command `npm install` to install all the dependencies.

## To run the tests
Haibitca must be running locally first (See Habitica repo)\
In this directory, run `npm test`\
Or in the habitica directory, run `npm run test:selenium`

## Manual setups
Create an account on the local instance, if you haven't yet.\
To properly run the Selenium tests, some configurations must be made manually on the app.\
Create a file `config.json` in this directory, and follow the format in config.json.example. Replace the username and password fields with those of your local test account.\
If you're hosting Habitica on a different port or url, replace the `URL` field as well.