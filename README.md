Shared resources useful for the multiple HabitRPG repositories, that way all the repositories remain in-sync with common characteristics. Includes things like:
 * Assets - sprites, images, etc
 * CSS - especially, esp. sprite-sheet mapping
 * Algorithms - level up algorithm, scoring functions, etc
 * Item definitions - weapons, armor, pets 

##Installation
* `npm install`
* `grunt` - after you're done and you want to create the dist files

* Node.js
    * `require ('coffee-script')`
    * `var shared = require('./index.js')` or `require('./script/algos.coffee')` if you only need one file.
* Browser
    * Use `<script/>` tag to include ./dist/habitrpg-shared.js it will export `window.habitrpgShared` object.
    * // Use `browser.debug.js' if you want to have sourcemaps. - EDIT: Only one file now, and it has sourcemaps. Fix this


* Note how to invoke scoring function:
  * algos.score = function (user, task, direction) {}

##CSS
Shared CSS between the website and the mobile app is a fuzzy area. Spritesheets definitely go in habitrpg-shared (since mobile
uses them too). Other things, like customizer buttons, *may* want to go here? As you find sharable components, (1) move them
from the website into habitrpg-shared, (2) remove from website & make sure all html/css references are updated.