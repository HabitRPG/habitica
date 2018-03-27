If you need to use a migration from this folder, move it to /migrations.

Note that /migrations files (excluding /archive) are linted, so to pass test you'll have to make sure
that the file is written correctly.

They might also be using some old deps that we don't use anymore like Bluebird, mongoskin, ...