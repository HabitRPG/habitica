Shared resources useful for the multiple HabitRPG repositories, that way all the repositories remain in-sync with common charactaristics. Includes things like:
 * Assets - sprites, images, etc
 * CSS - especially, esp. sprite-sheet mapping
 * Algorithms - level up algorithm, scoring functions, etc
 * Item definitions - weapons, armor, pets

Note: We can't load CommonJS format into the browser. There's a way to pull it in with RequireJS (r.js?), but I couldn't get that working. Instead I created a `Makefile` which runs Browserify to compile `index-browser.js`, which you include in a `<script/>` tag in your index.html. Let's fix this sometime.

##Installation
 * `npm install`
 * `make`