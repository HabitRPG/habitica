Shared resources useful for the multiple HabitRPG repositories, that way all the repositories remain in-sync with common charactaristics. Includes things like:
 * Assets - sprites, images, etc
 * CSS - especially, esp. sprite-sheet mapping
 * Algorithms - level up algorithm, scoring functions, etc
 * Item definitions - weapons, armor, pets

Note: We can't load CommonJS format into the browser. There's a way to pull it in with RequireJS (r.js?), but I couldn't get that working. Instead I created a `Makefile` which runs Browserify to compile `index-browser.js`, which you include in a `<script/>` tag in your index.html. Let's fix this sometime.

##Installation
 * `npm install`
 * `make`

##CSS
Shared CSS between the website and the mobile app is a fuzzy area. For now we'll have the website define canonical CSS, and share that down the mobile app.

To do so,
 * go to the website repo
 * remove the first line `@import nib/vendor` from index.styl
 * `stylus styles/app/index.styl`
 * copy the output index.css into this shared/css directory
 * remove bootstrap @improrts, find/replace "img/" with "../img/"