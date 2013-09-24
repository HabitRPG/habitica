HabitRPG
===============

[HabitRPG](https://habitrpg.com) is an open source habit building program which treats your life like a Role Playing Game. Level up as you succeed, lose HP as you fail, earn money to buy weapons and armor.

Built using Angular, Express, Mongoose, Jade, Stylus, Grunt and Bower.
     
# Set up HabitRPG locally 

**Windows** users should skip this section and read the one below with Windows-specific steps.

Before starting make sure to have [MongoDB](http://www.mongodb.org/), [NodeJS and npm](http://nodejs.org/) and [Git](https://help.github.com/articles/set-up-git) installed and set up.

1. [Fork the repository](https://help.github.com/articles/fork-a-repo) on your computer.
1. Checkout the **develop** branch where all the development happens:
`git checkout -b develop origin/develop`
1. Install **grunt-cli** npm package globally (on some systems you may need to add `sudo` in front of the command below):
`npm install -g grunt-cli bower`
1. Install the **npm** and **bower** packages:
`npm install`
1. Create a config file from the example one:
`cp config.json.example config.json`

##  Windows Environment Install

1. Set up MongoDB.  Steps:
  1.  Download the latest production release of MongoDB from: http://www.mongodb.org/downloads
  1.  Extract the zip file to the desired application directory.  Example:  c:\apps\mongodb-win32-x86_64-2.4.6
  1.  Rename the folder from mongodb-win32-x86_64-2.4.6 to mongodb
  1.  Create a data\db directory under the application directory.  Example:  c:\apps\mongodb\data\db
  1.  Start up MongoDB using the following command:
  'c:\apps\mongodb\bin\mongod.exe --dbpath c:\apps\mongodb\data'

If MongoDB starts up successfully, you should see the following at the end of the logs:
```Sun Sep 01 18:10:21.233 [initandlisten] waiting for connections on port 27017
Sun Sep 01 18:10:21.233 [websvr] admin web console waiting for connections on po
rt 28017```
  
1.  Install  Node.js (includes npm).  Steps:
  1.  Download and run the latest Node.js msi installation file from  http://nodejs.org/download/
1. Install [Git](https://help.github.com/articles/set-up-git).
1. [Fork the repository](https://help.github.com/articles/fork-a-repo) on your computer.
1. Checkout the **develop** branch where all the development happens:
`git checkout -b develop origin/develop`
1. Install the **npm** packages:
`npm install`
Read below for possible error message.
  
You might receive the following error during the 'npm install' command:
> habitrpg@0.0.0-152 postinstall C:\Users\022498\Projects\habitrpg
> ./node_modules/bower/bin/bower install -f
'.' is not recognized as an internal or external command,
operable program or batch file.
npm ERR! weird error 1
npm ERR! not ok code 0

Ignore this error and proceed with the following:

1. Install **grunt-cli** and **bower** npm packages globally
'npm install -g grunt-cli bower'
1. Install the **bower** packages:
'bower install -f'
1. Create a config file from the example one:
`copy config.json.example config.json`

# Run HabitRPG

HabitRPG uses [Grunt](http://gruntjs.com) as its build tool.

`grunt run:dev` compiles the **Stylus** files and start a web server.

It uses [Nodemon](https://github.com/remy/nodemon) and [grunt-contrib-watch](https://github.com/gruntjs/grunt-contrib-watch) to automatically restart the server and re-compile the files when a change is detected.

**Open a browser to URL http://localhost:3000 to test the application!**

# Technologies discussion

1. Angular, Express, Mongoose. Awesome, tried technologies. Read up on them.
1. Stylus, Jade - big debate.
  1. Jade. We need a server-side templating language so we can inject variables (`res.locals` from Express). Jade is great
     because the "significant whitespace" paradigm protects you from HTML errors such as missing or mal-matched close tags,
     which has been a pretty common error from multiple contribs on Habit. However, it's not very HTML-y, and makes people mad.
     We'll re-visit this conversation after the rewrite is done.
  1. Stylus. We're either staying here or moving to LESS, but vanilla CSS isn't cutting it for our app.
