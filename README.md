Habitica [![Build Status](https://travis-ci.org/HabitRPG/habitrpg.svg?branch=develop)](https://travis-ci.org/HabitRPG/habitrpg) [![Code Climate](https://codeclimate.com/github/HabitRPG/habitrpg.svg)](https://codeclimate.com/github/HabitRPG/habitrpg) [![Coverage Status](https://coveralls.io/repos/HabitRPG/habitrpg/badge.svg?branch=develop)](https://coveralls.io/r/HabitRPG/habitrpg?branch=develop) [![Bountysource](https://api.bountysource.com/badge/tracker?tracker_id=68393)](https://www.bountysource.com/trackers/68393-habitrpg?utm_source=68393&utm_medium=shield&utm_campaign=TRACKER_BADGE)
===============

[Habitica](https://habitica.com) is an open source habit building program which treats your life like a Role Playing Game. Level up as you succeed, lose HP as you fail, earn money to buy weapons and armor.

We need more programmers! Your assistance will be greatly appreciated.

For an introduction to the technologies used and how the software is organized, refer to [Contributing to Habitica](http://habitica.wikia.com/wiki/Contributing_to_Habitica#Coders_.28Web_.26_Mobile.29) - "Coders (Web & Mobile)" section.

To set up a local install of Habitica for development and testing, see [Setting up Habitica Locally](http://habitica.wikia.com/wiki/Setting_up_Habitica_Locally), which contains instructions for Windows, *nix / Mac OS, and Vagrant.

Then read [Guidance for Blacksmiths](http://habitica.wikia.com/wiki/Guidance_for_Blacksmiths) for additional instructions and useful tips.

## Debug Scripts

In the `./debug-scripts/` folder, there are a few files. Here's a sample:

```bash
grant-all-equipment.js
grant-all-mounts.js
grant-all-pets.js
```

You can run them by doing:

```bash
node debug-scripts/name-of-script.js
```

If there are more arguments required to make the script work, it will print out the usage and an explanation of what the script does.
