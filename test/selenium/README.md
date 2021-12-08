# Testing Habitica with Selenium
This folder adds selenium testing to Habitica.

## Setup
To set up the project, you will need to install Selenium Webdriver, specifically Chromedriver. Place `chromedriver.exe` in the project folder.<br>

In the project folder, run the command `npm install` to install all the dependencies.<br>

For most consistent results, minimize inventory and other things added to the game/account.

## To run the tests
Haibitca must be running locally first (See Habitica repo)\
Run the command `npm test`

## Manual setups
To properly run the Selenium tests, some configurations must be made manually on the app. You can disable or comment out some of the tests to avoid some of these requirements:

- Create an account on the local instance. Put the credentials in `config.json`, following the `config.json.example` format.

- Make sure the popup for the welcome back dailies has been closed.

- The account must be (opted in as) a Warrior and at least level 10. The account should have mana as a result of opting in. You can use the settings page to change the account's level and class.

- Purchase a sword and leather armor. Equip the sword but not the leather armor. (Needed for inventory test)

- Inventory should have at least one chocolate and slime quest. (Needed for shop and quest tests)

- Use the violet background for the account profile. (Needed for inventory test)

- Create your own party for the test account. Do not have give the party a quest. (Needed for party, challenge, and quest tests)

- Have at least one habit with the negative enabled. (Needed for task tests)

- Send at least one message to your own test account. This allows the messaging tests to be run. (Needed for message test)

- Guilds: Create 1 private guild for the test account. Give it the creativity category. There should be only one guild to be listed under "My guilds". (Needed for guild test)

### Common Issues and Solutions
- Flakiness: increase the wait between loads and selenium events
- Sometimes, you just need to run the tests again.
- Check if the account is setup with the correct conditions (see above). Sometimes these settings are inadvertently changed.
- Make sure account and local server set up properly
- Delete newly created messages and items to reduce loading times
- There is currently an issue with guild categories, which is why the test is disabled on the repo