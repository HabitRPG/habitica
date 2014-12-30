[![Build Status](https://travis-ci.org/HabitRPG/habitrpg-shared.png?branch=master)](https://travis-ci.org/HabitRPG/habitrpg-shared)

## We're in the process of migraring this repository to the main HabitRPG repository, you can report any issue [here](https://github.com/HabitRPG/habitrpg).
Shared resources useful for the multiple HabitRPG repositories, that way all the repositories remain in-sync with common characteristics. Includes things like:
 * Assets - sprites, images, etc
 * CSS - especially, esp. sprite-sheet mapping
 * Algorithms - level up algorithm, scoring functions, etc
 * View helper functions that may come in handy for multiple client MVCs
 * Item definitions - weapons, armor, pets 

##Installation
* `npm install`
* `grunt` - after you've made modifications and want to compile the dist files for browser

* Node.js
    * `require ('coffee-script')`
    * `require('./script/algos.coffee')`, `require('./script/helpers.coffee')`, etc.
* Browser
    * Use `<script/>` tag to include ./dist/habitrpg-shared.js it will export `window.habitrpgShared` object.
    * // Use `browser.debug.js' if you want to have sourcemaps. - EDIT: Only one file now, and it has sourcemaps. Fix this

* Note how to invoke scoring function:
  * `algos.score(user, task, direction)`, etc
  * TODO document all the functions

##Tests
* `npm test`

##CSS
Shared CSS between the website and the mobile app is a fuzzy area. Spritesheets definitely go in habitrpg-shared (since mobile
uses them too). Other things, like customizer buttons, *may* want to go here? As you find sharable components, (1) move them
from the website into habitrpg-shared, (2) remove from website & make sure all html/css references are updated.

Currently, all or most spritesheets are available. They're in css/*.css, but that's not what you want. You want `/spritesheets.css`
which is the concat'd file (using `grunt`) which includes all the spritesheets. I'd prefer this be in /dist/spritesheets.css
for consistency, but it's having image referencing weirdness
