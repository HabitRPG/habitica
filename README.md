HabitRPG Rewrite
===============

HabitRPG Rewrite under development. Built using Angular, Express, Mongoose, Jade, Stylus, Coffeescript.

**Note: This branch is under development, and these instructions may fall out of date. They were accurate as of August 5, 2013.** Should you encounter this, join #habitrpg on IRC (Freenode) and talk to litenull.

The general steps are:

1. Clone the repo
1. Install all dependencies
1. Run the client

Or, expressed in commands on the command line:

1. `git clone --recursive -b angular_rewrite https://github.com/lefnire/habitrpg.git`
1. `cd habitrpg && npm install`
1. `npm start`

To access the site, open http://localhost:3000 in your browser.

# Technologies

1. Angular, Express, Mongoose. Awesome, tried technologies. Read up on them.
1. CoffeeScript, Stylus, Jade - big debate.
  1. Jade. We need a server-side templating language so we can inject variables (`res.locals` from Express). Jade is great
     because the "significant whitespace" paradigm protects you from HTML errors such as missing or mal-matched close tags,
     which has been a pretty common error from multiple contribs on Habit. However, it's not very HTML-y, and makes people mad.
     We'll re-visit this conversation after the rewrite is done.
  1. Stylus. We're either staying here or moving to LESS, but vanilla CSS isn't cutting it for our app.
  1. CoffeeScript. This is the hottest debate. I'm using it to rewrite, and Habit was written originally on CS. It's a
     fantastic language, but it's a barrier-to-entry for potential contribs who don't know it. Will also revisit right after
     the rewrite.
