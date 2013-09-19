# HabitRPG Docs Project

Generated documentation for all of HabitRPG's source files will be kept in the folder and subfolders. If you would like to use the existing documentation, or contribute to the documentation efforts, read on.

## Viewing Docs

All documentation is generated into HTML files in the `docs/` folder. After you have cloned the HabitRPG repo locally, make sure it is readable by your webserver and navigate to documentation directory

Example using MAMP:
````
http://localhost:8888/habitrpg/documentation/docs/
````

Then click on the file you want to view. Done.

## What I do now?

Well if you know Markdown, simply add detailed comments in the code using Markdown syntax. 

````
// ### Mongoose Update Object
  // We want to know *every* time an object updates. Mongoose uses __v to designate when an object contains arrays which
  // have been updated (http://goo.gl/gQLz41), but we want *every* update
  _v: {
    type: Number,
    'default': 0
  }, ....
````

All comments need to be on their own line. Thus this won't work:

`text: String, // example: Wolf `

This will:

````
// example: Wolf
text: String,
````

Add anything that would be helpful to a developer regarding how to use the functions, variables, and objects associated with HabitRPG.

**All documentation should be committed as pull request to the `docs project` branch of HabitRPG.** Since we are adding comments directly to the code, I don't want to be editing files used for beta or master. We can merge in the docs after we're sure we didn't break anything. 

## Okay, I added great comments. Now what?

Now the source files need to be run through [Docco](http://jashkenas.github.io/docco/).

This is the Generator we are using for now. It's pretty basic, but it gets the job done. Most of the documentation generators out there use Markdown, so it wouldn't be hard to switch to another one, should we choose to down the road.

### Requirements

Install Docco: `sudo npm install -g docco`

### Generating

Docco needs to be ran on each source file. For now we are focusing on .js, although we may do the same thing with .css/scss in the future. 

Currently, Docco needs to be ran manually. [As of Sept 19th, 2013] There are only 4 commands that need to be run to generate documentation for every source file.

All commands need to be ran from the `documentation/` directory. 
````
docco -c docco.css ../src/*.js
docco -c docco.css ../src/models/*.js
docco -c docco.css ../src/controllers/*.js
docco -c docco.css ../src/routes/*.js
````
This will place the generated html files into the `docs/` directory.

Of course, you only need to run docco on the files you have changed.

**Make sure to include the `-c docco.css` bit!** I tweaked the default css a bit so that the lines and heading match up better. Without this docco will overwrite it with it's own. 

## Road Map

- Generate documentation automagickly using grunt task
- Change default css, so `-c docco.css` attribute isn't needed
- Add support for CSS documentation