Shared resources useful for the multiple HabitRPG repositories, that way all the repositories remain in-sync with common charactaristics. Includes things like:
 * Assets - sprites, images, etc
 * CSS - especially, esp. sprite-sheet mapping
 * Algorithms - level up algorithm, scoring functions, etc
 * Item definitions - weapons, armor, pets 

##Browserify Usage (TODO fix up this documentation to use old browserify setup)
The `Makefile` runs Browserify to compile `index-browser.js`, which you include in a `<script/>` tag in your index.html. This way, you get all the JS min/concat'd
 * `npm install`
 * `make`

##Installation

* Node.js
    * "npm install coffee-script" to be able to require CS
    * "npm install requirejs" to enable loading of AMD type modules within indicated subfolder
    * Configure requirejs module as observerd in examples/node.js/server.js
    * run "node server" from within "examples/node.js" folder (it should output message in CAPS to console.log)
* Browser - use require.js with "cs" plugin to include algos.coffee directly into your index.html
    * See examples/browser folder.
    * Run plain http-server from within "examples/browser" folder and point your browser to index.html to see how it works. (it should output message in CAPS to console.log)
 
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