Shared resources useful for the multiple HabitRPG repositories, that way all the repositories remain in-sync with common charactaristics. Includes things like:
 * Assets - sprites, images, etc
 * CSS - especially, esp. sprite-sheet mapping
 * Algorithms - level up algorithm, scoring functions, etc
 * Item definitions - weapons, armor, pets 

##Installation
`npm install`
`make`

* Node.js
    * `require ('coffee-script')`
    * `var shared = require('./index.js')` or `require('./script/algos.coffee')` if you only need one file.
* Browser
    * Use `<script/>` tag to include ./browser/browser.js it will export `window.habitrpgShared` object.


* Note how to invoke scoring function:
 * algos.score = function (user, task, direction) {}

##CSS
Shared CSS between the website and the mobile app is a fuzzy area. For now we'll have the website define canonical CSS, and share that down the mobile app.

To do so,
 * go to the website repo
 * remove the first line `@import nib/vendor` from index.styl
 * `stylus styles/app/index.styl`
 * copy the output index.css into this shared/css directory
 * remove bootstrap @improrts, find/replace "img/" with "../img/"