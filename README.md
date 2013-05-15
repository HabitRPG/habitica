Shared resources useful for the multiple HabitRPG repositories, that way all the repositories remain in-sync with common charactaristics. Includes things like:
 * Assets - sprites, images, etc
 * CSS - especially, esp. sprite-sheet mapping
 * Algorithms - level up algorithm, scoring functions, etc
 * Item definitions - weapons, armor, pets


##Installation
 * Node.js - just include files as usual.
 * Browser - user requre.js with "cs" plugin to include files directly into your index.html

#TODO add and example of require.js config.

##CSS
Shared CSS between the website and the mobile app is a fuzzy area. For now we'll have the website define canonical CSS, and share that down the mobile app.

To do so,
 * go to the website repo
 * remove the first line `@import nib/vendor` from index.styl
 * `stylus styles/app/index.styl`
 * copy the output index.css into this shared/css directory
 * remove bootstrap @improrts, find/replace "img/" with "../img/"