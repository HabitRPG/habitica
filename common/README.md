# Common

Shared resources useful for the multiple Habitica repositories, that way all the repositories remain in-sync with common characteristics. Includes things like:

 * Assets - sprites, images, etc
 * CSS - especially, esp. sprite-sheet mapping
 * Algorithms - level up algorithm, scoring functions, etc
 * View helper functions that may come in handy for multiple client MVCs
 * Item definitions - weapons, armor, pets 

## Compiling spritesheets
Because of some wonkiness with Heroku, the spritesheet compilation is not part of the production build process and must be done manually when new images are added by running: 

``` bash
npm run sprites
```
