# Testing Habitica with Selenium

## Setup
To set up the project, you will need to install Selenium Webdriver, specifically Chromedriver. Place `chromedriver.exe` in the project folder.<br>

In the project folder, run the command `npm install` to install all the dependencies.

## To run the tests
Haibitca must be running locally first (See Habitica repo)\
`npm test`

## Manual setups
To properly run the Selenium tests, some configurations must be made manually on the app:

- Create an account on the local instance. Put the credentials in `config.json`, following the `config.json.example` format.

- Purchase a sword and leather armor. Equip the sword but not the leather armor.

- Create your own party for the test account.

- Have at least one habit with the negative enabled

- Send at least one message to your own test account. This allows the messaging tests to be run.

- Guilds: Create 2 bronze tier guilds but no gold tier. Create a guild with 'local' in its name.