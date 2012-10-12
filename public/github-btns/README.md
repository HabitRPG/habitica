UNOFFICIAL GITHUB BUTTONS
=========================

Showcase your GitHub (repo's) success with these three simple, static buttons featuring dynamic watch, fork and follower counts and a link to your GitHub repo or profile page.

To get started, checkout http://ghbtns.com!



Usage
-----

These buttons are hosted via GitHub Pages, meaning all you need to do is include an iframe and you're set. Once included, you can configure it with various options. Here's the include:

``` html
<iframe src="http://ghbtns.com/github-btn.html?user=USERNAME&repo=REPONAME&type=BUTTONTYPE"
  allowtransparency="true" frameborder="0" scrolling="0" width="62px" height="20px"></iframe>
```

### Requirements

`user`<br>
GitHub username that owns the repo<br>

`repo`<br>
GitHub repository to pull the forks and watchers counts

`type`<br>
Type of button to show: `watch` or `fork` or `follow`

### Optional

`count`<br>
Show the optional watchers or forks count: *none* by default or `true`

`size`<br>
Optional flag for using a larger button: *none* by default or `large`



Examples
--------

**Basic Watch button**

``` html
<iframe src="http://ghbtns.com/github-btn.html?user=markdotto&repo=github-buttons&type=watch"
  allowtransparency="true" frameborder="0" scrolling="0" width="62px" height="20px"></iframe>
```

**Basic Fork button**

``` html
<iframe src="http://ghbtns.com/github-btn.html?user=markdotto&repo=github-buttons&type=fork"
  allowtransparency="true" frameborder="0" scrolling="0" width="53px" height="20px"></iframe>
```

**Basic Follow button**

``` html
<iframe src="http://ghbtns.com/github-btn.html?user=markdotto&type=follow"
  allowtransparency="true" frameborder="0" scrolling="0" width="132px" height="20px"></iframe>
```

**Watch with count**

``` html
<iframe src="http://ghbtns.com/github-btn.html?user=markdotto&repo=github-buttons&type=watch&count=true"
  allowtransparency="true" frameborder="0" scrolling="0" width="110px" height="20px"></iframe>
```

**Fork with count**

``` html
<iframe src="http://ghbtns.com/github-btn.html?user=markdotto&repo=github-buttons&type=fork&count=true"
  allowtransparency="true" frameborder="0" scrolling="0" width="95px" height="20px"></iframe>
```

**Follow with count**

``` html
<iframe src="http://ghbtns.com/github-btn.html?user=markdotto&type=follow&count=true"
  allowtransparency="true" frameborder="0" scrolling="0" width="165px" height="20px"></iframe>
```

**Large Watch button with count**

``` html
<iframe src="http://ghbtns.com/github-btn.html?user=markdotto&repo=github-buttons&type=watch&count=true&size=large"
  allowtransparency="true" frameborder="0" scrolling="0" width="170px" height="30px"></iframe>
```

Limitations
-----------

For the first version, functionality is limited and some concessions were made:

- Width and height must be specificed for all buttons (which actually adds some control for those with OCD like myself).
- All attributes must be passed through via URL parameters.
- CSS and javascript are all included in the same HTML file to reduce complexity and requests.

More refinement and functionalty is planned with open-sourcing--any help is always appreciated!



Bug tracker
-----------

Have a bug? Please create an issue here on GitHub at https://github.com/markdotto/github-buttons/issues.



Twitter account
---------------

Keep up to date on announcements and more by following Mark on Twitter, <a href="http://twitter.com/mdo">@mdo</a>.



Authors
-------

**Mark Otto**

+ http://twitter.com/mdo
+ http://github.com/markdotto



Copyright and license
---------------------

Copyright 2011 Mark Otto.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this work except in compliance with the License.
You may obtain a copy of the License in the LICENSE file, or at:

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.