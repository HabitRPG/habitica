# HabitRPG Docs Project

Generated documentation for all of HabitRPG's source files will be kept in the folder and subfolders. If you would like to use the existing documentation, or contribute to the documentation efforts, read on.

## Viewing Docs

You're looking at it! 

Unless you are viewing this file directly from GitHub, you should see a list of files and folders to the left of this readme. 

If you are working locally, you can goto `localhost:3000/docs/` and view the Docs. 

All documentation is generated from comments in the code, into HTML files in the `public/docs/` folder. After you have cloned the HabitRPG repo locally, and done all the `npm install` goodness, the Docs should generate automagickly when you run `grunt run:dev`

## What I do now?

Well if you know Markdown, simply add detailed comments in the code using Markdown syntax. 

````
/* 
User.js
=======

Defines the user data model (schema) for use via the API.
*/

// Dependencies
// ------------
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var helpers = require('habitrpg-shared/script/helpers');
var _ = require('lodash');....
````

As you can see, you can use both multiline style comments `/* fancy stuff */` and inline comments `// Ooooh my`. 

The exception being end of line comments  
`text: String, // example: Wolf `

The above will not be on the "pretty print" side of the Docs, but will stay in the code. An example use case for end of line comments would be for FIXME notes.

Add anything that would be helpful to a developer regarding how to use the functions, variables, and objects associated with HabitRPG.

**All documentation should be committed as pull request to the `docs-project` branch of HabitRPG.** Since we are adding comments directly to the code, I don't want to be editing files used for beta or master. We can merge in the docs after we're sure we didn't break anything. 

### jsDoc Syntax

Yes, the generator also supports jsDoc-style comments such as  
````
@param {Array} files Array of file paths relative to the `inDir` to generate documentation for.
````

**Important Note:** If you use the `@param` syntax, you must use multiline comment blocks (ie `/* stuff */`), otherwise they won't be parsed like parameters.

This may or may not be useful for HabitRPG. Example use cases:  
- Documenting the API  
- Javascript Models

## Okay, I added great comments. Now what?

If you're running locally, just re-run `grunt run:dev`. Any changed docs will be automagickly updated.

Once you're satisfied with the output, push your changes to your fork of HabitRPG and issue a Pull Request on the `docs-project` branch. 

It's that easy!

## Tech Info

The generator we are using is [Docker](https://github.com/jbt/docker), which is a fork of [Docco](http://jashkenas.github.io/docco/). Docker supports the same wide-range of filetypes, including being able to generate documentation for a whole project, including an index.

We also use the [Grunt-Docker](https://github.com/Prevole/grunt-docker) node module for automatic processing.

## Road Map

- Customize CSS with HabitRPG specific Styling  
- Explore possibilities of importing Wiki content  
- Specify style guide for consistency of comments  