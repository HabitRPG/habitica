Habitica ![Build Status](https://github.com/HabitRPG/habitica/workflows/Test/badge.svg) [![Code Climate](https://codeclimate.com/github/HabitRPG/habitrpg.svg)](https://codeclimate.com/github/HabitRPG/habitrpg) [![Bountysource](https://api.bountysource.com/badge/tracker?tracker_id=68393)](https://www.bountysource.com/trackers/68393-habitrpg?utm_source=68393&utm_medium=shield&utm_campaign=TRACKER_BADGE)
===============

[Habitica](https://habitica.com) is an open-source habit-building program that treats your life like a role-playing game. Level up as you succeed, lose HP as you fail, and earn money to buy weapons and armor.

**We need more programmers!** Your assistance will be greatly appreciated. The wiki pages below and the additional pages they link to will tell you how to get started on contributing code and where you can go to seek further help or ask questions:
* [Guidance for Blacksmiths](https://habitica.fandom.com/wiki/Guidance_for_Blacksmiths) - an introduction to the technologies used and how the software is organized.
* [Setting up Habitica Locally](https://habitica.fandom.com/wiki/Setting_up_Habitica_Locally) - how to set up a local install of Habitica for development and testing on various platforms.

Habitica's code is licensed as described at https://github.com/HabitRPG/habitica/blob/develop/LICENSE

**Found a bug?** Please report it to [admin email](mailto:admin@habitica.com) rather than creating an issue (an admin will advise you if a new issue is necessary; usually it is not).

**Have any questions about Habitica or its community?** See the links in the [habitica.com](https://habitica.com) website's Help menu or drop in to [Guilds > Tavern Chat](https://habitica.com/groups/tavern) to ask questions or chat socially!

## Dev environment description
To set up dev environment please walk through above "Setting up Habitica Locally".
Information below are related to development, project setup, and project code-specifics.

### Git hooks
To improve code quality and rise feedback loop more efficient you can setup pre-push hooks.
Hook will execute eslint verification without fixing.
Eslint errors are restricted on pipeline level, so to reduce time for a feedback you can incorporate it in development stage.
#### Setup hook
From terminal/power shel execute script from
```
.\scripts\setup-pre-commit-scipts.sh
```
#### Skipping git hubs
If you would like to skip pre-push hook you can push with additional parameter. Anyway there is no possibility to skip linter on GitHub actions
`git push --no-verify`

### Test reports
All tests generate HTML report with coverage. So after test you are able to check coverage status as static HTML page.
Reports after tests execution are stored under `./coverage/<suite name>` folder.
