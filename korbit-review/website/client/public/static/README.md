The files in the following subfolders:

- audio
- emails
- icons
- merch
- presskit

are not processed by Webpack so their filenames don't get hashed, but given that they almost never change, they're still cached for 1 week.

In case one of the files needs to be updated the filename should be changed if possible.

For more information see `website/server/middlewares/static.js`.