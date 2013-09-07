HabitRPG Rewrite
===============

HabitRPG Rewrite under development. Built using Angular, Express, Mongoose, Jade, Stylus, Coffeescript.

**Note: This branch is under development, and these instructions may fall out of date. They were accurate as of August 5, 2013.** Should you encounter this, join #habitrpg on IRC (Freenode) and talk to litenull.

Before starting install [MongoDB](http://www.mongodb.org/) and [NodeJS](http://nodejs.org/)

The general steps are:

1. Clone the repo
1. Install the global dependencies
1. Install all dependencies
1. Run the client

Or, expressed in commands on the command line:

1. `git clone --recursive -b angular_rewrite https://github.com/lefnire/habitrpg.git`
1. 'npm install -g grunt-cli' (you may need to add `sudo` in front of it)
1. `cd habitrpg && npm install`
1. `grunt run:dev`

To access the site, open http://localhost:3000 in your browser.

There are a few other Grunt task avalaible:

- `grunt build:dev` - Compile, concat and minify Stylus files
- `grunt build:prod` - Same as `grunt build:dev` but concat and minify Javascript files.
- `grunt nodemon` - Start the server with **nodemon**, restart when a file change but without compiling Stylus files

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
     
#  Windows Environment Install

1. Set up MongoDB.  Steps:
  1.  Download the latest production release of MongoDB from: http://www.mongodb.org/downloads
  1.  Extract the zip file to the desired application directory.  Example:  c:\apps\mongodb-win32-x86_64-2.4.6
  1.  Rename the folder from mongodb-win32-x86_64-2.4.6 to mongodo
  1.  Create a data\db directory under the application directory.  Example:  c:\apps\mongodb\data\db
  1.  Start up MongoDB using the following command:
	'c:\apps\mongodb\bin\mongod.exe --dbpath c:\apps\mongodb\data'

If MongoDB starts up successfully, you should see the following at the end of the logs:
Sun Sep 01 18:10:21.233 [initandlisten] waiting for connections on port 27017
Sun Sep 01 18:10:21.233 [websvr] admin web console waiting for connections on po
rt 28017
	
1.  Install  Node.js (includes npm).  Steps:
  1.  Download and run the latest Node.js msi installation file from  http://nodejs.org/download/
1.  Create a fork of the habitrpg repository on github under your own account  
1.  Install Git and download angular_rewrite code repository.  Steps:
  1.  Install latest stable version of Git, found here:  http://git-scm.com/downloads
    1.  Make sure to select "Run Git from the Windows Command Prompt" during the installation process
  1.  Open a command window.  Navigate to the location where you would like the project files to live.  Example:  c:\projects
  1.  Run git command to download angular_rewrite branch.
        'git clone --recursive -b angular_rewrite https://github.com/ezinaz/habitrpg.git'  (where 'ezinaz' is your account name)
  1.  Run 'cd habitrpg'
  1.  Create upstream remote:
  	'git remote add upstream https://github.com/lefnire/habitrpg.git'
  1.  Run 'git fetch upstream'
  1.  Run 'npm install'.  Read below for possible error message.
  
You might receive the following error during the 'npm install' command:
> habitrpg@0.0.0-152 postinstall C:\Users\022498\Projects\habitrpg
> ./node_modules/bower/bin/bower install -f
'.' is not recognized as an internal or external command,
operable program or batch file.
npm ERR! weird error 1
npm ERR! not ok code 0

Ignore this error and proceed with the following:

1.  Run 'npm install -g grunt-cli'
1.  Run 'npm install -g bower'
1.  Run 'bower install -f'
1.  Run 'copy config.json.example config.json'
1. `grunt run:dev`

Open a browser to URL http://localhost:3000 to test the application.








