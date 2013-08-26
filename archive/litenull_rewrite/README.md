HabitRPG Rewrite
===============

HabitRPG Rewrite under development. Built using Angular.

**Note: This branch is under development, and these instructions may fall out of date. They were accurate as of August 5, 2013.** Should you encounter this, join #habitrpg on IRC (Freenode) and talk to litenull.

The general steps are:

1. Set up and run the [server](https://github.com/lefnire/habitrpg/wiki/Running-Locally-%28Server%29)
1. Clone the repo
1. Install all dependencies
1. Run the client

Or, expressed in commands on the command line:

1. `git clone --branch angular_rewrite git://github.com/lefnire/habitrpg habitrpg-angular`
1. `npm install`
1. `bower install` (if you don't have `bower`, do `npm install -g bower` — might need `sudo`)
1. `node server.js`

To access the site, open http://localhost:3003 in your browser.