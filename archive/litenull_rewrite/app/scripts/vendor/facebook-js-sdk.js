/*1329323125,171364642,JIT Construction: v510186,en_US*/

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 *
 * @provides fb.prelude
 */

/**
 * Prelude.
 *
 *     Namespaces are one honking great idea -- let's do more of those!
 *                                                            -- Tim Peters
 *
 * The Prelude is what keeps us from being messy. In order to co-exist with
 * arbitary environments, we need to control our footprint. The one and only
 * rule to follow here is that we need to limit the globals we introduce. The
 * only global we should every have is ``FB``. This is exactly what the prelude
 * enables us to do.
 *
 * The main method to take away from this file is `FB.copy()`_. As the name
 * suggests it copies things. Its powerful -- but to get started you only need
 * to know that this is what you use when you are augmenting the FB object. For
 * example, this is skeleton for how ``FB.Event`` is defined::
 *
 *   FB.provide('Event', {
 *     subscribe: function() { ... },
 *     unsubscribe: function() { ... },
 *     fire: function() { ... }
 *   });
 *
 * This is similar to saying::
 *
 *   FB.Event = {
 *     subscribe: function() { ... },
 *     unsubscribe: function() { ... },
 *     fire: function() { ... }
 *   };
 *
 * Except it does some housekeeping, prevents redefinition by default and other
 * goodness.
 *
 * .. _FB.copy(): #method_FB.copy
 *
 * @class FB
 * @static
 * @access private
 */
if (!window.FB) {
  window.FB = {
    // use the init method to set these values correctly
    _apiKey       : null,
    _authResponse : null,
    _userStatus   : 'unknown', // or 'notConnected' or 'connected'

    // logging is enabled by default. this is the logging shown to the
    // developer and not at all noisy.
    _logging: true,
    _inCanvas: (
      (window.name.indexOf('iframe_canvas') > -1) ||
      (window.name.indexOf('app_runner') > -1)),

    // Determines if we should use HTTPS when attempting cross-domain
    // communication with facebook.com. This is assumed to be the case when
    // window.name contains "_fb_https". This value may also be set by the
    // response from FB.login() or FB.getLoginStatus()
    _https: (window.name.indexOf('_fb_https') > -1),

    //
    // DYNAMIC DATA
    //
    // the various domains needed for using Connect
    _domain: {
      api            : 'https://api.facebook.com/',
      api_read       : 'https://api-read.facebook.com/',
      cdn            : 'http://static.ak.fbcdn.net/',
      https_cdn      : 'https://s-static.ak.fbcdn.net/',
      graph          : 'https://graph.facebook.com/',
      staticfb       : 'http://static.ak.facebook.com/',
      https_staticfb : 'https://s-static.ak.facebook.com/',
      www            : 'http://www.facebook.com/',
      https_www      : 'https://www.facebook.com/',
      m              : 'http://m.facebook.com/',
      https_m        : 'https://m.facebook.com/'
    },
    _locale: null,
    _localeIsRtl: false,
      

    // CORDOVA PATCH
    _nativeInterface : null,
      
    /**
     * Retrieve one of the various domains needed for Connect.
     *
     * @access private
     * @param domain   (String)  The domain to retrieve
     * @param noForcedHTTPS  (bool) Do not force https domain
     */
    getDomain: function(domain, noForcedHTTPS) {
      var forceHTTPS = !noForcedHTTPS &&
        (window.location.protocol == 'https:' || FB._https);
      switch (domain) {
        case 'api':
          return FB._domain.api;
        case 'api_read':
          return FB._domain.api_read;
        case 'cdn':
          return forceHTTPS ? FB._domain.https_cdn : FB._domain.cdn;
        case 'cdn_foreign':
          return FB._domain.cdn_foreign;
        case 'https_cdn':
          return FB._domain.https_cdn;
        case 'graph':
          return FB._domain.graph;
        case 'staticfb':
          return forceHTTPS ?  FB._domain.https_staticfb : FB._domain.staticfb;
        case 'https_staticfb':
          return FB._domain.https_staticfb;
        case 'www':
          return forceHTTPS ? FB._domain.https_www : FB._domain.www;
        case 'https_www':
          return FB._domain.https_www;
        case 'm':
          return forceHTTPS ? FB._domain.https_m : FB._domain.m;
        case 'https_m':
          return FB._domain.https_m;
      }
    },

    /**
     * Copies things from source into target.
     *
     * @access private
     * @param target    {Object}  the target object where things will be copied
     *                            into
     * @param source    {Object}  the source object where things will be copied
     *                            from
     * @param overwrite {Boolean} indicate if existing items should be
     *                            overwritten
     * @param transform  {function} [Optional], transformation function for
     *        each item
     */
    copy: function(target, source, overwrite, transform) {
      for (var key in source) {
        if (overwrite || typeof target[key] === 'undefined') {
          target[key] = transform ? transform(source[key]) :  source[key];
        }
      }
      return target;
    },

    /**
     * Create a namespaced object.
     *
     * @access private
     * @param name {String} full qualified name ('Util.foo', etc.)
     * @param value {Object} value to set. Default value is {}. [Optional]
     * @return {Object} The created object
     */
    create: function(name, value) {
      var node = window.FB, // We will use 'FB' as root namespace
      nameParts = name ? name.split('.') : [],
      c = nameParts.length;
      for (var i = 0; i < c; i++) {
        var part = nameParts[i];
        var nso = node[part];
        if (!nso) {
          nso = (value && i + 1 == c) ? value : {};
          node[part] = nso;
        }
        node = nso;
      }
      return node;
    },

    /**
     * Copy stuff from one object to the specified namespace that
     * is FB.<target>.
     * If the namespace target doesn't exist, it will be created automatically.
     *
     * @access private
     * @param target    {Object|String}  the target object to copy into
     * @param source    {Object}         the source object to copy from
     * @param overwrite {Boolean}        indicate if we should overwrite
     * @return {Object} the *same* target object back
     */
    provide: function(target, source, overwrite) {
      // a string means a dot separated object that gets appended to, or created
      return FB.copy(
        typeof target == 'string' ? FB.create(target) : target,
        source,
        overwrite
      );
    },

    /**
     * Generates a weak random ID.
     *
     * @access private
     * @return {String} a random ID
     */
    guid: function() {
      return 'f' + (Math.random() * (1<<30)).toString(16).replace('.', '');
    },

    /**
     * Logs a message for the developer if logging is on.
     *
     * @access private
     * @param args {Object} the thing to log
     */
    log: function(args) {
      if (FB._logging) {
        //TODO what is window.Debug, and should it instead be relying on the
        //     event fired below?
//#JSCOVERAGE_IF 0
        if (window.Debug && window.Debug.writeln) {
          window.Debug.writeln(args);
        } else if (window.console) {
          window.console.log(args);
        }
//#JSCOVERAGE_ENDIF
      }

      // fire an event if the event system is available
      if (FB.Event) {
        FB.Event.fire('fb.log', args);
      }
    },

    /**
     * Shortcut for document.getElementById
     * @method $
     * @param {string} DOM id
     * @return DOMElement
     * @access private
     */
    $: function(id) {
      return document.getElementById(id);
    }
  };
}

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.array
 * @layer basic
 * @requires fb.prelude
 */

/**
 * Array related helper methods.
 *
 * @class FB.Array
 * @private
 * @static
 */
FB.provide('Array', {
  /**
   * Get index of item inside an array. Return's -1 if element is not found.
   *
   * @param arr {Array} Array to look through.
   * @param item {Object} Item to locate.
   * @return {Number} Index of item.
   */
  indexOf: function (arr, item) {
    if (arr.indexOf) {
      return arr.indexOf(item);
    }
    var length = arr.length;
    if (length) {
      for (var index = 0; index < length; index++) {
        if (arr[index] === item) {
          return index;
        }
      }
    }
    return -1;
  },

  /**
   * Merge items from source into target, but only if they dont exist. Returns
   * the target array back.
   *
   * @param target {Array} Target array.
   * @param source {Array} Source array.
   * @return {Array} Merged array.
   */
  merge: function(target, source) {
    for (var i=0; i < source.length; i++) {
      if (FB.Array.indexOf(target, source[i]) < 0) {
        target.push(source[i]);
      }
    }
    return target;
  },

  /**
   * Create an new array from the given array and a filter function.
   *
   * @param arr {Array} Source array.
   * @param fn {Function} Filter callback function.
   * @return {Array} Filtered array.
   */
  filter: function(arr, fn) {
    var b = [];
    for (var i=0; i < arr.length; i++) {
      if (fn(arr[i])) {
        b.push(arr[i]);
      }
    }
    return b;
  },

  /**
   * Create an array from the keys in an object.
   *
   * Example: keys({'x': 2, 'y': 3'}) returns ['x', 'y']
   *
   * @param obj {Object} Source object.
   * @param proto {Boolean} Specify true to include inherited properties.
   * @return {Array} The array of keys.
   */
  keys: function(obj, proto) {
    var arr = [];
    for (var key in obj) {
      if (proto || obj.hasOwnProperty(key)) {
        arr.push(key);
      }
    }
    return arr;
  },

  /**
   * Create an array by performing transformation on the items in a source
   * array.
   *
   * @param arr {Array} Source array.
   * @param transform {Function} Transformation function.
   * @return {Array} The transformed array.
   */
  map: function(arr, transform) {
    var ret = [];
    for (var i=0; i < arr.length; i++) {
      ret.push(transform(arr[i]));
    }
    return ret;
  },

  /**
   * For looping through Arrays and Objects.
   *
   * @param {Object} item   an Array or an Object
   * @param {Function} fn   the callback function for iteration.
   *    The function will be pass (value, [index/key], item) parameters
   * @param {Bool} proto  indicate if properties from the prototype should
   *                      be included
   *
   */
  forEach: function(item, fn, proto) {
    if (!item) {
      return;
    }

    if (Object.prototype.toString.apply(item) === '[object Array]' ||
        (!(item instanceof Function) && typeof item.length == 'number')) {
      if (item.forEach) {
        item.forEach(fn);
      } else {
        for (var i=0, l=item.length; i<l; i++) {
          fn(item[i], i, item);
        }
      }
    } else {
      for (var key in item) {
        if (proto || item.hasOwnProperty(key)) {
          fn(item[key], key, item);
        }
      }
    }
  },

  /**
   * Turns HTMLCollections or anything array-like (that has a `length`)
   * such as function `arguments` into a real array
   *
   * @param {HTMLCollection} coll Array-like collection
   * @return {Array}
   */
  toArray: function(coll) {
    for (var i = 0, a = [], len = coll.length; i < len; i++) {
      a[i] = coll[i];
    }
    return a;
  }
});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 *
 * @provides fb.qs
 * @requires fb.prelude fb.array
 */

/**
 * Query String encoding & decoding.
 *
 * @class FB.QS
 * @static
 * @access private
 */
FB.provide('QS', {
  /**
   * Encode parameters to a query string.
   *
   * @access private
   * @param   params {Object}  the parameters to encode
   * @param   sep    {String}  the separator string (defaults to '&')
   * @param   encode {Boolean} indicate if the key/value should be URI encoded
   * @return        {String}  the query string
   */
  encode: function(params, sep, encode) {
    sep    = sep === undefined ? '&' : sep;
    encode = encode === false ? function(s) { return s; } : encodeURIComponent;

    var pairs = [];
    FB.Array.forEach(params, function(val, key) {
      if (val !== null && typeof val != 'undefined') {
        pairs.push(encode(key) + '=' + encode(val));
      }
    });
    pairs.sort();
    return pairs.join(sep);
  },

  /**
   * Decode a query string into a parameters object.
   *
   * @access private
   * @param   str {String} the query string
   * @return     {Object} the parameters to encode
   */
  decode: function(str) {
    var
      decode = decodeURIComponent,
      params = {},
      parts  = str.split('&'),
      i,
      pair;

    for (i=0; i<parts.length; i++) {
      pair = parts[i].split('=', 2);
      if (pair && pair[0]) {
        params[decode(pair[0])] = decode(pair[1] || '');
      }
    }

    return params;
  }
});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 *
 * @provides fb.content
 * @requires fb.prelude fb.array
 */

/**
 * "Content" is a very flexible term. Helpers for things like hidden
 * DOM content, iframes and popups.
 *
 * @class FB.Content
 * @static
 * @access private
 */
FB.provide('Content', {
  _root       : null,
  _hiddenRoot : null,
  _callbacks  : {},

  /**
   * Append some content.
   *
   * @access private
   * @param content {String|Node} a DOM Node or HTML string
   * @param root    {Node}        (optional) a custom root node
   * @return {Node} the node that was just appended
   */
  append: function(content, root) {
    // setup the root node
    if (!root) {
      if (!FB.Content._root) {
        FB.Content._root = root = FB.$('fb-root');
        if (!root) {
          FB.log('The "fb-root" div has not been created.');
          return;
        } else {
          root.className += ' fb_reset';
        }
      } else {
        root = FB.Content._root;
      }
    }

    if (typeof content == 'string') {
      var div = document.createElement('div');
      root.appendChild(div).innerHTML = content;
      return div;
    } else {
      return root.appendChild(content);
    }
  },

  /**
   * Append some hidden content.
   *
   * @access private
   * @param content {String|Node} a DOM Node or HTML string
   * @return {Node} the node that was just appended
   */
  appendHidden: function(content) {
    if (!FB.Content._hiddenRoot) {
      var
        hiddenRoot = document.createElement('div'),
        style      = hiddenRoot.style;
      style.position = 'absolute';
      style.top      = '-10000px';
      style.width    = style.height = 0;
      FB.Content._hiddenRoot = FB.Content.append(hiddenRoot);
    }

    return FB.Content.append(content, FB.Content._hiddenRoot);
  },

  /**
   * Insert a new iframe. Unfortunately, its tricker than you imagine.
   *
   * NOTE: These iframes have no border, overflow hidden and no scrollbars.
   *
   * The opts can contain:
   *   root       DOMElement  required root node (must be empty)
   *   url        String      required iframe src attribute
   *   className  String      optional class attribute
   *   height     Integer     optional height in px
   *   id         String      optional id attribute
   *   name       String      optional name attribute
   *   onInsert   Function    optional callback directly after insertion
   *   onload     Function    optional onload handler
   *   width      Integer     optional width in px
   *
   * @access private
   * @param opts {Object} the options described above
   */
  insertIframe: function(opts) {
    //
    // Browsers evolved. Evolution is messy.
    //
    opts.id = opts.id || FB.guid();
    opts.name = opts.name || FB.guid();

    // Dear IE, screw you. Only works with the magical incantations.
    // Dear FF, screw you too. Needs src _after_ DOM insertion.
    // Dear Webkit, you're okay. Works either way.
    var
      guid = FB.guid(),

      // Since we set the src _after_ inserting the iframe node into the DOM,
      // some browsers will fire two onload events, once for the first empty
      // iframe insertion and then again when we set the src. Here some
      // browsers are Webkit browsers which seem to be trying to do the
      // "right thing". So we toggle this boolean right before we expect the
      // correct onload handler to get fired.
      srcSet = false,
      onloadDone = false;
    FB.Content._callbacks[guid] = function() {
      if (srcSet && !onloadDone) {
        onloadDone = true;
        opts.onload && opts.onload(opts.root.firstChild);
      }
    };


//#JSCOVERAGE_IF
    if (document.attachEvent) {
      // Initial src is set to javascript:false so as to not trigger the
      // unsecure content warning.
      var html = (
        '<iframe' +
          ' id="' + opts.id + '"' +
          ' name="' + opts.name + '"' +
          (opts.title ? ' title="' + opts.title + '"' : '') +
          (opts.className ? ' class="' + opts.className + '"' : '') +
          ' style="border:none;' +
                  (opts.width ? 'width:' + opts.width + 'px;' : '') +
                  (opts.height ? 'height:' + opts.height + 'px;' : '') +
                  '"' +
          ' src="javascript:false;"' +
          ' frameborder="0"' +
          ' scrolling="no"' +
          ' allowtransparency="true"' +
          ' onload="FB.Content._callbacks.' + guid + '()"' +
        '></iframe>'
      );

      // There is an IE bug with iframe caching that we have to work around. We
      // need to load a dummy iframe to consume the initial cache stream. The
      // setTimeout actually sets the content to the HTML we created above, and
      // because its the second load, we no longer suffer from cache sickness.
      // It must be javascript:false instead of about:blank, otherwise IE6 will
      // complain in https.
      // Since javascript:false actually result in an iframe containing the
      // string 'false', we set the iframe height to 1px so that it gets loaded
      // but stays invisible.
      opts.root.innerHTML = '<iframe src="javascript:false"'+
                            ' frameborder="0"'+
                            ' scrolling="no"'+
                            ' style="height:1px"></iframe>';

      // Now we'll be setting the real src.
      srcSet = true;

      // You may wonder why this is a setTimeout. Read the IE source if you can
      // somehow get your hands on it, and tell me if you figure it out. This
      // is a continuation of the above trick which apparently does not work if
      // the innerHTML is changed right away. We need to break apart the two
      // with this setTimeout 0 which seems to fix the issue.
      window.setTimeout(function() {
        opts.root.innerHTML = html;
        opts.root.firstChild.src = opts.url;
        opts.onInsert && opts.onInsert(opts.root.firstChild);
      }, 0);
    } else {
      // This block works for all non IE browsers. But it's specifically
      // designed for FF where we need to set the src after inserting the
      // iframe node into the DOM to prevent cache issues.
      var node = document.createElement('iframe');
      node.id = opts.id;
      node.name = opts.name;
      node.onload = FB.Content._callbacks[guid];
      node.scrolling = 'no';
      node.style.border = 'none';
      node.style.overflow = 'hidden';
      if (opts.title) {
        node.title = opts.title;
      }
      if (opts.className) {
        node.className = opts.className;
      }
      if (opts.height) {
        node.style.height = opts.height + 'px';
      }
      if (opts.width) {
        if (opts.width == '100%') {
          node.style.width = opts.width;
        } else {
          node.style.width = opts.width + 'px';
        }
      }
      opts.root.appendChild(node);

      // Now we'll be setting the real src.
      srcSet = true;

      node.src = opts.url;
      opts.onInsert && opts.onInsert(node);
    }
  },

  /**
   * Dynamically generate a <form> and submits it to the given target.
   * Uses POST by default.
   *
   * The opts MUST contain:
   *   url     String  action URL for the form
   *   target  String  the target for the form
   *   params  Object  the key/values to be used as POST input
   *
   * @access protected
   * @param opts {Object} the options
   * @param get Should we use get instead?
   */
  submitToTarget: function(opts, get) {
    var form = document.createElement('form');
    form.action = opts.url;
    form.target = opts.target;
    form.method = (get) ? 'GET' : 'POST';
    FB.Content.appendHidden(form);

    FB.Array.forEach(opts.params, function(val, key) {
      if (val !== null && val !== undefined) {
        var input = document.createElement('input');
        input.name = key;
        input.value = val;
        form.appendChild(input);
      }
    });

    form.submit();
    form.parentNode.removeChild(form);
  }
});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 *
 * @provides fb.flash
 * @requires fb.prelude
 *           fb.qs
 *           fb.content
 */

/**
 * Flash Support.
 *
 * @class FB.Flash
 * @static
 * @access private
 */
FB.provide('Flash', {
  //
  // DYNAMIC DATA
  //
  _minVersions: [
    [9,  0, 159, 0 ],
    [10, 0, 22,  87]
  ],
  _swfPath: 'swf/XdComm.swf',

  /**
   * The onReady callbacks.
   *
   * @access private
   * @type Array
   */
  _callbacks: [],

  /**
   * Names of embedded swfs. Used for removing on unload.
   *
   * @access private
   * @type Object
   */
  _names: {},

  /**
   * Whether or not unload callback has been registered (used in IE9).
   *
   * @access private
   * @type Boolean
   */
  _unloadRegistered: false,

  /**
   * Initialize the SWF.
   *
   * @access private
   */
  init: function() {
    // only initialize once
    if (FB.Flash._init) {
      return;
    }
    FB.Flash._init = true;

    // the SWF calls this global function to notify that its ready
    // FIXME: should allow the SWF to take a flashvar that controls the name
    // of this function. we should not have any globals other than FB.
    window.FB_OnFlashXdCommReady = function() {
      FB.Flash._ready = true;
      for (var i=0, l=FB.Flash._callbacks.length; i<l; i++) {
        FB.Flash._callbacks[i]();
      }
      FB.Flash._callbacks = [];
    };

    FB.Flash.embedSWF('XdComm',
                      FB.getDomain('cdn_foreign') + FB.Flash._swfPath);
  },

  /**
   * generates the swf <object> tag and drops it in the DOM
   *
   * @access private
   */
  embedSWF: function(name, swf, flashvars) {
    // create the swf
    var
      IE   = !!document.attachEvent,
      html = (
        '<object ' +
          'type="application/x-shockwave-flash" ' +
          'id="' + name + '" ' +
          (flashvars ? 'flashvars="' + flashvars + '" ' : '') +
          (IE ? 'name="' + name + '" ' : '') +
          (IE ? '' : 'data="' + swf + '" ') +
          (IE
              ? 'classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" '
              : ''
          ) +
          'allowscriptaccess="always">' +
          '<param name="movie" value="' + swf + '"></param>' +
          '<param name="allowscriptaccess" value="always"></param>' +
        '</object>'
      );

    FB.Content.appendHidden(html);

    if (FB.UA.ie() >= 9) {
      if (!FB.Flash._unloadRegistered) {
        var unloadcb = function() {
          FB.Array.forEach(FB.Flash._names, function(val, key) {
            var elem = document.getElementById(key);
            if (elem) {
              elem.removeNode(true);
            }
          });
        };
        window.attachEvent('onunload', unloadcb);
        FB.Flash._unloadRegistered = true;
      }
      FB.Flash._names[name] = true;
    }
  },

  /**
   * Check that the minimal version of Flash we need is available.
   *
   * @access private
   * @return {Boolean} true if the minimum version requirements are matched
   */
  hasMinVersion: function() {
    if (typeof FB.Flash._hasMinVersion === 'undefined') {
      var
        versionString,
        i,
        l,
        version = [];
      try {
        versionString = new ActiveXObject('ShockwaveFlash.ShockwaveFlash')
                          .GetVariable('$version');
      } catch(x) {
        if (navigator.mimeTypes.length > 0) {
          var mimeType = 'application/x-shockwave-flash';
          if (navigator.mimeTypes[mimeType].enabledPlugin) {
            var name = 'Shockwave Flash';
            versionString = (navigator.plugins[name + ' 2.0'] ||
                             navigator.plugins[name])
                            .description;
          }
        }
      }

      // take the string and come up with an array of integers:
      //   [10, 0, 22]
      if (versionString) {
        var parts = versionString
                      .replace(/\D+/g, ',')
                      .match(/^,?(.+),?$/)[1]
                      .split(',');
        for (i=0, l=parts.length; i<l; i++) {
          version.push(parseInt(parts[i], 10));
        }
      }

      // start by assuming we dont have the min version.
      FB.Flash._hasMinVersion = false;

      // look through all the allowed version definitions.
      majorVersion:
      for (i=0, l=FB.Flash._minVersions.length; i<l; i++) {
        var spec = FB.Flash._minVersions[i];

        // we only accept known major versions, and every supported major
        // version has at least one entry in _minVersions. only if the major
        // version matches, does the rest of the check make sense.
        if (spec[0] != version[0]) {
          continue;
        }

        // the rest of the version components must be equal or higher
        for (var m=1, n=spec.length, o=version.length; (m<n && m<o); m++) {
          if (version[m] < spec[m]) {
            // less means this major version is no good
//#JSCOVERAGE_IF 0
            FB.Flash._hasMinVersion = false;
            continue majorVersion;
//#JSCOVERAGE_ENDIF
          } else {
            FB.Flash._hasMinVersion = true;
            if (version[m] > spec[m]) {
              // better than needed
              break majorVersion;
            }
          }
        }
      }
    }

    return FB.Flash._hasMinVersion;
  },

  /**
   * Register a function that needs to ensure Flash is ready.
   *
   * @access private
   * @param cb {Function} the function
   */
  onReady: function(cb) {
    FB.Flash.init();
    if (FB.Flash._ready) {
      // this forces the cb to be asynchronous to ensure no one relies on the
      // _potential_ synchronous nature.
      window.setTimeout(cb, 0);
    } else {
      FB.Flash._callbacks.push(cb);
    }
  }
});

/**
 * This is the stock JSON2 implementation from www.json.org.
 *
 * Modifications include:
 * 1/ Removal of jslint settings
 *
 * @provides fb.thirdparty.json2
 */

/*
    http://www.JSON.org/json2.js
    2009-09-29

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html

    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.

    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (!this.JSON) {
    this.JSON = {};
}

(function () {

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                   this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/.
test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.
            throw new SyntaxError('JSON.parse');
        };
    }
}());

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.json
 * @requires fb.prelude
 *           fb.thirdparty.json2
 */

/**
 * Simple wrapper around standard JSON to handle third-party library quirks.
 *
 * @class FB.JSON
 * @static
 * @access private
 */
FB.provide('JSON', {
  /**
   * Stringify an object.
   *
   * @param obj {Object} the input object
   * @return {String} the JSON string
   */
  stringify: function(obj) {
    // PrototypeJS is incompatible with native JSON or JSON2 (which is what
    // native JSON is based on)
    if (window.Prototype && Object.toJSON) {
      return Object.toJSON(obj);
    } else {
      return JSON.stringify(obj);
    }
  },

  /**
   * Parse a JSON string.
   *
   * @param str {String} the JSON string
   * @param {Object} the parsed object
   */
  parse: function(str) {
    return JSON.parse(str);
  },

  /**
   * Flatten an object to "stringified" values only. This is useful as a
   * pre-processing query strings where the server expects query parameter
   * values to be JSON encoded.
   *
   * @param obj {Object} the input object
   * @return {Object} object with only string values
   */
  flatten: function(obj) {
    var flat = {};
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        var value = obj[key];
        if (null === value || undefined === value) {
          continue;
        } else if (typeof value == 'string') {
          flat[key] = value;
        } else {
          flat[key] = FB.JSON.stringify(value);
        }
      }
    }
    return flat;
  }
});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 *
 * Contains the public method ``FB.api`` and the internal implementation
 * ``FB.ApiServer``.
 *
 * @provides fb.api
 * @requires fb.prelude
 *           fb.qs
 *           fb.flash
 *           fb.json
 */

/**
 * API calls.
 *
 * @class FB
 * @static
 * @access private
 */
FB.provide('', {
  /**
   * Make a API call to the [Graph API](/docs/api).
   *
   * Server-side calls are available via the JavaScript SDK that allow you to
   * build rich applications that can make API calls against the Facebook
   * servers directly from the user's browser. This can improve performance in
   * many scenarios, as compared to making all calls from your server. It can
   * also help reduce, or eliminate the need to proxy the requests thru your
   * own servers, freeing them to do other things.
   *
   * The range of APIs available covers virtually all facets of Facebook.
   * Public data such as [names][names] and [profile pictures][profilepic] are
   * available if you know the id of the user or object. Various parts of the
   * API are available depending on the [connect status and the
   * permissions](FB.login) the user has granted your application.
   *
   * Except the path, all arguments to this function are optional.
   *
   * Get the **f8 Page Object**:
   *
   *     FB.api('/f8', function(response) {
   *       alert(response.company_overview);
   *     });
   *
   * If you have an [authenticated user](FB.login), get their **User Object**:
   *
   *     FB.api('/me', function(response) {
   *       alert(response.name);
   *     });
   *
   * Get the 3 most recent **Post Objects** *Connected* to (in other words,
   * authored by) the *f8 Page Object*:
   *
   *     FB.api('/f8/posts', { limit: 3 }, function(response) {
   *       for (var i=0, l=response.length; i<l; i++) {
   *         var post = response[i];
   *         if (post.message) {
   *           alert('Message: ' + post.message);
   *         } else if (post.attachment && post.attachment.name) {
   *           alert('Attachment: ' + post.attachment.name);
   *         }
   *       }
   *     });
   *
   * If you have an [authenticated user](FB.login) with the
   * [publish_stream](/docs/authentication/permissions) permission, and want
   * to publish a new story to their feed:
   *
   *     var body = 'Reading Connect JS documentation';
   *     FB.api('/me/feed', 'post', { body: body }, function(response) {
   *       if (!response || response.error) {
   *         alert('Error occurred');
   *       } else {
   *         alert('Post ID: ' + response);
   *       }
   *     });
   *
   * Or if you want a delete a previously published post:
   *
   *     var postId = '1234567890';
   *     FB.api(postId, 'delete', function(response) {
   *       if (!response || response.error) {
   *         alert('Error occurred');
   *       } else {
   *         alert('Post was deleted');
   *       }
   *     });
   *
   *
   * ### Old REST API calls
   *
   * This method can also be used to invoke calls to the
   * [Old REST API](../rest/). The function signature for invoking REST API
   * calls is:
   *
   *     FB.api(params, callback)
   *
   * For example, to invoke [links.getStats](../rest/links.getStats):
   *
   *     FB.api(
   *       {
   *         method: 'links.getStats',
   *         urls: 'facebook.com,developers.facebook.com'
   *       },
   *       function(response) {
   *         alert(
   *           'Total: ' + (response[0].total_count + response[1].total_count));
   *       }
   *     );
   *
   * [names]: https://graph.facebook.com/naitik
   * [profilepic]: https://graph.facebook.com/naitik/picture
   *
   * @access public
   * @param path {String} the url path
   * @param method {String} the http method (default `"GET"`)
   * @param params {Object} the parameters for the query
   * @param cb {Function} the callback function to handle the response
   */
  api: function() {
    if (typeof arguments[0] === 'string') {
      FB.ApiServer.graph.apply(FB.ApiServer, arguments);
    } else {
      FB.ApiServer.rest.apply(FB.ApiServer, arguments);
    }
  }
});

/**
 * API call implementations.
 *
 * @class FB.ApiServer
 * @access private
 */
FB.provide('ApiServer', {
  METHODS: ['get', 'post', 'delete', 'put'],
  _callbacks: {},
  _readOnlyCalls: {
    fql_query: true,
    fql_multiquery: true,
    friends_get: true,
    notifications_get: true,
    stream_get: true,
    users_getinfo: true
  },

  /**
   * Make a API call to Graph server. This is the **real** RESTful API.
   *
   * Except the path, all arguments to this function are optional. So any of
   * these are valid:
   *
   *   FB.api('/me') // throw away the response
   *   FB.api('/me', function(r) { console.log(r) })
   *   FB.api('/me', { fields: 'email' }); // throw away response
   *   FB.api('/me', { fields: 'email' }, function(r) { console.log(r) });
   *   FB.api('/12345678', 'delete', function(r) { console.log(r) });
   *   FB.api(
   *     '/me/feed',
   *     'post',
   *     { body: 'hi there' },
   *     function(r) { console.log(r) }
   *   );
   *
   * @access private
   * @param path   {String}   the url path
   * @param method {String}   the http method
   * @param params {Object}   the parameters for the query
   * @param cb     {Function} the callback function to handle the response
   */
  graph: function() {
    var
      args = Array.prototype.slice.call(arguments),
      atoms = args.shift().match(/\/?([^?]*)\??([^#]*)/),
      path = atoms[1],
      next = args.shift(),
      method,
      params,
      cb;

    while (next) {
      var type = typeof next;
      if (type === 'string' && !method) {
        method = next.toLowerCase();
      } else if (type === 'function' && !cb) {
        cb = next;
      } else if (type === 'object' && !params) {
        params = next;
      } else {
        FB.log('Invalid argument passed to FB.api(): ' + next);
        return;
      }
      next = args.shift();
    }

    method = method || 'get';
    params = FB.copy(params || {}, FB.QS.decode(atoms[2]));

    if (FB.Array.indexOf(FB.ApiServer.METHODS, method) < 0) {
      FB.log('Invalid method passed to FB.api(): ' + method);
      return;
    }

    FB.ApiServer.oauthRequest('graph', path, method, params, cb);
  },

  /**
   * Old school restserver.php calls.
   *
   * @access private
   * @param params {Object} The required arguments vary based on the method
   * being used, but specifying the method itself is mandatory:
   *
   * Property | Type    | Description                      | Argument
   * -------- | ------- | -------------------------------- | ------------
   * method   | String  | The API method to invoke.        | **Required**
   * @param cb {Function} The callback function to handle the response.
   */
  rest: function(params, cb) {
    var method = params.method.toLowerCase().replace('.', '_');
    // this is an optional dependency on FB.Auth
    // Auth.revokeAuthorization affects the session
    if (FB.Auth && method === 'auth_revokeauthorization') {
      var old_cb = cb;
      cb = function(response) {
        if (response === true) {
          FB.Auth.setAuthResponse(null, 'not_authorized');
        }
        old_cb && old_cb(response);
      };
    }

    params.format = 'json-strings';
    params.api_key = FB._apiKey;
    var domain = FB.ApiServer._readOnlyCalls[method] ? 'api_read' : 'api';
    FB.ApiServer.oauthRequest(domain, 'restserver.php', 'get', params, cb);
  },

  /**
   * Add the oauth parameter, and fire off a request.
   *
   * @access private
   * @param domain {String}   the domain key, one of 'api', 'api_read',
   *                          or 'graph'
   * @param path   {String}   the request path
   * @param method {String}   the http method
   * @param params {Object}   the parameters for the query
   * @param cb     {Function} the callback function to handle the response
   */
  oauthRequest: function(domain, path, method, params, cb) {
    if (!params.access_token && FB.getAccessToken()) {
      params.access_token = FB.getAccessToken();
    }
    params.sdk = 'joey';
    params.pretty = 0; // browser's default to pretty=1, explicitly setting to
                       // 0 will save a few bytes

    // wrap the callback to force fetch login status if we had a bad access
    // token when we made the api call and it hadn't changed between the
    // call firing and the response coming in.
    var oldCb = cb;
    cb = function(response) {
      if (FB.Auth && response && FB.getAccessToken() == params.access_token &&
          (response.error_code === '190' ||
           (response.error &&
            (response.error === 'invalid_token' ||
             response.error.type === 'OAuthException')))) {
        FB.getLoginStatus(null, true);
      }

      oldCb && oldCb(response);
    };

    try {
      FB.ApiServer.jsonp(domain, path, method, FB.JSON.flatten(params), cb);
    } catch (e1_ignore) {
      try {
        if (!FB.initSitevars.corsKillSwitch &&
            FB.ApiServer.corsPost(
          domain, path, method, FB.JSON.flatten(params), cb)) {
          return;
        }
      } catch (e2_ignore) {
        // do nothing... fall back to flash.
      }

      if (FB.Flash.hasMinVersion()) {
        FB.ApiServer.flash(domain, path, method, FB.JSON.flatten(params), cb);
      } else {
        throw new Error('Your browser does not support long connect ' +
            'requests. You can fix this problem by upgrading your browser ' +
            'or installing the latest version of Flash');
      }
    }
  },

  corsPost: function(domain, path, method, params, cb) {
    var url  = FB.getDomain(domain) + path;

    if (domain == 'graph') {
      params.method = method;
    }
    var encoded_params = FB.QS.encode(params);
    var content_type = 'application/x-www-form-urlencoded';
    var request = FB.ApiServer._createCORSRequest('POST', url, content_type);
    if (request) {
      request.onload = function() {
        cb && cb(FB.JSON.parse(request.responseText));
      };
      request.send(encoded_params);
      return true;
    } else {
      return false;
    }
  },

  _createCORSRequest: function(method, url, content_type) {
     if (!window.XMLHttpRequest) {
      return null;
     }
     var xhr = new XMLHttpRequest();
     if ("withCredentials" in xhr) {
       xhr.open(method, url, true);
       xhr.setRequestHeader('Content-type', content_type);
     } else if (window.XDomainRequest) {
       xhr = new XDomainRequest();
       xhr.open(method, url);
     } else {
       xhr = null;
     }
     return xhr;
  },

  /**
   * Basic JSONP Support.
   *
   * @access private
   * @param domain {String}   the domain key, one of 'api', 'api_read',
   *                          or 'graph'
   * @param path   {String}   the request path
   * @param method {String}   the http method
   * @param params {Object}   the parameters for the query
   * @param cb     {Function} the callback function to handle the response
   */
  jsonp: function(domain, path, method, params, cb) {
    var
      g      = FB.guid(),
      script = document.createElement('script');

    // jsonp needs method overrides as the request itself is always a GET
    if (domain === 'graph' && method !== 'get') {
      params.method = method;
    }
    params.callback = 'FB.ApiServer._callbacks.' + g;

    var url = (
      FB.getDomain(domain) + path +
      (path.indexOf('?') > -1 ? '&' : '?') +
      FB.QS.encode(params)
    );
    if (url.length > 2000) {
      throw new Error('JSONP only support a maximum of 2000 bytes of input.');
    }

    // this is the JSONP callback invoked by the response
    FB.ApiServer._callbacks[g] = function(response) {
      cb && cb(response);
      delete FB.ApiServer._callbacks[g];
      script.parentNode.removeChild(script);
    };

    script.src = url;
    document.getElementsByTagName('head')[0].appendChild(script);
  },

  /**
   * Flash based HTTP Client.
   *
   * @access private
   * @param domain {String}   the domain key, one of 'api' or 'graph'
   * @param path   {String}   the request path
   * @param method {String}   the http method
   * @param params {Object}   the parameters for the query
   * @param cb     {Function} the callback function to handle the response
   */
  flash: function(domain, path, method, params, cb) {
    if (!window.FB_OnXdHttpResult) {
      // the SWF calls this global function when a HTTP response is available
      // FIXME: remove global
      window.FB_OnXdHttpResult = function(reqId, data) {
        FB.ApiServer._callbacks[reqId](decodeURIComponent(data));
      };
    }

    FB.Flash.onReady(function() {
      if (domain === 'graph') {
        params.suppress_http_code = 1;
      }
      var
        url  = FB.getDomain(domain) + path,
        body = FB.QS.encode(params);

      if (method === 'get') {
        // convert GET to POST if needed based on URL length
        if (url.length + body.length > 2000) {
          if (domain === 'graph') {
            params.method = 'get';
          }
          method = 'post';
          body = FB.QS.encode(params);
        } else {
          url += (url.indexOf('?') > -1 ? '&' : '?') + body;
          body = '';
        }
      } else if (method !== 'post') {
        // we use method override and do a POST for PUT/DELETE as flash has
        // trouble otherwise
        if (domain === 'graph') {
          params.method = method;
        }
        method = 'post';
        body = FB.QS.encode(params);
      }

      // fire the request
      var reqId = document.XdComm.sendXdHttpRequest(
        method.toUpperCase(), url, body, null);

      // callback
      FB.ApiServer._callbacks[reqId] = function(response) {
        cb && cb(FB.JSON.parse(response));
        delete FB.ApiServer._callbacks[reqId];
      };
    });
  }
});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.event
 * @requires fb.prelude fb.array
 */

// NOTE: We tag this as FB.Event even though it is actually FB.EventProvider to
// work around limitations in the documentation system.
/**
 * Event handling mechanism for globally named events.
 *
 * @static
 * @class FB.Event
 */
FB.provide('EventProvider', {
  /**
   * Returns the internal subscriber array that can be directly manipulated by
   * adding/removing things.
   *
   * @access private
   * @return {Object}
   */
  subscribers: function() {
    // this odd looking logic is to allow instances to lazily have a map of
    // their events. if subscribers were an object literal itself, we would
    // have issues with instances sharing the subscribers when its being used
    // in a mixin style.
    if (!this._subscribersMap) {
      this._subscribersMap = {};
    }
    return this._subscribersMap;
  },

  /**
   * Subscribe to a given event name, invoking your callback function whenever
   * the event is fired.
   *
   * For example, suppose you want to get notified whenever the authResponse
   * changes:
   *
   *     FB.Event.subscribe('auth.authResponse', function(response) {
   *       // do something with response.access_token
   *     });
   *
   * Global Events:
   *
   * - auth.login -- fired when the user logs in
   * - auth.logout -- fired when the user logs out
   * - auth.prompt -- fired when the user is prompted to log-in/opt-in
   * - auth.authResponseChange -- fired when the authResponse changes
   * - auth.accessTokenChange -- fired when the access token changes.
   * - auth.statusChange -- fired when the status changes
   * - xfbml.parse -- firest when a call to FB.XFBML.parse()
   *                  has processed all XFBML tags in the
   *                  element.process() sense
   * - xfbml.render -- fired when a call to FB.XFBML.parse() completes
   * - edge.create -- fired when the user likes something (fb:like)
   * - comments.add -- fired when the user adds a comment (fb:comments)
   * - question.firstVote -- fired when user initially votes on a poll
   *                         (fb:question)
   * - question.vote -- fired when user votes again on a poll (fb:question)
   * - fb.log -- fired on log message
   * - canvas.pageInfoChange -- fired when the page is resized or scrolled
   *
   * @access public
   * @param name {String} Name of the event.
   * @param cb {Function} The handler function.
   */
  subscribe: function(name, cb) {
    var subs = this.subscribers();

    if (!subs[name]) {
      subs[name] = [cb];
    } else {
      subs[name].push(cb);
    }
  },

  /**
   * Removes subscribers, inverse of [FB.Event.subscribe](FB.Event.subscribe).
   *
   * Removing a subscriber is basically the same as adding one. You need to
   * pass the same event name and function to unsubscribe that you passed into
   * subscribe. If we use a similar example to
   * [FB.Event.subscribe](FB.event.subscribe), we get:
   *
   *     var onAuthResponseChange = function(response) {
   *       // do something with response.access_token
   *     };
   *     FB.Event.subscribe('auth.authResponseChange', onAuthResponseChange);
   *
   *     // sometime later in your code you dont want to get notified anymore
   *     FB.Event.unsubscribe('auth.authResponseChange', onAuthResponseChange);
   *
   * @access public
   * @param name {String} Name of the event.
   * @param cb {Function} The handler function.
   */
  unsubscribe: function(name, cb) {
    var subs = this.subscribers()[name];

    FB.Array.forEach(subs, function(value, key) {
      if (value == cb) {
        subs[key] = null;
      }
    });
  },

  /**
   * Repeatedly listen for an event over time. The callback is invoked
   * immediately when monitor is called, and then every time the event
   * fires. The subscription is canceled when the callback returns true.
   *
   * @access private
   * @param {string} name Name of event.
   * @param {function} callback A callback function. Any additional arguments
   * to monitor() will be passed on to the callback. When the callback returns
   * true, the monitoring will cease.
   */
  monitor: function(name, callback) {
    if (!callback()) {
      var
        ctx = this,
        fn = function() {
          if (callback.apply(callback, arguments)) {
            ctx.unsubscribe(name, fn);
          }
        };

      this.subscribe(name, fn);
    }
  },

  /**
   * Removes all subscribers for named event.
   *
   * You need to pass the same event name that was passed to FB.Event.subscribe.
   * This is useful if the event is no longer worth listening to and you
   * believe that multiple subscribers have been set up.
   *
   * @access private
   * @param name    {String}   name of the event
   */
  clear: function(name) {
    delete this.subscribers()[name];
  },

  /**
   * Fires a named event. The first argument is the name, the rest of the
   * arguments are passed to the subscribers.
   *
   * @access private
   * @param name {String} the event name
   */
  fire: function() {
    var
      args = Array.prototype.slice.call(arguments),
      name = args.shift();

    FB.Array.forEach(this.subscribers()[name], function(sub) {
      // this is because we sometimes null out unsubscribed rather than jiggle
      // the array
      if (sub) {
        sub.apply(this, args);
      }
    });
  },

  //////////////////////////////////////////////////////////////////////////////
  // DOM Events
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Listen to `event` with the `func` event handler.
   */
  listen: function(element, event, func) {
    if (element.addEventListener) {
      element.addEventListener(event, func, false);
    } else if (element.attachEvent) {
      element.attachEvent('on' + event, func);
    }
  },

  /**
   * Do not listen to `event` with the `func` event handler.
   */
  unlisten: function(element, event, func) {
    if (element.removeEventListener) {
      element.removeEventListener(event, func, false);
    } else if (element.detachEvent) {
      element.detachEvent('on' + event, func);
    }
  }

});

/**
 * Event handling mechanism for globally named events.
 *
 * @class FB.Event
 * @extends FB.EventProvider
 */
FB.provide('Event', FB.EventProvider);

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 *
 * @provides fb.xd
 * @requires fb.prelude
 *           fb.qs
 *           fb.flash
 */

/**
 * The cross domain communication layer.
 *
 * @class FB.XD
 * @static
 * @access private
 */
FB.provide('XD', {
  _origin     : null,
  _transport  : null,
  _callbacks  : {},
  _forever    : {},
  _xdProxyUrl : 'connect/xd_proxy.php',

  // For certain versions of IE, we delay the choice of transport and
  // origin until we're in the handler
  _openerTransport : null,
  _openerOrigin    : null,
  _nonOpenerOrigin : null,

  /**
   * Initialize the XD layer. Native postMessage or Flash is required.
   *
   * @param channelUrl {String} optional channel URL
   * @access private
   */
  init: function(channelUrl) {
    // only do init once, if this is set, we're already done
    if (FB.XD._origin) {
      return;
    }

//#JSCOVERAGE_IF
    // The origin here is used for postMessage security. It needs to be based
    // on the URL of the current window. It is required and validated by
    // Facebook as part of the xd_proxy.php.
    var postMessageOrigin = (window.location.protocol + '//' +
                             window.location.host + '/' + FB.guid());

    if (window.addEventListener && !window.attachEvent && window.postMessage) {
      FB.XD._origin = postMessageOrigin;
      FB.XD.PostMessage.init();
      FB.XD._transport = 'postmessage';
    } else if (!channelUrl && FB.Flash.hasMinVersion()) {
      if (document.getElementById('fb-root')) {
        var domain = document.domain;

        // If we're loading from facebook.com, it's safe to take the entire
        // location
        if (domain == 'facebook.com') {
          domain = window.location.host;
        }

        // The origin here is used for Flash XD security. It needs to
        // be based on document.domain rather than the URL of the
        // current window. It is required and validated by Facebook as
        // part of the xd_proxy.php.
        FB.XD._origin = (window.location.protocol + '//' + domain +
                         '/' + FB.guid());
        FB.XD.Flash.init();
        FB.XD._transport = 'flash';
      } else {
        // if we don't have fb-root, we'll fail miserably
        if (FB.log) {
          FB.log('missing fb-root, defaulting to fragment-based xdcomm');
        }
        FB.XD._transport = 'fragment';
        FB.XD.Fragment._channelUrl = channelUrl || window.location.toString();
      }
    } else {
      FB.XD._transport = 'fragment';
      FB.XD.Fragment._channelUrl = channelUrl || window.location.toString();
    }

    var IE = !!window.attachEvent;
    if (FB.XD._transport != 'postmessage' && IE && window.postMessage) {
      // On IE8 and beyond, we can't use postmessage exclusively, but we *may*
      // be able to use postMessage below in the handler depending on the
      // 'relation' so set up for that.  The deal is that we can use postmessage
      // on IE that has it, but not for popups (when the relation is 'opener').
      FB.XD._openerTransport = FB.XD._transport;
      FB.XD._openerOrigin = FB.XD._origin;
      FB.XD._nonOpenerOrigin = postMessageOrigin;
    }
  },

  /**
   * Resolve a id back to a node. An id is a string like:
   *   top.frames[5].frames['crazy'].parent.frames["two"].opener
   *
   * @param   id {String}   the string to resolve
   * @returns    {Node}     the resolved window object
   * @throws  SyntaxError   if the id is malformed
   */
  resolveRelation: function(id) {
    var
      pt,
      matches,
      parts = id.split('.'),
      node = window;

    for (var i=0, l=parts.length; i<l; i++) {
      pt = parts[i];

      if (pt === 'opener' || pt === 'parent' || pt === 'top') {
        node = node[pt];
      } else if (matches = /^frames\[['"]?([a-zA-Z0-9-_]+)['"]?\]$/.exec(pt)) {
        // these regex has the `feature' of fixing some badly quoted strings
        node = node.frames[matches[1]];
      } else {
        throw new SyntaxError('Malformed id to resolve: ' + id + ', pt: ' + pt);
      }
    }

    return node;
  },

  /**
   * Builds a url attached to a callback for xd messages.
   *
   * This is one half of the XD layer. Given a callback function, we generate
   * a xd URL which will invoke the function. This allows us to generate
   * redirect urls (used for next/cancel and so on) which will invoke our
   * callback functions.
   *
   * @access private
   * @param cb          {Function} the callback function
   * @param relation    {String}   parent or opener to indicate window relation
   * @param forever     {Boolean}  indicate this handler needs to live forever
   * @param id          {string}   Optional specified handler id
   * @param force_https {Boolean}  Optional param to force https
   * @return        {String}   the xd url bound to the callback
   */
  handler: function(cb, relation, forever, id, force_https) {
    // if for some reason, we end up trying to create a handler on a page that
    // is already being used for XD comm as part of the fragment, we simply
    // return 'javascript:false' to prevent a recursive page load loop
    //
    // the // after it makes any appended things to the url become a JS
    // comment, and prevents JS parse errors. cloWntoWn.
    if (window.location.toString().indexOf(FB.XD.Fragment._magic) > 0) {
      return 'javascript:false;//';
    }

    // allow us to control force secure, which may be necessary for
    // plugins for ssl-enabled users on http sites. this is because
    // the facebook iframe will load this xd resource
    if (FB.initSitevars.forceSecureXdProxy) {
      force_https = true;
    }

    var xdProxy = FB.getDomain((force_https ? 'https_' : '') + 'cdn') +
      FB.XD._xdProxyUrl + '#';
    id = id || FB.guid();
    relation = relation || 'opener';

    if (FB.XD._openerTransport) {
      // We're set up to swap mechanisms based on 'relation'.  We don't
      // worry about resetting these at the end, since we'll just set them
      // again on the next invocation.
      if (relation == 'opener') {
        FB.XD._transport = FB.XD._openerTransport;
        FB.XD._origin = FB.XD._openerOrigin;
      } else {
        FB.XD.PostMessage.init();
        FB.XD._transport = 'postmessage';
        FB.XD._origin = FB.XD._nonOpenerOrigin;
      }
    }

    // in fragment mode, the url is the current page and a fragment with a
    // magic token
    if (FB.XD._transport == 'fragment') {
      xdProxy = FB.XD.Fragment._channelUrl;
      var poundIndex = xdProxy.indexOf('#');
      if (poundIndex > 0) {
        xdProxy = xdProxy.substr(0, poundIndex);
      }
      xdProxy += (
        (xdProxy.indexOf('?') < 0 ? '?' : '&') +
        FB.XD.Fragment._magic + '#?=&'
      );
    }

    if (forever) {
      FB.XD._forever[id] = true;
    }

    FB.XD._callbacks[id] = cb;
    return xdProxy + FB.QS.encode({
      cb        : id,
      origin    : FB.XD._origin,
      relation  : relation,
      transport : FB.XD._transport
    });
  },

  /**
   * Handles the raw or parsed message and invokes the bound callback with
   * the data and removes the related window/frame.
   *
   * @access private
   * @param data {String|Object} the message fragment string or parameters
   */
  recv: function(data) {
    if (typeof data == 'string') {
      // Try to determine if the data is in JSON format
      try {
        data = FB.JSON.parse(data);
      } catch (e) {
        // If this is not JSON, try FB.QS.decode
        data = FB.QS.decode(data);
      }
    }

    var cb = FB.XD._callbacks[data.cb];
    if (!FB.XD._forever[data.cb]) {
      delete FB.XD._callbacks[data.cb];
    }
    cb && cb(data);
  },

  /**
   * Provides Native ``window.postMessage`` based XD support.
   *
   * @class FB.XD.PostMessage
   * @static
   * @for FB.XD
   * @access private
   */
  PostMessage: {

    _isInitialized: false,

    /**
     * Initialize the native PostMessage system.
     *
     * @access private
     */
    init: function() {
      if (!FB.XD.PostMessage._isInitialized) {
        var H = FB.XD.PostMessage.onMessage;
        window.addEventListener
          ? window.addEventListener('message', H, false)
          : window.attachEvent('onmessage', H);
        FB.XD.PostMessage._isInitialized = true;
      }
    },

    /**
     * Handles a message event.
     *
     * @access private
     * @param event {Event} the event object
     */
    onMessage: function(event) {
      FB.XD.recv(event.data);
    }
  },

  /**
   * Provide support for postMessage between two two webview controls
   * running inside the native FB Application on mobile.
   *
   * @class FB.XD.WebView
   * @static
   * @for FB.XD
   * @access private
   */
  WebView: {
    onMessage: function(dest, origin, msg) {
      FB.XD.recv(msg);
    }
  },

  /**
   * Provides Flash Local Connection based XD support.
   *
   * @class FB.XD.Flash
   * @static
   * @for FB.XD
   * @access private
   */
  Flash: {
    /**
     * Initialize the Flash Local Connection.
     *
     * @access private
     */
    init: function() {
      FB.Flash.onReady(function() {
        document.XdComm.postMessage_init(
          'FB.XD.Flash.onMessage',
          FB.XD._openerOrigin ? FB.XD._openerOrigin : FB.XD._origin);
      });
    },

    /**
     * Handles a message received by the Flash Local Connection.
     *
     * @access private
     * @param message {String} the URI encoded string sent by the SWF
     */
    onMessage: function(message) {
      FB.XD.recv(decodeURIComponent(message));
    }
  },

  /**
   * Provides XD support via a fragment by reusing the current page.
   *
   * @class FB.XD.Fragment
   * @static
   * @for FB.XD
   * @access private
   */
  Fragment: {
    _magic: 'fb_xd_fragment',

    /**
     * Check if the fragment looks like a message, and dispatch if it does.
     */
    checkAndDispatch: function() {
      var
        loc = window.location.toString(),
        fragment = loc.substr(loc.indexOf('#') + 1),
        magicIndex = loc.indexOf(FB.XD.Fragment._magic);

      if (magicIndex > 0) {
        // make these no-op to help with performance
        //
        // this works independent of the module being present or not, or being
        // loaded before or after
        FB.init = FB.getLoginStatus = FB.api = function() {};

        // display none helps prevent loading of some stuff
        document.documentElement.style.display = 'none';

        FB.XD.resolveRelation(
          FB.QS.decode(fragment).relation).FB.XD.recv(fragment);
      }
    }
  }
});

// NOTE: self executing code.
//
// if the page is being used for fragment based XD messaging, we need to
// dispatch on load without needing any API calls. it only does stuff if the
// magic token is found in the fragment.
FB.XD.Fragment.checkAndDispatch();

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.ua
 * @layer basic
 */

/**
 *  User Agent and OS detection. Usage is straightforward:
 *
 *    if (FB.UA.ie()) {
 *      //  IE
 *    }
 *
 *  You can also do version checks:
 *
 *    if (FB.UA.ie() >= 7) {
 *      //  IE7 or better
 *    }
 *
 *  The browser functions will return NaN if the browser does not match, so
 *  you can also do version compares the other way:
 *
 *    if (FB.UA.ie() < 7) {
 *      //  IE6 or worse
 *    }
 *
 *  Note that the version is a float and may include a minor version number,
 *  so you should always use range operators to perform comparisons, not
 *  strict equality.
 *
 *  **Note:** You should **strongly** prefer capability detection to browser
 *  version detection where it's reasonable:
 *
 *    http://www.quirksmode.org/js/support.html
 *
 *  Further, we have a large number of mature wrapper functions and classes
 *  which abstract away many browser irregularities. Check the documentation,
 *  grep for things, or ask on javascript@lists.facebook.com before writing yet
 *  another copy of "event || window.event".
 *
 *  @task browser   Determining the User Agent
 *  @task os        Determining the User's Operating System
 *  @task internal  Internal methods
 *
 *  @author marcel, epriestley
 */
FB.provide('UA', {

  /**
   *  Check if the UA is Internet Explorer.
   *
   *  @task browser
   *  @access public
   *
   *  @return float|NaN Version number (if match) or NaN.
   *  @author marcel
   */
  ie: function() {
    return FB.UA._populate() || this._ie;
  },


  /**
   *  Check if the UA is Firefox.
   *
   *  @task browser
   *  @access public
   *
   *  @return float|NaN Version number (if match) or NaN.
   *  @author marcel
   */
  firefox: function() {
    return FB.UA._populate() || this._firefox;
  },


  /**
   *  Check if the UA is Opera.
   *
   *  @task browser
   *  @access public
   *
   *  @return float|NaN Version number (if match) or NaN.
   *  @author marcel
   */
  opera: function() {
    return FB.UA._populate() || this._opera;
  },


  /**
   *  Check if the UA is Safari.
   *
   *  @task browser
   *  @access public
   *
   *  @return float|NaN Version number (if match) or NaN.
   *  @author marcel
   */
  safari: function() {
    return FB.UA._populate() || this._safari;
  },

  /**
   *  Check if the UA is a Chrome browser.
   *
   *  @task browser
   *  @access public
   *
   *  @return float|NaN Version number (if match) or NaN.
   *  @author cjiang
   */
  chrome : function() {
    return FB.UA._populate() || this._chrome;
  },


  /**
   *  Check if the user is running Windows.
   *
   *  @task os
   *  @return bool `true' if the user's OS is Windows.
   *  @author marcel
   */
  windows: function() {
    return FB.UA._populate() || this._windows;
  },


  /**
   *  Check if the user is running Mac OS X.
   *
   *  @task os
   *  @return bool `true' if the user's OS is Mac OS X.
   *  @author marcel
   */
  osx: function() {
    return FB.UA._populate() || this._osx;
  },

  /**
   * Check if the user is running Linux.
   *
   * @task os
   * @return bool `true' if the user's OS is some flavor of Linux.
   * @author putnam
   */
  linux: function() {
    return FB.UA._populate() || this._linux;
  },

  /**
   * Check if the user is running on an iOS platform.
   *
   * @task os
   * @return bool `true' if the user is running some flavor of the
   *    ios OS.
   * @author beng
   */
  ios: function() {
    FB.UA._populate();
    return FB.UA.mobile() && this._ios;
  },

  /**
   * Check if the browser is running inside a smart mobile phone.
   * @return bool
   * @access public
   */
  mobile: function() {
    FB.UA._populate();
    return !FB._inCanvas && this._mobile;
  },

  /**
   * Checking if we are inside a webview of the FB App for mobile
   * @return bool
   * @access public
   */
  nativeApp: function() {
    // Now native FB app generates UA like this:
    //
    // Mozilla/5.0 (iPhone Simulator; U; CPU iPhone OS 4_2 like Mac OS X; en_IE)
    // AppleWebKit (KHTML, like Gecko) Mobile
    // [FBAN/FBForIPhone;FBAV/3.5a;FBBV/3500;FBDV/i386;FBMD/
    // iPhone Simulator;FBSN/iPhone OS;FBSV/4.2;FBSS/1;FBCR/;
    // FBID/phone;FBLC/en_IE]
    //
    // We will detect by searching for FBAN/\w+;
    //
    return FB.UA.mobile() && navigator.userAgent.match(/FBAN\/\w+;/i);
  },

  /**
   * Check for the Android browser.
   * @return bool
   * @access public
   */
  android: function() {
    FB.UA._populate();
    return FB.UA.mobile() && this._android;
  },

  /**
   * Check for the iPad
   * @return bool
   * @access public
   */
  iPad: function() {
    FB.UA._populate();
    return FB.UA.mobile() && this._iPad;
  },

  _populated : false,

  /**
   *  Populate the UA and OS information.
   *
   *  @access public
   *  @task internal
   *
   *  @return void
   *
   *  @author marcel
   */
  _populate : function() {
    if (FB.UA._populated) {
      return;
    }

    FB.UA._populated = true;

    // To work around buggy JS libraries that can't handle multi-digit
    // version numbers, Opera 10's user agent string claims it's Opera
    // 9, then later includes a Version/X.Y field:
    //
    // Opera/9.80 (foo) Presto/2.2.15 Version/10.10
    // Note: if agent regex is updated, update it in xd_proxy.phpt also!
    var agent = /(?:MSIE.(\d+\.\d+))|(?:(?:Firefox|GranParadiso|Iceweasel).(\d+\.\d+))|(?:Opera(?:.+Version.|.)(\d+\.\d+))|(?:AppleWebKit.(\d+(?:\.\d+)?))/.exec(navigator.userAgent);
    var os    = /(Mac OS X)|(Windows)|(Linux)/.exec(navigator.userAgent);
    var ios = /\b(iPhone|iP[ao]d)/.exec(navigator.userAgent);
    FB.UA._iPad = /\b(iPad)/.exec(navigator.userAgent);
    FB.UA._android = navigator.userAgent.match(/Android/i);
    FB.UA._mobile = ios || FB.UA._android ||
      navigator.userAgent.match(/Mobile/i);

    if (agent) {
      FB.UA._ie      = agent[1] ? parseFloat(agent[1]) : NaN;
      // marcel: IE8 running in IE7 mode.
      if (FB.UA._ie >= 8 && !window.HTMLCollection) {
        FB.UA._ie = 7;
      }
      FB.UA._firefox = agent[2] ? parseFloat(agent[2]) : NaN;
      FB.UA._opera   = agent[3] ? parseFloat(agent[3]) : NaN;
      FB.UA._safari  = agent[4] ? parseFloat(agent[4]) : NaN;
      if (FB.UA._safari) {
        // We do not add the regexp to the above test, because it will always
        // match 'safari' only since 'AppleWebKit' appears before 'Chrome' in
        // the userAgent string.
        agent = /(?:Chrome\/(\d+\.\d+))/.exec(navigator.userAgent);
        FB.UA._chrome = agent && agent[1] ? parseFloat(agent[1]) : NaN;
      } else {
        FB.UA._chrome = NaN;
      }
    } else {
      FB.UA._ie      =
      FB.UA._firefox =
      FB.UA._opera   =
      FB.UA._chrome  =
      FB.UA._safari  = NaN;
    }

    if (os) {
      FB.UA._osx     = !!os[1];
      FB.UA._windows = !!os[2];
      FB.UA._linux   = !!os[3];
    } else {
      FB.UA._osx     =
      FB.UA._windows =
      FB.UA._linux   = false;
    }

    FB.UA._ios    = ios;
  }
});



/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 *
 * @provides fb.arbiter
 * @requires fb.prelude
 *           fb.array
 *           fb.canvas
 *           fb.content
 *           fb.json
 *           fb.qs
 *           fb.xd
 *           fb.ua
 */

/**
 * Calls Arbiter in the parent Facebook window from inside an iframe
 *
 * @class FB.Arbiter
 * @static
 * @access private
 */
FB.provide('Arbiter', {
  _canvasProxyUrl: 'connect/canvas_proxy.php',

  BEHAVIOR_EVENT: 'e',
  BEHAVIOR_PERSISTENT: 'p',
  BEHAVIOR_STATE : 's',

  /**
   * Sends a "Connect.Unsafe.{method}" Arbiter message to facebook using the
   * most efficient transport available.
   */
  inform: function(method, params, relation, https, behavior) {
    // TODO(naitik) only enable for iframe page tabs for now
    if (FB.Canvas.isTabIframe() ||
        (FB._inPlugin && window.postMessage) ||
        (!FB._inCanvas && FB.UA.mobile() && window.postMessage)) {
      var msg = FB.JSON.stringify({
        method: method,
        params: params,
        behavior: behavior || FB.Arbiter.BEHAVIOR_PERSISTENT });
      if (window.postMessage) { // native postMessage
        FB.XD.resolveRelation(relation || 'parent').postMessage(msg, '*');
        return;
      } else {
        try {
          window.opener.postMessage(msg); // IE vbscript NIX transport
          return;
        } catch (e) {}
      }
    }

    // canvas_proxy.php works by directly calling JS function on the parent
    // window of current window. As such, it has to same document.domain and
    // protocol (https/http). We don't have a good way to determine the
    // protocol of the parent window and have to use window.referrer to
    // infer it.
    // Question: why should https ever be passed as a parameter?
    https |= (window != window.parent &&
              document.referrer.indexOf('https:') === 0);

    // fallback static file based transport
    var url = (
      FB.getDomain((https ? 'https_' : '') + 'staticfb', true) +
      FB.Arbiter._canvasProxyUrl + '#' +
      FB.QS.encode({
        method: method,
        params: FB.JSON.stringify(params || {}),
        behavior: behavior || FB.Arbiter.BEHAVIOR_PERSISTENT,
        relation: relation
      })
    );

    var root = FB.Content.appendHidden('');
    FB.Content.insertIframe({
      url: url,
      root: root,
      width: 1,
      height: 1,
      onload: function() {
        setTimeout(function() {
          root.parentNode.removeChild(root);
        }, 10);
      }
    });
  }
});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 *
 * @provides fb.canvas
 * @requires fb.prelude
 *           fb.arbiter
 *           fb.array
 *           fb.xd
*/

/**
 * Things used by Canvas apps.
 *
 * ---------------------------------------------------------------------
 * IMPORTANT NOTE: IF YOU ARE USING THESE FUNCTIONS, MAKE SURE YOU GO TO
 *
 * http://www.facebook.com/developers
 *
 * CLICK YOUR APP, CLICK EDIT SETTINGS, CLICK MIGRATIONS AND ENABLE
 *
 * New SDKs
 * ---------------------------------------------------------------------
 *
 * @class FB.Canvas
 * @static
 * @access private
 */
FB.provide('Canvas', {
  /*
   * The timer. We keep it around so we can shut if off
   */
   _timer: null,

  /**
   * Keeps track of the last size of each frame
   */
   _lastSize: {},

  /**
   * Keeps track of the last size and data about the parent canvas page
   */
  _pageInfo: {
    clientWidth: 0,
    clientHeight: 0,
    scrollLeft: 0,
    scrollTop: 0,
    offsetLeft: 0,
    offsetTop: 0
  },

  /**
   * canvas iframe position within the parent page.
   *
   * calls appCallback with the fresh data from the parent frame
   * returns data from previous call directly for semi-backwards compatibility
   * with the previous API (which used polling)
   * @return {Object} containing scrollLeft, scrollTop,
   * clientWidth, clientHeight, offsetLeft, and offsetTop
   *
   */
  getPageInfo: function(appCallback) {
     var relation = 'top.frames[' + window.name + ']';
     var channelUrl = FB.XD.handler(function(data) {
       for (var i in FB.Canvas._pageInfo) {
         if (data[i]) {
           FB.Canvas._pageInfo[i] = data[i] | 0;
         }
       }
       appCallback && appCallback(FB.Canvas._pageInfo);
     }, relation, true);
     var params = {
        channelUrl : channelUrl,
        frame : window.name
      };
      FB.Arbiter.inform('getPageInfo', params, 'top');
  },

  /**
   * Use in conjunction with the hideFlashCallback parameter to FB.init().
   * Developers should use this function within their hideFlashCallback to hide
   * the element as soon as possible.  Since Facebook will
   * call this function 200ms later, and the implementation may change, using it
   * is the only way to guarantee forward compatibility.
   */
  hideFlashElement: function(elem) {
    elem.style.visibility = 'hidden';
  },

  /**
   * Use in conjunction with FB.Canvas.hideFlashElement.
   * Developers should use this function within their hideFlashCallback to show
   * the element as soon as possible.  Since Facebook will
   * call this function 200ms later, and the implementation may change, using it
   * is the only way to guarantee forward compatibility.
   */
  showFlashElement: function(elem) {
    elem.style.visibility = '';
  },

  _flashClassID: "CLSID:D27CDB6E-AE6D-11CF-96B8-444553540000",

  /**
   * By default, we hide any flash objects that have the wmode=default or
   * wmode=window when they might occlude something.  Developers can
   * override this with options.hideFlashCallback.
   */
  _hideFlashCallback: function(params) {
    var candidates = window.document.getElementsByTagName('object');
    for (var i = 0; i < candidates.length; i++) {
      var elem = candidates[i];
      if (elem.type.toLowerCase() != "application/x-shockwave-flash" &&
          elem.classid.toUpperCase() != FB.Canvas._flashClassID) {
        continue;
      }

      var good = false;
      for (var j = 0; j < elem.childNodes.length; j++) {
        if (elem.childNodes[j].nodeName.toLowerCase() == "param" &&
            elem.childNodes[j].name.toLowerCase() == "wmode") {
          if (elem.childNodes[j].value.toLowerCase() == "opaque" ||
              elem.childNodes[j].value.toLowerCase() == "transparent") {
            good = true;
          }
        }
      }
      if (!good) {
        var rand = Math.random();
        if (rand <= 1 / 1000) {
          FB.api(FB._apiKey + '/occludespopups', 'post', {});
        }

        if (FB.Canvas._devHideFlashCallback) {
          // For each flash element, we give the application 200ms to do
          // something reasonable.  In this scenario we assume that the flash
          // object has inherited visibility, and restore to that afterward.
          var wait_ms = 200;
          var devArgs = {
            state : params.state,
            elem : elem
          };
          var fnToggle = FB.bind(function(devParams) {
              if (devParams.state == 'opened') {
                FB.Canvas.hideFlashElement(devParams.elem);
              } else {
                FB.Canvas.showFlashElement(devParams.elem);
              }
            },
            this,
            devArgs);
          setTimeout(fnToggle, wait_ms);
          FB.Canvas._devHideFlashCallback(devArgs);
        } else {
          if (params.state == 'opened') {
            elem._old_visibility = elem.style.visibility;
            elem.style.visibility = 'hidden';
          } else if (params.state == 'closed') {
            elem.style.visibility = elem._old_visibility;
            delete elem._old_visibility;
          }
        }
      }
    }
  },

  _devHideFlashCallback : null,
  _setHideFlashCallback: function(callback) {
    FB.Canvas._devHideFlashCallback = callback;
  },

  init: function() {
    var view = FB.Dom.getViewportInfo();
    FB.Canvas._pageInfo.clientWidth = view.width;
    FB.Canvas._pageInfo.clientHeight = view.height;
    FB.Canvas.getPageInfo();

    var channelUrl = FB.XD.handler(
      FB.Canvas._hideFlashCallback, 'top.frames[' + window.name + ']', true);

    // Flash objects which are wmode=window (default) have an infinite Z-order.
    // Canvas chrome needs to know so it can hide the iframe when various
    // elements pop up.
    FB.Arbiter.inform(
      'iframeSetupFlashHiding', {channelUrl: channelUrl});
  },

  /**
   * Tells Facebook to resize your iframe.
   *
   * ## Examples
   *
   * Call this whenever you need a resize. This usually means, once after
   * pageload, and whenever your content size changes.
   *
   *     window.fbAsyncInit = function() {
   *       FB.Canvas.setSize();
   *     }
   *
   *     // Do things that will sometimes call sizeChangeCallback()
   *
   *     function sizeChangeCallback() {
   *       FB.Canvas.setSize();
   *     }
   *
   * It will default to the current size of the frame, but if you have a need
   * to pick your own size, you can use the params array.
   *
   *     FB.Canvas.setSize({ width: 640, height: 480 }); // Live in the past
   *
   * The max width is whatever you picked in your app settings, and there is no
   * max height.
   *
   * @param {Object} params
   *
   * Property | Type    | Description                      | Argument   | Default
   * -------- | ------- | -------------------------------- | ---------- | -------
   * width    | Integer | Desired width. Max is app width. | *Optional* | frame width
   * height   | Integer | Desired height.                  | *Optional* | frame height
   *
   * @author ptarjan
   */
  setSize: function(params) {
    // setInterval calls its function with an integer
    if (typeof params != "object") {
      params = {};
    }
    var minShrink = 0,
        minGrow = 0;
    params = params || {};
    if (params.width == null || params.height == null) {
      params = FB.copy(params, FB.Canvas._computeContentSize());
      // we add a bit of hysteresis to the height check since the values
      // returned from _computeContentSize() may be slightly different
      // than the size we set the IFrame to so we need to avoid getting
      // into a state where the IFrame keeps resizing slightly larger
      // or ping ponging in size
      minShrink = 16;
      minGrow = 4;
    }
    params = FB.copy(params, { frame: window.name || 'iframe_canvas' });

    // Deep compare
    if (FB.Canvas._lastSize[params.frame]) {
      var oldHeight = FB.Canvas._lastSize[params.frame].height;
      var dHeight = params.height - oldHeight;
      if (FB.Canvas._lastSize[params.frame].width == params.width &&
          (dHeight <= minGrow && dHeight >= -minShrink)) {
        return false;
      }
    }
    FB.Canvas._lastSize[params.frame] = params;

    FB.Arbiter.inform('setSize', params);
    return true;
  },

  /**
   * Tells Facebook to scroll your iframe.
   *
   * ## Examples
   *
   * Call this whenever you need to scroll the contents of your iframe.  This
   * will cause a setScroll to be executed on the containing iframe.
   *
   * @param {Integer} x
   * @param {Integer} y
   *
   * Property | Type    | Description                      | Argument   | Default
   * -------- | ------- | -------------------------------- | ---------- | -------
   * x        | Integer | Horizontal scroll position       | *Required* | None
   * y        | Integer | Vertical scroll position         | *Required* | None
   *
   * @author gregschechte
   */
  scrollTo: function(x, y) {
    FB.Arbiter.inform('scrollTo', {
        frame: window.name || 'iframe_canvas',
        x: x,
        y: y
      });
  },

  /**
   * Starts or stops a timer which resizes your iframe every few milliseconds.
   *
   * ## Examples
   *
   * This function is useful if you know your content will change size, but you
   * don't know when. There will be a slight delay, so if you know when your
   * content changes size, you should call [setSize](FB.Canvas.setSize)
   * yourself (and save your user's CPU cycles).
   *
   *     window.fbAsyncInit = function() {
   *       FB.Canvas.setAutoGrow();
   *     }
   *
   * If you ever need to stop the timer, just pass false.
   *
   *     FB.Canvas.setAutoGrow(false);
   *
   * If you want the timer to run at a different interval, you can do that too.
   *
   *     FB.Canvas.setAutoGrow(91); // Paul's favorite number
   *
   * Note: If there is only 1 parameter and it is a number, it is assumed to be
   * the interval.
   *
   * @param {Boolean} onOrOff Whether to turn the timer on or off. truthy ==
   * on, falsy == off. **default** is true
   * @param {Integer} interval How often to resize (in ms). **default** is
   * 100ms
   *
   * @author ptarjan
   */
  setAutoGrow: function(onOrOff, interval) {
    // I did this a few times, so I expect many users will too
    if (interval === undefined && typeof onOrOff == "number") {
      interval = onOrOff;
      onOrOff = true;
    }

    if (onOrOff === undefined || onOrOff) {
      if (FB.Canvas._timer === null) {
        FB.Canvas._timer =
          window.setInterval(FB.Canvas.setSize,
                             interval || 100); // 100 ms is the default
      }
      FB.Canvas.setSize();
    } else {
      if (FB.Canvas._timer !== null) {
        window.clearInterval(FB.Canvas._timer);
        FB.Canvas._timer = null;
      }
    }
  },

  /**
   * @deprecated use setAutoGrow()
   */
  setAutoResize: function(onOrOff, interval) {
    return FB.Canvas.setAutoGrow(onOrOff, interval);
  },

  /**
   * The "app_runner_" pattern is set by facebook.com when embeding an
   * application iframe(for now, only actually used on page tabs).
   * If we detect this pattern, we can safely assume the
   * parent frame will be able to handle async style ui calls.
   * @return {Boolean} as explained above
   */
  isTabIframe: function() {
    return (window.name.indexOf('app_runner_') === 0);
  },

  /**
   * This method should be called when your app is finished loading to the point
   * when the user can use it.
   * Pass in a callback which receives a struct like so:
   * { time_delta_ms: 2346 }
   * Which is the number of milliseconds between the moment the full canvas
   * page began executing and when you called the function.
   * This information will then be logged for Facebook Insights.
   */
  setDoneLoading : function(callback) {
    FB.Canvas._passAppTtiMessage(callback, 'RecordIframeAppTti');
  },

  /**
   * When using FB.Canvas.setDoneLoading, this method can be called before
   * periods of time that should not be measured, such as waiting for a user to
   * click a button.
   * Pass in a callback which receives a struct like so:
   * { time_delta_ms: 2346 }
   * Which is the number of milliseconds between the moment the full canvas
   * page began executing and when you called the function.
   */
  stopTimer : function(callback) {
    FB.Canvas._passAppTtiMessage(callback, 'StopIframeAppTtiTimer');
  },


  /**
   * This method can be called to register a callback for inline processing
   * of user actions, such as clicks on OG action ticker stories.
   * For instance, if user uses your app and clicks on achievement action,
   * you can process it without reloading the page.
   *
   * Each call to setUrlHandler removes previously set callback, if there
   * was one.
   *
   * @param {Function} callback function taking one argument: an object,
   *      field of which will be 'path' - the path relative to app's canvas URL;
   *      for instance, if the URL that would have been loaded was
   *       http://apps.facebook.com/app/achievement1.php?fb_rel=canvas_ticker...
   *      then callback will get {path: "/achievement1.php?fb_rel=canvas_ti..."}
   *
   * ## Example
   *
   * function onUrl(data) {
   *   if(data.path.indexOf("games.achieves") != -1) {
   *     console.log('I will process some achievement now.');
   *   } else {
   *     window.location = data.path;
   *   }
   * }
   *
   * FB.Canvas.setUrlHandler(onUrl);
   */
  setUrlHandler : function(callback) {
    var channelUrl = FB.XD.handler(callback,
                                   'top.frames[' + window.name + ']',
                                   true);

    FB.Arbiter.inform('setUrlHandler', channelUrl);
    FB.Event.listen(window, 'load', function() {
      FB.Arbiter.inform('setUrlHandler', channelUrl);
    });
  },

  /**
   * When using FB.Canvas.setDoneLoading, this method can be called after
   * periods of time that should not be measured, such as after a user clicks a
   * button.
   */
  startTimer : function() {
    FB.Canvas._passAppTtiMessage(null, 'StartIframeAppTtiTimer');
  },

  _passAppTtiMessage : function(callback, message_name) {
    var devCallback = null;
    if (callback) {
      devCallback = FB.XD.handler(callback,
                                  'top.frames[' + window.name + ']', false);
    }
    FB.Arbiter.inform(message_name,
                      { frame: window.name || 'iframe_canvas',
                          time: (new Date()).getTime(),
                          appId: parseInt(FB._apiKey, 10),
                          channelUrl: devCallback
                          });
  },

  /**
   * Determine the size of the actual contents of the iframe.
   *
   * There is no reliable way to get the height when the content is
   * smaller than the IFrame in all browsers for all css.
   * From measuring here's what works:
   * CSS pos: default   relative   absolute   fixed
   * Webkit     G+S       G+S        G          x
   * Firefox    G+S       G          G          x
   * IE         G         G          G          x
   *
   * The only safe thing we can do is grow.
   *
   * Here's measured results from a test app. While it looks like we
   * ought to be able to use body.offsetHeight, it turns out there are
   * cases where apps with complex css are reported as much smaller
   * than they actually render.
   *
   * content > IFrame=800
   *             body       docElement    jQuery .height()
   *         scroll offset scroll offset   body doc
   * chrome: 1838   1799   1834   1838     800  1838
   * safari: 1838   1799   1834   1838     800  1838
   * firefo: 1863   1863   1903   1903     800  1903
   * ie7   : 2038   2038   2055   800      800  2055
   * ie8   : 1850   1850   1890   800      800  1890
   * ie9   : 1836   1820   1861   800      800  1861
   * opera : 1850   1850   11890  1890
   *
   * content < IFrame=800
   *             body       docElement    jQuery .height()
   *         scroll offset scroll offset   body doc
   * chrome: 800    439    474    478      800  800
   * safari: 800    439    474    478      800  800
   * firefo: 455    455    798    493      800  800
   * ie7   : 518    518    535    800      800  800
   * ie8   : 450    450    800    800      800  800
   * ie9   : 460    444    800    800      800  800
   * opera : 450    450    10490  490
   *
   * Patches and test cases are welcome.
   */
  _computeContentSize: function() {
    var body = document.body,
        docElement = document.documentElement,
        right = 0,
        bodyTop = Math.max(body.offsetTop, 0),
        docTop = Math.max(docElement.offsetTop, 0),
        bodyScroll = body.scrollHeight + bodyTop,
        bodyOffset = body.offsetHeight + bodyTop,
        docScroll = docElement.scrollHeight + docTop,
        docOffset = docElement.offsetHeight + docTop;
    bottom = Math.max(bodyScroll, bodyOffset, docScroll, docOffset);
    if (body.offsetWidth < body.scrollWidth) {
      right = body.scrollWidth + body.offsetLeft;
    } else {
      FB.Array.forEach(body.childNodes, function(child) {
        var childRight = child.offsetWidth + child.offsetLeft;
        if (childRight > right) {
          right = childRight;
        }
      });
    }
    if (docElement.clientLeft > 0) {
      right += (docElement.clientLeft * 2);
    }
    if (docElement.clientTop > 0) {
      bottom += (docElement.clientTop * 2);
    }

    return {height: bottom, width: right};
  }
});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.string
 * @layer basic
 * @requires fb.prelude
 *
 */

/**
 * Utility function related to Strings.
 *
 * @class FB.String
 * @static
 * @private
 */
FB.provide('String', {
  /**
   * Strip leading and trailing whitespace.
   *
   * @param s {String} the string to trim
   * @returns {String} the trimmed string
   */
  trim: function(s) {
    return s.replace(/^\s*|\s*$/g, '');
  },

  /**
   * Format a string.
   *
   * Example:
   *     FB.String.format('{0}.facebook.com/{1}', 'www', 'login.php')
   * Returns:
   *     'www.facebook.com/login.php'
   *
   * Example:
   *     FB.String.format('foo {0}, {1}, {0}', 'x', 'y')
   * Returns:
   *     'foo x, y, x'
   *
   * @static
   * @param format {String} the format specifier
   * @param arguments {...} placeholder arguments
   * @returns {String} the formatted string
   */
  format: function(format) {
    if (!FB.String.format._formatRE) {
      FB.String.format._formatRE = /(\{[^\}^\{]+\})/g;
    }

    var values = arguments;

    return format.replace(
      FB.String.format._formatRE,
      function(str, m) {
        var
          index = parseInt(m.substr(1), 10),
          value = values[index + 1];
        if (value === null || value === undefined) {
          return '';
        }
        return value.toString();
      }
    );
  },

  /**
   * Escape a string to safely use it as HTML.
   *
   * @param value {String} string to escape
   * @return {String} the escaped string
   */
  escapeHTML: function(value) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(value));
    return div.innerHTML.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  },

  /**
   * Escape a string so that it can be embedded inside another string
   * as quoted string.
   *
   * @param value {String} string to quote
   * @return {String} the quoted string
   */
  quote: function(value) {
    var
      quotes = /["\\\x00-\x1f\x7f-\x9f]/g,
      subst = {    // table of character substitutions
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"' : '\\"',
        '\\': '\\\\'
      };

    return quotes.test(value) ?
      '"' + value.replace(quotes, function (a) {
        var c = subst[a];
        if (c) {
          return c;
        }
        c = a.charCodeAt();
        return '\\u00' + Math.floor(c/16).toString(16) + (c % 16).toString(16);
      }) + '"' :
      '"' + value + '"';
  }
});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.dom
 * @layer basic
 * @requires fb.prelude
 *           fb.event
 *           fb.string
 *           fb.array
 *           fb.ua
 */

/**
 * This provides helper methods related to DOM.
 *
 * @class FB.Dom
 * @static
 * @private
 */
FB.provide('Dom', {
  /**
   * Check if the element contains a class name.
   *
   * @param dom {DOMElement} the element
   * @param className {String} the class name
   * @return {Boolean}
   */
  containsCss: function(dom, className) {
    var cssClassWithSpace = ' ' + dom.className + ' ';
    return cssClassWithSpace.indexOf(' ' + className + ' ') >= 0;
  },

  /**
   * Add a class to a element.
   *
   * @param dom {DOMElement} the element
   * @param className {String} the class name
   */
  addCss: function(dom, className) {
    if (!FB.Dom.containsCss(dom, className)) {
      dom.className = dom.className + ' ' + className;
    }
  },

  /**
   * Remove a class from the element.
   *
   * @param dom {DOMElement} the element
   * @param className {String} the class name
   */
  removeCss: function(dom, className) {
    if (FB.Dom.containsCss(dom, className)) {
      dom.className = dom.className.replace(className, '');
      FB.Dom.removeCss(dom, className); // in case of repetition
    }
  },

  /**
   * Finds elements that have a certain class name
   * A wrapper around document.querySelectorAll if
   * supported, otherwise loops through all dom elements of given tagName
   * hunting for the className.
   *
   * @param {String} className Class name we're interested in
   * @param {HTMLElement} dom (optional) Element to search in
   * @param {String} tagName (optional) Type of tag to look for, default "*"
   * @return {Array}
   */
  getByClass: function(className, dom, tagName) {
    dom = dom || document.body;
    tagName = tagName || '*';
    if (dom.querySelectorAll) {
      return FB.Array.toArray(
        dom.querySelectorAll(tagName + '.' + className)
      );
    }
    var all = dom.getElementsByTagName(tagName),
        els = [];
    for (var i = 0, len = all.length; i < len; i++) {
      if (this.containsCss(all[i], className)) {
        els[els.length] = all[i];
      }
    }
    return els;
  },

  /**
   * Returns the computed style for the element
   *
   * note: requires browser specific names to be passed for specials
   *       border-radius -> ('-moz-border-radius', 'border-radius')
   *
   * @param dom {DOMElement} the element
   * @param styleProp {String} the property name
   */
  getStyle: function (dom, styleProp) {
    var y = false, s = dom.style;
    if (dom.currentStyle) { // camelCase (e.g. 'marginTop')
      FB.Array.forEach(styleProp.match(/\-([a-z])/g), function(match) {
        styleProp = styleProp.replace(match, match.substr(1,1).toUpperCase());
      });
      y = dom.currentStyle[styleProp];
    } else { // dashes (e.g. 'margin-top')
      FB.Array.forEach(styleProp.match(/[A-Z]/g), function(match) {
        styleProp = styleProp.replace(match, '-'+ match.toLowerCase());
      });
      if (window.getComputedStyle) {
        y = document.defaultView
         .getComputedStyle(dom,null).getPropertyValue(styleProp);
        // special handling for IE
        // for some reason it doesn't return '0%' for defaults. so needed to
        // translate 'top' and 'left' into '0px'
        if (styleProp == 'background-position-y' ||
            styleProp == 'background-position-x') {
          if (y == 'top' || y == 'left') { y = '0px'; }
        }
      }
    }
    if (styleProp == 'opacity') {
      if (dom.filters && dom.filters.alpha) {
        return y;
      }
      return y * 100;
    }
    return y;
  },

  /**
   * Sets the style for the element to value
   *
   * note: requires browser specific names to be passed for specials
   *       border-radius -> ('-moz-border-radius', 'border-radius')
   *
   * @param dom {DOMElement} the element
   * @param styleProp {String} the property name
   * @param value {String} the css value to set this property to
   */
  setStyle: function(dom, styleProp, value) {
    var s = dom.style;
    if (styleProp == 'opacity') {
      if (value >= 100) { value = 99.999; } // fix for Mozilla < 1.5b2
      if (value < 0) { value = 0; }
      s.opacity = value/100;
      s.MozOpacity = value/100;
      s.KhtmlOpacity = value/100;
      if (dom.filters) {
        if (dom.filters.alpha == undefined) {
         dom.filter = "alpha(opacity=" + value + ")";
        } else {
          dom.filters.alpha.opacity = value;
        }
      }
    } else { s[styleProp] = value; }
  },

  /**
   * Dynamically add a script tag.
   *
   * @param src {String} the url for the script
   */
  addScript: function(src) {
    var script = document.createElement('script');
    script.type = "text/javascript";
    script.src = src;
    return document.getElementsByTagName('head')[0].appendChild(script);
  },

  /**
   * Add CSS rules using a <style> tag.
   *
   * @param styles {String} the styles
   * @param names {Array} the component names that the styles represent
   */
  addCssRules: function(styles, names) {
    if (!FB.Dom._cssRules) {
      FB.Dom._cssRules = {};
    }

    // note, we potentially re-include CSS if it comes with other CSS that we
    // have previously not included.
    var allIncluded = true;
    FB.Array.forEach(names, function(id) {
      if (!(id in FB.Dom._cssRules)) {
        allIncluded = false;
        FB.Dom._cssRules[id] = true;
      }
    });

    if (allIncluded) {
      return;
    }

//#JSCOVERAGE_IF
    if (!FB.UA.ie()) {
      var style = document.createElement('style');
      style.type = 'text/css';
      style.textContent = styles;
      document.getElementsByTagName('head')[0].appendChild(style);
    } else {
      try {
        document.createStyleSheet().cssText = styles;
      } catch (exc) {
        // major problem on IE : You can only create 31 stylesheet objects with
        // this method. We will have to add the styles into an existing
        // stylesheet.
        if (document.styleSheets[0]) {
          document.styleSheets[0].cssText += styles;
        }
      }
    }
  },

  /**
   * Get the viewport info. Contains size and scroll offsets.
   *
   * @returns {Object} with the width and height
   */
  getViewportInfo: function() {
    // W3C compliant, or fallback to body
    var root = (document.documentElement && document.compatMode == 'CSS1Compat')
      ? document.documentElement
      : document.body;
    return {
      scrollTop  : root.scrollTop,
      scrollLeft : root.scrollLeft,
      width      : self.innerWidth  ? self.innerWidth  : root.clientWidth,
      height     : self.innerHeight ? self.innerHeight : root.clientHeight
    };
  },

  /**
   * Bind a function to be executed when the DOM is ready. It will be executed
   * immediately if the DOM is already ready.
   *
   * @param {Function} the function to invoke when ready
   */
  ready: function(fn) {
    if (FB.Dom._isReady) {
      fn && fn();
    } else {
      FB.Event.subscribe('dom.ready', fn);
    }
  },

  /**
   * Find where `node` is on the page
   *
   * @param {DOMElement} the element
   * @return {Object} with properties x and y
   */
  getPosition: function(node) {
    var x = 0,
        y = 0;
    do {
      x += node.offsetLeft;
      y += node.offsetTop;
    } while (node = node.offsetParent);

    return {x: x, y: y};
  }

});

// NOTE: This code is self-executing. This is necessary in order to correctly
// determine the ready status.
(function() {
  // Handle when the DOM is ready
  function domReady() {
    FB.Dom._isReady = true;
    FB.Event.fire('dom.ready');
    FB.Event.clear('dom.ready');
  }

  // In case we're already ready.
  if (FB.Dom._isReady || document.readyState == 'complete') {
    return domReady();
  }

  // Good citizens.
  if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', domReady, false);
  // Bad citizens.
  } else if (document.attachEvent) {
    document.attachEvent('onreadystatechange', domReady);
  }

  // Bad citizens.
  // If IE is used and page is not in a frame, continuously check to see if
  // the document is ready
  if (FB.UA.ie() && window === top) {
    (function() {
      try {
        // If IE is used, use the trick by Diego Perini
        // http://javascript.nwbox.com/IEContentLoaded/
        document.documentElement.doScroll('left');
      } catch(error) {
        setTimeout(arguments.callee, 0);
        return;
      }

      // and execute any waiting functions
      domReady();
    })();
  }

  // Ultimate Fallback.
  var oldonload = window.onload;
  window.onload = function() {
    domReady();
    if (oldonload) {
      if (typeof oldonload == 'string') {
        eval(oldonload);
      } else {
        oldonload();
      }
    }
  };
})();

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.intl
 * @requires fb.prelude
 */

/**
 * Provides i18n machinery.
 *
 * @class FB.Intl
 * @static
 * @access private
 */
FB.provide('Intl', (function() {
  /**
   * Regular expression snippet containing all the characters that we
   * count as sentence-final punctuation.
   */
  var _punctCharClass = (
    '[' +
      '.!?' +
      '\u3002' +  // Chinese/Japanese period
      '\uFF01' +  // Fullwidth exclamation point
      '\uFF1F' +  // Fullwidth question mark
      '\u0964' +  // Hindi "full stop"
      '\u2026' +  // Chinese ellipsis
      '\u0EAF' +  // Laotian ellipsis
      '\u1801' +  // Mongolian ellipsis
      '\u0E2F' +  // Thai ellipsis
      '\uFF0E' +  // Fullwidth full stop
    ']'
  );

  /**
   * Checks whether a string ends in sentence-final punctuation. This logic is
   * about the same as the PHP ends_in_punct() function; it takes into account
   * the fact that we consider a string like "foo." to end with a period even
   * though there's a quote mark afterward.
   */
  function _endsInPunct(str) {
    if (typeof str != 'string') {
      return false;
    }

    return str.match(new RegExp(
      _punctCharClass +
      '[' +
        ')"' +
        "'" +
        // JavaScript doesn't support Unicode character
        // properties in regexes, so we have to list
        // all of these individually. This is an
        // abbreviated list of the "final punctuation"
        // and "close punctuation" Unicode codepoints,
        // excluding symbols we're unlikely to ever
        // see (mathematical notation, etc.)
        '\u00BB' +  // Double angle quote
        '\u0F3B' +  // Tibetan close quote
        '\u0F3D' +  // Tibetan right paren
        '\u2019' +  // Right single quote
        '\u201D' +  // Right double quote
        '\u203A' +  // Single right angle quote
        '\u3009' +  // Right angle bracket
        '\u300B' +  // Right double angle bracket
        '\u300D' +  // Right corner bracket
        '\u300F' +  // Right hollow corner bracket
        '\u3011' +  // Right lenticular bracket
        '\u3015' +  // Right tortoise shell bracket
        '\u3017' +  // Right hollow lenticular bracket
        '\u3019' +  // Right hollow tortoise shell
        '\u301B' +  // Right hollow square bracket
        '\u301E' +  // Double prime quote
        '\u301F' +  // Low double prime quote
        '\uFD3F' +  // Ornate right parenthesis
        '\uFF07' +  // Fullwidth apostrophe
        '\uFF09' +  // Fullwidth right parenthesis
        '\uFF3D' +  // Fullwidth right square bracket
        '\s' +
      ']*$'
    ));
  }

  /**
   * i18n string formatting
   *
   * @param str {String} the string id
   * @param args {Object} the replacement tokens
   */
  function _substituteTokens(str, args) {
    // Does the token substitution for tx() but without the string lookup.
    // Used for in-place substitutions in translation mode.
    if (args !== undefined) {
      if (typeof args != 'object') {
        FB.log(
          'The second arg to FB.Intl.tx() must be an Object for ' +
          'FB.Intl.tx(' + str + ', ...)'
        );
      } else {
        var regexp;
        for (var key in args) {
          if (args.hasOwnProperty(key)) {
            // _substituteTokens("You are a {what}.", {what:'cow!'}) should be
            // "You are a cow!" rather than "You are a cow!."

            if (_endsInPunct(args[key])) {
              // Replace both the token and the sentence-final punctuation
              // after it, if any.
              regexp = new RegExp('\{' + key + '\}' +
                                    _punctCharClass + '*',
                                  'g');
            } else {
              regexp = new RegExp('\{' + key + '\}', 'g');
            }
            str = str.replace(regexp, args[key]);
          }
        }
      }
    }
    return str;
  }

  /**
   * i18n string formatting
   *
   * @access private
   * @param str {String} the string id
   * @param args {Object} the replacement tokens
   */
  function tx(str, args) {
    // Fail silently if the string table isn't defined. This behaviour is used
    // when a developer chooses the host the library themselves, rather than
    // using the one served from facebook.
    if (!FB.Intl._stringTable) {
      return null;
    }
    return _substituteTokens(FB.Intl._stringTable[str], args);
  }

  // FB.Intl.tx('key') is rewritten to FB.Intl.tx._('Translated value')
  tx._ = _substituteTokens;

  return {
    tx: tx,

    // Temporary, for push safety. We are renaming _tx to tx._, and need this
    // to allow users with the new JS to hit old servers.
    _tx: _substituteTokens
  };
})());

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.type
 * @layer basic
 * @requires fb.prelude
 */

// Provide Class/Type support.
// TODO: As a temporary hack, this docblock is written as if it describes the
// top level FB namespace. This is necessary because the current documentation
// parser uses the description from this file for some reason.
/**
 * The top level namespace exposed by the SDK. Look at the [readme on
 * **GitHub**][readme] for more information.
 *
 * [readme]: http://github.com/facebook/connect-js
 *
 * @class FB
 * @static
 */
FB.provide('', {
  /**
   * Bind a function to a given context and arguments.
   *
   * @static
   * @access private
   * @param fn {Function} the function to bind
   * @param context {Object} object used as context for function execution
   * @param {...} arguments additional arguments to be bound to the function
   * @returns {Function} the bound function
   */
  bind: function() {
    var
      args    = Array.prototype.slice.call(arguments),
      fn      = args.shift(),
      context = args.shift();
    return function() {
      return fn.apply(
        context,
        args.concat(Array.prototype.slice.call(arguments))
      );
    };
  },

  /**
   * Create a new class.
   *
   * Note: I have to use 'Class' instead of 'class' because 'class' is
   * a reserved (but unused) keyword.
   *
   * @access private
   * @param name {string} class name
   * @param constructor {function} class constructor
   * @param proto {object} instance methods for class
   */
  Class: function(name, constructor, proto) {
    if (FB.CLASSES[name]) {
      return FB.CLASSES[name];
    }

    var newClass = constructor ||  function() {};

    newClass.prototype = proto;
    newClass.prototype.bind = function(fn) {
      return FB.bind(fn, this);
    };

    newClass.prototype.constructor = newClass;
    FB.create(name, newClass);
    FB.CLASSES[name] = newClass;
    return newClass;
  },

  /**
   * Create a subclass
   *
   * Note: To call base class constructor, use this._base(...).
   * If you override a method 'foo' but still want to call
   * the base class's method 'foo', use this._callBase('foo', ...)
   *
   * @access private
   * @param {string} name class name
   * @param {string} baseName,
   * @param {function} constructor class constructor
   * @param {object} proto instance methods for class
   */
  subclass: function(name, baseName, constructor, proto) {
    if (FB.CLASSES[name]) {
      return FB.CLASSES[name];
    }
    var base = FB.create(baseName);
    FB.copy(proto, base.prototype);
    proto._base = base;
    proto._callBase = function(method) {
      var args = Array.prototype.slice.call(arguments, 1);
      return base.prototype[method].apply(this, args);
    };

    return FB.Class(
      name,
      constructor ? constructor : function() {
        if (base.apply) {
          base.apply(this, arguments);
        }
      },
      proto
    );
  },

  CLASSES: {}
});

/**
 * @class FB.Type
 * @static
 * @private
 */
FB.provide('Type', {
  isType: function(obj, type) {
    while (obj) {
      if (obj.constructor === type || obj === type) {
        return true;
      } else {
        obj = obj._base;
      }
    }
    return false;
  }
});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.obj
 * @requires fb.type
 *           fb.json
 *           fb.event
 */

/**
 * Base object type that support events.
 *
 * @class FB.Obj
 * @private
 */
FB.Class('Obj', null,
  FB.copy({
    /**
     * Set property on an object and fire property changed event if changed.
     *
     * @param {String} Property name. A event with the same name
     *                 will be fire when the property is changed.
     * @param {Object} new value of the property
     * @private
     */
     setProperty: function(name, value) {
       // Check if property actually changed
       if (FB.JSON.stringify(value) != FB.JSON.stringify(this[name])) {
         this[name] = value;
         this.fire(name, value);
       }
     }
  }, FB.EventProvider)
);

/**
 * @provides fb.dialog
 * @requires fb.arbiter
 *           fb.array
 *           fb.content
 *           fb.dom
 *           fb.event
 *           fb.intl
 *           fb.obj
 *           fb.prelude
 *           fb.type
 *           fb.ua
 *           fb.xd
 * @css fb.css.dialog
 */

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Dialog creation and management.
 * To get an object, do
 *   var dialog = FB.ui(...);
 * To subscribe to an event, do
 *   FB.dialog.subscribe(
 *     '<event name>', function() { alert("<event name> happened"); });
 * This dialog may fire the following events
 * 'iframe_hide'  This event is fired if an iframe dialog is hidden but not
 *    closed.  Note that the dialog may subsequently reopen, for example if
 *    there was an error.
 * 'iframe_show'  This event is fired when an iframe dialog is first shown, or
 *    when an error dialog is shown.
 * @class FB.Dialog
 * @public
 */
FB.subclass(
  'Dialog',
  'Obj',
  /**
   * constructor
   * @param id
   */
  function(id) {
    this.id = id;
    if (!FB.Dialog._dialogs) {
      FB.Dialog._dialogs = {};
      FB.Dialog._addOrientationHandler();
    }
    FB.Dialog._dialogs[id] = this;
  },

  // Members
  {
  }
);

FB.provide('Dialog', {
  /**
   *
   */
  _dialogs: null,
  _lastYOffset: 0,

  /**
   * The loader element.
   *
   * @access private
   * @type DOMElement
   */
  _loaderEl: null,

  /**
   * A la Snowbox overlay underneath the dialog on iPad.
   *
   * @access private
   * @type DOMElement
   */
  _overlayEl: null,

  /**
   * The stack of active dialogs.
   *
   * @access private
   * @type Array
   */
  _stack: [],

  /**
   * The currently visible dialog.
   *
   * @access private
   * @type DOMElement
   */
  _active: null,

  /**
   * The state of the popstate listener. Prevents multiple listeners from
   * being created.
   *
   * @access private
   * @type bool
   */
  _popStateListenerOn: false,

  /**
   * Hides open dialog on popstate event
   *
   * @access private
   */
  _hideOnPopState: function(e) {
    FB.Dialog.hide(FB.Dialog._stack.pop());
  },

  /**
   * Get dialog by id
   * @access private
   * @param id {string} dialog id
   * @return {Dialog} a dialog object
   */
  get: function(id) {
    return FB.Dialog._dialogs[id];
  },


  /**
   * Find the root dialog node for a given element. This will walk up the DOM
   * tree and while a node exists it will check to see if has the fb_dialog
   * class and if it does returns it.
   *
   * @access private
   * @param node {DOMElement} a child node of the dialog
   * @return {DOMElement} the root dialog element if found
   */
  _findRoot: function(node) {
    while (node) {
      if (FB.Dom.containsCss(node, 'fb_dialog')) {
        return node;
      }
      node = node.parentNode;
    }
  },

  _createWWWLoader: function(width) {
    width = parseInt(width, 10);
    width = width ? width : 460;
    return FB.Dialog.create({
      content: (
      '<div class="dialog_title">' +
      '  <a id="fb_dialog_loader_close">' +
      '    <div class="fb_dialog_close_icon"></div>' +
      '  </a>' +
      '  <span>Facebook</span>' +
      '  <div style="clear:both;"></div>' +
      '</div>' +
      '<div class="dialog_content"></div>' +
      '<div class="dialog_footer"></div>'),
      width: width
    });
  },

  _createMobileLoader: function() {
    // This chrome is native when possible.
    // We're copying the HTML/CSS output of an XHP element here
    // pretty much verbatim to easily keep them in sync.
    // Copied from e.g. facebook.com/dialog/feed as rendered
    // for a mobile user agent.
    var chrome = FB.UA.nativeApp() ?
      '' :
      ('<table>' +
      '  <tbody>' +
      '    <tr>' +
      '      <td class="header_left">' +
      '        <label class="touchable_button">' +
      '          <input type="submit" value="' +
                   FB.Intl.tx._("Cancel") + '"' +
      '            id="fb_dialog_loader_close"/>' +
      '        </label>' +
      '      </td>' +
      '      <td class="header_center">' +
      '        <div>' + FB.Intl.tx._("Loading...") + '</div>' +
      '      </td>' +
      '      <td class="header_right">' +
      '      </td>' +
      '    </tr>' +
      '  </tbody>' +
      '</table>');

    return FB.Dialog.create({
      classes: 'loading' + (FB.UA.iPad() ? ' centered' : ''),
      content: (
        '<div class="dialog_header">' +
          chrome +
        '</div>')
    });
  },

  _restoreBodyPosition: function() {
    if (!FB.UA.iPad()) {
      var body = document.getElementsByTagName('body')[0];
      FB.Dom.removeCss(body, 'fb_hidden');
    }
  },

  _showIPadOverlay: function() {
    if (!FB.UA.iPad()) {
      return;
    }
    if (!FB.Dialog._overlayEl) {
      FB.Dialog._overlayEl = document.createElement('div');
      FB.Dialog._overlayEl.setAttribute('id', 'fb_dialog_ipad_overlay');
      FB.Content.append(FB.Dialog._overlayEl, null);
    }
    FB.Dialog._overlayEl.className = '';
  },

  _hideIPadOverlay: function() {
    if (FB.UA.iPad()) {
      FB.Dialog._overlayEl.className = 'hidden';
    }
  },

  /**
   * Show the "Loading..." dialog. This is a special dialog which does not
   * follow the standard stacking semantics. If a callback is provided, a
   * cancel action is provided using the "X" icon.
   *
   * @param cb {Function} optional callback for the "X" action
   */
  showLoader: function(cb, width) {
    FB.Dialog._showIPadOverlay();

    if (!FB.Dialog._loaderEl) {
      FB.Dialog._loaderEl = FB.Dialog._findRoot(
        FB.UA.mobile()
        ? FB.Dialog._createMobileLoader()
        : FB.Dialog._createWWWLoader(width));
    }

    // this needs to be done for each invocation of showLoader. since we don't
    // stack loaders and instead simply hold on to the last one, it is possible
    // that we are showing nothing when we can potentially be showing the
    // loading dialog for a previously activated but not yet loaded dialog.
    if (!cb) {
      cb = function() {};
    }
    var loaderClose = FB.$('fb_dialog_loader_close');
    FB.Dom.removeCss(loaderClose, 'fb_hidden');
    loaderClose.onclick = function() {
      FB.Dialog._hideLoader();
      FB.Dialog._restoreBodyPosition();
      FB.Dialog._hideIPadOverlay();
      cb();
    };
    var iPadOverlay = FB.$('fb_dialog_ipad_overlay');
    if (iPadOverlay) {
      iPadOverlay.ontouchstart = loaderClose.onclick;
    }

    FB.Dialog._makeActive(FB.Dialog._loaderEl);
  },

  /**
   * Hide the loading dialog if one is being shown.
   *
   * @access private
   */
  _hideLoader: function() {
    if (FB.Dialog._loaderEl && FB.Dialog._loaderEl == FB.Dialog._active) {
      FB.Dialog._loaderEl.style.top = '-10000px';
    }
  },

  /**
   * Center a dialog based on its current dimensions and place it in the
   * visible viewport area.
   *
   * @access private
   * @param el {DOMElement} the dialog node
   */
  _makeActive: function(el) {
    FB.Dialog._setDialogSizes();
    FB.Dialog._lowerActive();
    FB.Dialog._active = el;
    if (FB.Canvas) {
      FB.Canvas.getPageInfo(function(pageInfo) {
        FB.Dialog._centerActive(pageInfo);
      });
    }
    // use the cached version of the pageInfo if slow or failed arbiter
    // or not in canvas
    FB.Dialog._centerActive(FB.Canvas._pageInfo);
  },

  /**
   * Lower the current active dialog if there is one.
   *
   * @access private
   * @param node {DOMElement} the dialog node
   */
  _lowerActive: function() {
    if (!FB.Dialog._active) {
      return;
    }
    FB.Dialog._active.style.top = '-10000px';
    FB.Dialog._active = null;
  },

  /**
   * Remove the dialog from the stack.
   *
   * @access private
   * @param node {DOMElement} the dialog node
   */
  _removeStacked: function(dialog) {
    FB.Dialog._stack = FB.Array.filter(FB.Dialog._stack, function(node) {
      return node != dialog;
    });
  },

  /**
   * Centers the active dialog vertically.
   *
   * @access private
   */
  _centerActive: function(pageInfo) {
    var dialog = FB.Dialog._active;
    if (!dialog) {
      return;
    }

    var view = FB.Dom.getViewportInfo();
    var width = parseInt(dialog.offsetWidth, 10);
    var height = parseInt(dialog.offsetHeight, 10);
    var left = view.scrollLeft + (view.width - width) / 2;

    // Minimum and maximum values for the top of the dialog;
    // these ensure that the dialog is always within the iframe's
    // dimensions, with some padding.
    // @todo(nikolay): When we refactor this module to avoid
    // the excessive use of if (FB.UA.mobile()), get rid of
    // this undesirable padding. It only looks bad on Desktop Safari
    // (because of the scrollbars).
    var minTop = (view.height - height) / 2.5;
    if (left < minTop) {
      minTop = left;
    }
    var maxTop = view.height - height - minTop;

    // center vertically within the page
    var top = (view.height - height) / 2;
    if (pageInfo) {
      top = pageInfo.scrollTop - pageInfo.offsetTop +
        (pageInfo.clientHeight - height) / 2;
    }

    // clamp to min and max
    if (top < minTop) {
      top = minTop;
    } else if (top > maxTop) {
      top = maxTop;
    }

    // offset by the iframe's scroll
    top += view.scrollTop;

    // The body element is hidden at -10000px while we
    // display dialogs. Full-screen on iPhone.
    if (FB.UA.mobile()) {
      // On mobile device (such as iPhone and iPad) that uses soft keyboard,
      // when a text field has focus and the keyboard is shown, the OS will
      // scroll a page to position the text field at the center of the remaining
      // space. If page doesn't have enough height, then OS will effectively
      // pull the page up by force while the keyboard is up, but the page will
      // slide down as soon as the keyboard is hidden.
      // When that happens, it can cause problems. For example, we had a nasty
      // problem with typeahead control in app request dialog. When user types
      // something in the control, the keyboard is up. However, when the user
      // tap a selection, the keyboard disappears. If the page starts to scroll
      // down, then the "click" event may fire from a differnt DOM element and
      // cause wrong item (or no item) to be selected.
      //
      // After a lot of hacking around, the best solution we found is to insert
      // an extra vertical padding element to give the page some extra space
      // such that page won't be forced to scroll beyeond its limit when
      // the text field inside the dialog needs to be centered. The negative
      // side effect of this hack is that there will be some extra space
      // that the user could scroll to.
      var paddingHeight = 100;

      // Smaller and centered on iPad. This should only run when the
      // dialog is first rendered or the device rotated.
      if (FB.UA.iPad()) {
        paddingHeight += (view.height - height) / 2;
      } else {
        var body = document.getElementsByTagName('body')[0];
        FB.Dom.addCss(body, 'fb_hidden');
        left = 10000;
        top = 10000;
      }

      var paddingDivs = FB.Dom.getByClass('fb_dialog_padding', dialog);
      if (paddingDivs.length) {
        paddingDivs[0].style.height = paddingHeight + 'px';
      }
    }

    dialog.style.left = (left > 0 ? left : 0) + 'px';
    dialog.style.top = (top > 0 ? top : 0) + 'px';
  },

  _setDialogSizes: function() {
    if (!FB.UA.mobile() || FB.UA.iPad()) {
      return;
    }
    for (var id in FB.Dialog._dialogs) {
      if (document.getElementById(id)) {
        var iframe = document.getElementById(id);
        iframe.style.width = FB.UIServer.getDefaultSize().width + 'px';
        iframe.style.height = FB.UIServer.getDefaultSize().height + 'px';
      }
    }
  },

  /**
   * This adapt the position and orientation of the dialogs.
   */
  _handleOrientationChange: function(e) {
    // Normally on Android, screen.availWidth/availHeight/width/height reflect
    // values corresponding to the current orientation. In other words,
    // width/height changes depending on orientation. However,
    // on Android 2.3 browser, the values do not change at the time of the
    // "orientation" event, but change shortly after (50-150ms later).
    //
    // This behavior is annoying. I now have to work around it by doing a
    // timer pulling in the orientation event to detect the correct
    // screen.availWidth/height now.
    if (FB.UA.android() && screen.availWidth == FB.Dialog._availScreenWidth) {
      window.setTimeout(FB.Dialog._handleOrientationChange, 50);
      return;
    }

    FB.Dialog._availScreenWidth = screen.availWidth;

    if (FB.UA.iPad()) {
      FB.Dialog._centerActive();
    } else {
      for (var id in FB.Dialog._dialogs) {
        // Resize the width of any iframes still on the page
        if (document.getElementById(id)) {
          document.getElementById(id).style.width =
            FB.UIServer.getDefaultSize().width + 'px';
        }
      }
    }
  },

  /**
   * Add some logic to fire on orientation change.
   */
  _addOrientationHandler: function() {
    if (!FB.UA.mobile()) {
      return;
    }
    // onOrientationChange is fired on iOS and some Android devices,
    // while other Android devices fire resize. Still other Android devices
    // seem to fire neither.
    var event_name = "onorientationchange" in window ?
      'orientationchange' :
      'resize';

    FB.Dialog._availScreenWidth = screen.availWidth;
    FB.Event.listen(window, event_name, FB.Dialog._handleOrientationChange);
  },

  /**
   * Create a dialog. Returns the node of the dialog within which the caller
   * can inject markup. Optional HTML string or a DOMElement can be passed in
   * to be set as the content. Note, the dialog is hidden by default.
   *
   * @access protected
   * @param opts {Object} Options:
   * Property  | Type              | Description                       | Default
   * --------- | ----------------- | --------------------------------- | -------
   * content   | String|DOMElement | HTML String or DOMElement         |
   * onClose   | Boolean           | callback if closed                |
   * closeIcon | Boolean           | `true` to show close icon         | `false`
   * visible   | Boolean           | `true` to make visible            | `false`
   * width     | Int               | width of dialog                   | 'auto'
   * classes   | String            | added to the dialog's classes     | ''
   *
   * @return {DOMElement} the dialog content root
   */
  create: function(opts) {
    opts = opts || {};

    var
      dialog      = document.createElement('div'),
      contentRoot = document.createElement('div'),
      className   = 'fb_dialog';

    // optional close icon
    if (opts.closeIcon && opts.onClose) {
      var closeIcon = document.createElement('a');
      closeIcon.className = 'fb_dialog_close_icon';
      closeIcon.onclick = opts.onClose;
      dialog.appendChild(closeIcon);
    }

    className += ' ' + (opts.classes || '');

    // handle rounded corners j0nx
//#JSCOVERAGE_IF
    if (FB.UA.ie()) {
      className += ' fb_dialog_legacy';
      FB.Array.forEach(
        [
          'vert_left',
          'vert_right',
          'horiz_top',
          'horiz_bottom',
          'top_left',
          'top_right',
          'bottom_left',
          'bottom_right'
        ],
        function(name) {
          var span = document.createElement('span');
          span.className = 'fb_dialog_' + name;
          dialog.appendChild(span);
        }
      );
    } else {
      className += (FB.UA.mobile())
        ? ' fb_dialog_mobile'
        : ' fb_dialog_advanced';
    }

    if (opts.content) {
      FB.Content.append(opts.content, contentRoot);
    }
    dialog.className = className;
    var width = parseInt(opts.width, 10);
    if (!isNaN(width)) {
      dialog.style.width = width + 'px';
    }
    contentRoot.className = 'fb_dialog_content';

    dialog.appendChild(contentRoot);
    if (FB.UA.mobile()) {
      var padding = document.createElement('div');
      padding.className = 'fb_dialog_padding';
      dialog.appendChild(padding);
    }

    FB.Content.append(dialog);

    if (opts.visible) {
      FB.Dialog.show(dialog);
    }

    return contentRoot;
  },

  /**
   * Raises the given iframe dialog. Any active dialogs are automatically
   * lowered. An active loading indicator is suppressed. An already-lowered
   * dialog will be raised and it will be put at the top of the stack. A dialog
   * never shown before will be added to the top of the stack.
   *
   * @access protected
   * @param dialog {DOMElement} a child element of the dialog
   */
  show: function(dialog) {
    var root = FB.Dialog._findRoot(dialog);
    if (root) {
      FB.Dialog._removeStacked(root);
      FB.Dialog._hideLoader();
      FB.Dialog._makeActive(root);
      FB.Dialog._stack.push(root);
      if ('fbCallID' in dialog) {
        FB.Dialog.get(dialog.fbCallID).fire('iframe_show');
      }
      if (!FB.Event._popStateListenerOn) {
        FB.Event.listen(window, 'popstate', FB.Dialog._hideOnPopState);
        FB.Event._popStateListenerOn = true;
      }
    }
  },

  /**
   * Hide the given iframe dialog. The dialog will be lowered and moved out
   * of view, but won't be removed.
   *
   * @access protected
   * @param dialog {DOMElement} a child element of the dialog
   */
  hide: function(dialog) {
    var root = FB.Dialog._findRoot(dialog);
    if (root == FB.Dialog._active) {
      FB.Dialog._lowerActive();
      FB.Dialog._restoreBodyPosition();
      FB.Dialog._hideIPadOverlay();
      if ('fbCallID' in dialog) {
        FB.Dialog.get(dialog.fbCallID).fire('iframe_hide');
      }
      if (FB.Event._popStateListenerOn) {
        FB.Event.unlisten(window, 'popstate', FB.Dialog._hideOnPopState);
        FB.Event._popStateListenerOn = false;
      }
    }
  },

  /**
   * Remove the dialog, show any stacked dialogs.
   *
   * @access protected
   * @param dialog {DOMElement} a child element of the dialog
   */
  remove: function(dialog) {
    dialog = FB.Dialog._findRoot(dialog);
    if (dialog) {
      var is_active = FB.Dialog._active == dialog;
      FB.Dialog._removeStacked(dialog);
      if (is_active) {
        FB.Dialog._hideLoader();
        if (FB.Dialog._stack.length > 0) {
          FB.Dialog.show(FB.Dialog._stack.pop());
        } else {
          FB.Dialog._lowerActive();
          FB.Dialog._restoreBodyPosition();
          FB.Dialog._hideIPadOverlay();
        }
      } else if (FB.Dialog._active === null && FB.Dialog._stack.length > 0) {
        FB.Dialog.show(FB.Dialog._stack.pop());
      }

      // wait before the actual removal because of race conditions with async
      // flash crap. seriously, dont ever ask me about it.
      // if we remove this without deferring, then in IE only, we'll get an
      // uncatchable error with no line numbers, function names, or stack
      // traces. the 3 second delay isn't a problem because the <div> is
      // already hidden, it's just not removed from the DOM yet.
      window.setTimeout(function() {
        dialog.parentNode.removeChild(dialog);
      }, 3000);
    }
  },

  /**
   * Whether a given node is contained within the active dialog's root
   *
   * @access public
   * @param dialog {DOMElement} a child element of the dialog
   */
  isActive: function(node) {
    var root = FB.Dialog._findRoot(node);
    return root && root === FB.Dialog._active;
  }

});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.ui
 * @requires fb.prelude
 *           fb.canvas
 *           fb.content
 *           fb.dialog
 *           fb.qs
 *           fb.json
 *           fb.xd
 *           fb.arbiter
 *           fb.ua
 */

/**
 * UI Calls.
 *
 * @class FB
 * @static
 * @access private
 */
FB.provide('', {
  /**
   * Method for triggering UI interaction with Facebook as iframe dialogs or
   * popups, like publishing to the stream, sharing links.
   *
   * Example **stream.publish**:
   *
   *      FB.ui(
   *        {
   *          method: 'stream.publish',
   *          message: 'getting educated about Facebook Connect',
   *          attachment: {
   *            name: 'Connect',
   *            caption: 'The Facebook Connect JavaScript SDK',
   *            description: (
   *              'A small JavaScript library that allows you to harness ' +
   *              'the power of Facebook, bringing the user\'s identity, ' +
   *              'social graph and distribution power to your site.'
   *            ),
   *            href: 'http://github.com/facebook/connect-js'
   *          },
   *          action_links: [
   *            { text: 'Code', href: 'http://github.com/facebook/connect-js' }
   *          ],
   *          user_message_prompt: 'Share your thoughts about Connect'
   *        },
   *        function(response) {
   *          if (response && response.post_id) {
   *            alert('Post was published.');
   *          } else {
   *            alert('Post was not published.');
   *          }
   *        }
   *      );
   *
   * Example **stream.share**:
   *
   *      var share = {
   *        method: 'stream.share',
   *        u: 'http://fbrell.com/'
   *      };
   *
   *      FB.ui(share, function(response) { console.log(response); });
   *
   * @access public
   * @param params {Object} The required arguments vary based on the method
   * being used, but specifying the method itself is mandatory. If *display* is
   * not specified, then iframe dialogs will be used when possible, and popups
   * otherwise.
   *
   * Property | Type    | Description                        | Argument
   * -------- | ------- | ---------------------------------- | ------------
   * method   | String  | The UI dialog to invoke.           | **Required**
   * display  | String  | Specify `"popup"` to force popups. | **Optional**
   * @param cb {Function} Optional callback function to handle the result. Not
   * all methods may have a response.
   */
  ui: function(params, cb) {
    params = FB.copy({}, params);
    if (!params.method) {
      FB.log('"method" is a required parameter for FB.ui().');
      return null;
    }

    // CORDOVA PATCH
    // If the nativeInterface arg is specified then call out to the nativeInterface 
    // which uses the native app rather than using the iframe / popup web
    if (FB._nativeInterface) {
        switch (params.method) {
            case 'auth.login':
                FB._nativeInterface.login(params, cb, function(e) {alert('Cordova Facebook Connect plugin fail on login!' + e);});
                break;
            case 'permissions.request':
                FB._nativeInterface.login(params, cb, function(e) {alert('Cordova Facebook Connect plugin fail on login!' + e);});
                break;
            case 'permissions.oauth':
                FB._nativeInterface.login(params, cb, function(e) {alert('Cordova Facebook Connect plugin fail on login!' + e);});
                break;
            case 'auth.logout':
                FB._nativeInterface.logout(cb, function(e) {alert('Cordova Facebook Connect plugin fail on logout!');});
                break;
            case 'auth.status':
                FB._nativeInterface.getLoginStatus(cb, function(e) {alert('Cordova Facebook Connect plugin fail on auth.status!');});
                break;
            case 'login.status':
                FB._nativeInterface.getLoginStatus(cb, function(e) {alert('Cordova Facebook Connect plugin fail on auth.status!');});
                break;
            case 'feed':
                FB._nativeInterface.dialog(params, cb, function(e) {alert('Cordova Facebook Connect plugin fail on auth.status!');});
                break;
            case 'apprequests':
                FB._nativeInterface.dialog(params, cb, function(e) {alert('Cordova Facebook Connect plugin fail on auth.status!');});
            break;
        }
        return;
    }
    
    // process popup-only permissions
    if ((params.method == 'permissions.request' ||
         params.method == 'permissions.oauth') &&
        (params.display == 'iframe' || params.display == 'dialog')) {
      var perms;
      var requested_perms;
      perms = params.scope;
      requested_perms = perms.split(/\s|,/g);
      // OAuth2 spec says scope should be space delimited, but
      // we previously accepted comma delimited strings.  We'll accept both.
      for (var i = 0; i < requested_perms.length; i++) {
        var perm = FB.String.trim(requested_perms[i]);
        // force a popup if we are not in the whitelist or we're set as
        // false explicitly (and if the perm value is nonempty)
        if (perm && !FB.initSitevars.iframePermissions[perm]) {
          params.display = 'popup';
          // we call this recursively to reprocess the prepareCall logic
          // and make sure we'll pass the right parameters.
          break;
        }
      }
    }

    var call = FB.UIServer.prepareCall(params, cb);
    if (!call) { // aborted
      return null;
    }

    // each allowed "display" value maps to a function
    var displayName = call.params.display;
    if (displayName === 'dialog') { // TODO remove once all dialogs are on
                                   // uiserver
      displayName = 'iframe';
    } else if (displayName === 'none') {
      displayName = 'hidden';
    }

    var displayFn = FB.UIServer[displayName];
    if (!displayFn) {
      FB.log('"display" must be one of "popup", ' +
             '"dialog", "iframe", "touch", "async", "hidden", or "none"');
      return null;
    }

    displayFn(call);

    return call.dialog;
  }
});

/**
 * Internal UI functions.
 *
 * @class FB.UIServer
 * @static
 * @access private
 */
FB.provide('UIServer', {
  /**
   * UI Methods will be defined in this namespace.
   */
  Methods: {},
  // Child iframes or popup windows.
  _loadedNodes   : {},
  _defaultCb     : {},
  _resultToken   : '"xxRESULTTOKENxx"',
  _forceHTTPS    : false,

  /**
   * Serves as a generic transform for UI Server dialogs. Once all dialogs are
   * built on UI Server, this will just become the default behavior.
   *
   * Current transforms:
   * 1) display=dialog -> display=iframe. Most of the old Connect stuff uses
   *    dialog, but UI Server uses iframe.
   * 2) Renaming of channel_url parameter to channel.
   */
  genericTransform: function(call) {
    if (call.params.display == 'dialog' || call.params.display == 'iframe') {
      call.params.display = 'iframe';
      call.params.channel = FB.UIServer._xdChannelHandler(
        call.id,
        'parent.parent'
      );
    }

    return call;
  },

  /**
   * Prepares a generic UI call. Some regular API call also go through
   * here though via hidden iframes.
   *
   * @access private
   * @param params {Object} the user supplied parameters
   * @param cb {Function} the response callback
   * @returns {Object} the call data
   */
  prepareCall: function(params, cb) {
    var
      name   = params.method.toLowerCase(),
      method = FB.copy({}, FB.UIServer.Methods[name]),
      id     = FB.guid(),
      // TODO(naitik) don't want to force login status over HTTPS just yet. all
      // other UI Server interactions will be forced over HTTPS,
      // Methods can choose to not use https by setting noHttps=true
      forceHTTPS = (method.noHttps !== true) &&
                   (FB._https ||
                    (name !== 'auth.status' && name != 'login.status'));
      FB.UIServer._forceHTTPS = forceHTTPS;

    // default stuff
    FB.copy(params, {
      api_key      : FB._apiKey,
      app_id       : FB._apiKey,
      locale       : FB._locale,
      sdk          : 'joey',
      access_token : forceHTTPS && FB.getAccessToken() || undefined
    });

    // overwrite display based on final param set
    params.display = FB.UIServer.getDisplayMode(method, params);

    // set the default dialog URL if one doesn't exist
    if (!method.url) {
      method.url = 'dialog/' + name;
    }
    // the basic call data
    var call = {
      cb     : cb,
      id     : id,
      size   : method.size || FB.UIServer.getDefaultSize(),
      url    : FB.getDomain(forceHTTPS ? 'https_www' : 'www') + method.url,
      forceHTTPS: forceHTTPS,
      params : params,
      name   : name,
      dialog : new FB.Dialog(id)
    };

    // optional method transform
    var transform = method.transform
      ? method.transform
      : FB.UIServer.genericTransform;
    if (transform) {
      call = transform(call);

      // nothing returned from a transform means we abort
      if (!call) {
        return;
      }
    }

    // setting these after to ensure the value is based on the final
    // params.display value
    var getXdRelationFn = method.getXdRelation || FB.UIServer.getXdRelation;
    var relation = getXdRelationFn(call.params);
    if (!(call.id in FB.UIServer._defaultCb) &&
        !('next' in call.params) &&
        !('redirect_uri' in call.params)) {
      call.params.next = FB.UIServer._xdResult(
        call.cb,
        call.id,
        relation,
        true // isDefault
      );
    }
    if (relation === 'parent') {
      call.params.channel_url = FB.UIServer._xdChannelHandler(
        id,
        'parent.parent'
      );
    }

    // Encode the params as a query string or in the fragment
    call = FB.UIServer.prepareParams(call);

    return call;
  },

  prepareParams: function(call) {
    var method = call.params.method;
    // Page iframes still hit /fbml/ajax/uiserver.php
    // which uses the old method names.
    // On the other hand, the new endpoint might not expect
    // the method as a param.
    if (!FB.Canvas.isTabIframe()) {
      delete call.params.method;
    }

    if (FB.TemplateUI && FB.TemplateUI.supportsTemplate(method, call)) {
      // Temporary debug info.
      if (FB.reportTemplates) {
        console.log("Using template for " + method + ".");
      }
      FB.TemplateUI.useCachedUI(method, call);
    } else {
      // flatten parameters as needed
      call.params = FB.JSON.flatten(call.params);
      var encodedQS = FB.QS.encode(call.params);

      // To overcome the QS length limitation on some browsers
      // (the fb native app is an exception because it doesn't
      // doesn't support POST for dialogs).
      if (!FB.UA.nativeApp() &&
          FB.UIServer.urlTooLongForIE(call.url + '?' + encodedQS)) {
        call.post = true;
      } else if (encodedQS) {
        call.url += '?' + encodedQS;
      }
    }

    return call;
  },

  urlTooLongForIE: function(fullURL) {
    return fullURL.length > 2000;
  },

  /**
   * Determine the display mode for the call.
   *
   * @param method {Object} the method definition object
   * @param params {Object} the developer supplied parameters
   * @return {String} the display mode
   */
  getDisplayMode: function(method, params) {
    if (params.display === 'hidden' ||
        params.display === 'none') {
      return params.display;
    }

    if (FB.Canvas.isTabIframe() &&
        params.display !== 'popup') {
      return 'async';
    }

    // For mobile, we should use touch display mode
    if (FB.UA.mobile() || params.display === 'touch') {
      return 'touch';
    }

    // cannot use an iframe "dialog" if an access token is not available
    if (!FB.getAccessToken() &&
        params.display == 'dialog' &&
        !method.loggedOutIframe) {
      FB.log('"dialog" mode can only be used when the user is connected.');
      return 'popup';
    }

    if (method.connectDisplay && !FB._inCanvas) {
      return method.connectDisplay;
    }

    // TODO change "dialog" to "iframe" once moved to uiserver
    return params.display || (FB.getAccessToken() ? 'dialog' : 'popup');
  },

  /**
   * Determine the frame relation for given params
   *
   * @param params {Object} the call params
   * @return {String} the relation string
   */
  getXdRelation: function(params) {
    var display = params.display;
    if (display === 'popup' || display === 'touch') {
      return 'opener';
    }
    if (display === 'dialog' || display === 'iframe' ||
        display === 'hidden' || display === 'none') {
      return 'parent';
    }
    if (display === 'async') {
      return 'parent.frames[' + window.name + ']';
    }
  },

  /**
   * Open a popup window with the given url and dimensions and place it at the
   * center of the current window.
   *
   * @access private
   * @param call {Object} the call data
   */
  popup: function(call) {
    // we try to place it at the center of the current window
    var
      _screenX   = typeof window.screenX      != 'undefined'
        ? window.screenX
        : window.screenLeft,
      screenY    = typeof window.screenY      != 'undefined'
        ? window.screenY
        : window.screenTop,
      outerWidth = typeof window.outerWidth   != 'undefined'
        ? window.outerWidth
        : document.documentElement.clientWidth,
      outerHeight = typeof window.outerHeight != 'undefined'
        ? window.outerHeight
        : (document.documentElement.clientHeight - 22), // 22= IE toolbar height

      // Mobile popups should never specify width/height features since it
      // messes with the dimension styles of the page layout.
      width    = FB.UA.mobile() ? null : call.size.width,
      height   = FB.UA.mobile() ? null : call.size.height,
      screenX  = (_screenX < 0) ? window.screen.width + _screenX : _screenX,
      left     = parseInt(screenX + ((outerWidth - width) / 2), 10),
      top      = parseInt(screenY + ((outerHeight - height) / 2.5), 10),
      features = [];

    if (width !== null) {
      features.push('width=' + width);
    }
    if (height !== null) {
      features.push('height=' + height);
    }
    features.push('left=' + left);
    features.push('top=' + top);
    features.push('scrollbars=1');
    if (call.name == 'permissions.request' ||
        call.name == 'permissions.oauth') {
      features.push('location=1,toolbar=0');
    }
    features = features.join(',');

    // either a empty window and then a POST, or a direct GET to the full url
    if (call.post) {
      FB.UIServer.setLoadedNode(call,
        window.open('about:blank', call.id, features), 'popup');
      FB.Content.submitToTarget({
        url    : call.url,
        target : call.id,
        params : call.params
      });
    } else {
      FB.UIServer.setLoadedNode(call,
        window.open(call.url, call.id, features), 'popup');
    }

    // if there's a default close action, setup the monitor for it
    if (call.id in FB.UIServer._defaultCb) {
      FB.UIServer._popupMonitor();
    }
  },

  setLoadedNode: function(call, node, type) {
    if (call.params && call.params.display != 'popup') {
      // Note that we avoid setting fbCallID property on node when
      // display is popup because when the page is loaded via http,
      // you can't set a property on an https popup window in IE.
      node.fbCallID = call.id;
    }
    node = {
      node: node,
      type: type,
      fbCallID: call.id
    };
    FB.UIServer._loadedNodes[call.id] = node;
  },

  getLoadedNode: function(call) {
    var id = typeof call == 'object' ? call.id : call,
        node = FB.UIServer._loadedNodes[id];
    return node ? node.node : null;
  },

  /**
   * Builds and inserts a hidden iframe based on the given call data.
   *
   * @access private
   * @param call {Object} the call data
   */
  hidden: function(call) {
    call.className = 'FB_UI_Hidden';
    call.root = FB.Content.appendHidden('');
    FB.UIServer._insertIframe(call);
  },

  /**
   * Builds and inserts a iframe dialog based on the given call data.
   *
   * @access private
   * @param call {Object} the call data
   */
  iframe: function(call) {
    call.className = 'FB_UI_Dialog';
    var onClose = function() {
      FB.UIServer._triggerDefault(call.id);
    };
    call.root = FB.Dialog.create({
      onClose: onClose,
      closeIcon: true,
      classes: (FB.UA.iPad() ? 'centered' : '')
    });
    if (!call.hideLoader) {
      FB.Dialog.showLoader(onClose, call.size.width);
    }
    FB.Dom.addCss(call.root, 'fb_dialog_iframe');
    FB.UIServer._insertIframe(call);
  },

  /**
   * Display an overlay dialog on a mobile device. This works both in the native
   *  mobile canvas frame as well as a regular mobile web browser.
   *
   * @access private
   * @param call {Object} the call data
   */
  touch: function(call) {
    if (call.params && call.params.in_iframe) {
      // Cached dialog was already created. Still show loader while it runs
      // JS to adapt its content to the FB.ui params.
      if (call.ui_created) {
        FB.Dialog.showLoader(function() {
          FB.UIServer._triggerDefault(call.id);
        }, 0);
      } else {
        FB.UIServer.iframe(call);
      }
    } else if (FB.UA.nativeApp() && !call.ui_created) {
      // When running inside native app, window.open is not supported.
      // We need to create an webview using custom JS bridge function
      call.frame = call.id;
      FB.Native.onready(function() {
        // TODO:
        // We normally use window.name to pass cb token, but
        // FB.Native.open doesn't accept a name parameter that it
        // can pass to webview, so we use pass name through
        // fragment for now. We should investigate to see if we can
        // pass a window.name
        FB.UIServer.setLoadedNode(call, FB.Native.open(
          call.url + '#cb=' + call.frameName));
      });
      FB.UIServer._popupMonitor();
    } else if (!call.ui_created) {
      // Use popup by default
      FB.UIServer.popup(call);
    }
  },

  /**
   * This is used when the application is running as a child iframe on
   * facebook.com. This flow involves sending a message to the parent frame and
   * asking it to render the UIServer dialog as part of the Facebook chrome.
   *
   * @access private
   * @param call {Object} the call data
   */
  async: function(call) {
    call.frame = window.name;
    delete call.url;
    delete call.size;
    FB.Arbiter.inform('showDialog', call);
  },

  getDefaultSize: function() {
    if (FB.UA.mobile()) {
      if (FB.UA.iPad()) {
        return {
          width: 500,
          height: 590
        };
      } else if (FB.UA.android()) {
        // Android browser needs special handling because
        // window.innerWidth/Height doesn't return correct values
        return {
          width: screen.availWidth,
          height: screen.availHeight
        };
      } else {
        var width = window.innerWidth;
        var height = window.innerHeight;
        var isLandscape = width / height > 1.2;
        // Make sure that the iframe width is not greater than screen width.
        // We also start by calculating full screen height. In that case,
        // window.innerHeight is not good enough because it doesn't take into
        // account the height of address bar, etc. So we tried to use
        // screen.width/height, but that alone is also not good enough because
        // screen value is physical pixel value, but we need virtual pixel
        // value because the virtual pixels value can be different from physical
        // values depending on viewport meta tags.
        // So in the end, we use the maximum value. It is OK
        // if the height is too high because our new mobile dialog flow the
        // content from top down.
        return {
          width: width,
          height: Math.max(height,
                         (isLandscape ? screen.width : screen.height))
        };
      }
    }
    return {width: 575, height: 240};
  },

  /**
   * Inserts an iframe based on the given call data.
   *
   * @access private
   * @param call {Object} the call data
   */
  _insertIframe: function(call) {
    // the dialog may be cancelled even before we have a valid iframe node
    // giving us a race condition. if this happens, the call.id will be removed
    // from the _frames nodes, and we won't add the node back in.
    FB.UIServer._loadedNodes[call.id] = false;
    var activate = function(node) {
      if (call.id in FB.UIServer._loadedNodes) {
        FB.UIServer.setLoadedNode(call, node, 'iframe');
      }
    };

    // either a empty iframe and then a POST, or a direct GET to the full url
    if (call.post) {
      FB.Content.insertIframe({
        url       : 'about:blank',
        root      : call.root,
        className : call.className,
        width     : call.size.width,
        height    : call.size.height,
        id        : call.id,
        onInsert  : activate,
        onload    : function(node) {
          FB.Content.submitToTarget({
            url    : call.url,
            target : node.name,
            params : call.params
          });
        }
      });
    } else {
      FB.Content.insertIframe({
        url       : call.url,
        root      : call.root,
        className : call.className,
        width     : call.size.width,
        height    : call.size.height,
        id        : call.id,
        name      : call.frameName,
        onInsert  : activate
      });
    }
  },

  /**
   * @param frame {String} the id of the iframe being resized
   * @param data {Object} data from the XD call it made
   *
   * @access private
   */
  _handleResizeMessage: function(frame, data) {
    var node = FB.UIServer.getLoadedNode(frame);
    if (!node) {
      return;
    }

    if (data.height) {
      node.style.height = data.height + 'px';
    }
    if (data.width) {
      node.style.width = data.width + 'px';
    }

    FB.Arbiter.inform(
      'resize.ack',
      data || {},
      'parent.frames[' + node.name + ']',
      true);

    if (!FB.Dialog.isActive(node)) {
      FB.Dialog.show(node);
    }
  },

  /**
   * Trigger the default action for the given call id.
   *
   * @param id {String} the call id
   */
  _triggerDefault: function(id) {
    FB.UIServer._xdRecv(
      { frame: id },
      FB.UIServer._defaultCb[id] || function() {}
    );
  },

  /**
   * Start and manage the window monitor interval. This allows us to invoke
   * the default callback for a window when the user closes the window
   * directly.
   *
   * @access private
   */
  _popupMonitor: function() {
    // check all open windows
    var found;
    for (var id in FB.UIServer._loadedNodes) {
      // ignore prototype properties, and ones without a default callback
      if (FB.UIServer._loadedNodes.hasOwnProperty(id) &&
          id in FB.UIServer._defaultCb) {
        var node = FB.UIServer._loadedNodes[id];
        if (node.type != 'popup') {
          continue;
        }
        win = node.node;

        try {
          // found a closed window
          if (win.closed) {
            FB.UIServer._triggerDefault(id);
          } else {
            found = true; // need to monitor this open window
          }
        } catch (y) {
          // probably a permission error
        }
      }
    }

    if (found && !FB.UIServer._popupInterval) {
      // start the monitor if needed and it's not already running
      FB.UIServer._popupInterval = window.setInterval(
        FB.UIServer._popupMonitor,
        100
      );
    } else if (!found && FB.UIServer._popupInterval) {
      // shutdown if we have nothing to monitor but it's running
      window.clearInterval(FB.UIServer._popupInterval);
      FB.UIServer._popupInterval = null;
    }
  },

  /**
   * Handles channel messages that do not kill the dialog or remove the handler.
   * Terminating logic should be handled within the "next" handler.
   *
   * @access private
   * @param frame {String} the frame id
   * @param relation {String} the frame relation
   * @return {String} the handler url
   */
  _xdChannelHandler: function(frame, relation) {
    var forceHTTPS = (FB.UIServer._forceHTTPS &&
      FB.UA.ie() !== 7);
    return FB.XD.handler(function(data) {
      var node = FB.UIServer.getLoadedNode(frame);
      if (!node) { // dead handler
        return;
      }

      if (data.type == 'resize') {
        FB.UIServer._handleResizeMessage(frame, data);
      } else if (data.type == 'hide') {
        FB.Dialog.hide(node);
      } else if (data.type == 'rendered') {
        var root = FB.Dialog._findRoot(node);
        FB.Dialog.show(root);
      } else if (data.type == 'fireevent') {
        FB.Event.fire(data.event);
      }
    }, relation, true, null, forceHTTPS);
  },

  /**
   * A "next handler" is a specialized XD handler that will also close the
   * frame.  This can be a hidden iframe, iframe dialog or a popup window.
   * Once it is fired it is also deleted.
   *
   * @access private
   * @param cb        {Function} the callback function
   * @param frame     {String}   frame id for the callback will be used with
   * @param relation  {String}   parent or opener to indicate window relation
   * @param isDefault {Boolean}  is this the default callback for the frame
   * @return         {String}   the xd url bound to the callback
   */
  _xdNextHandler: function(cb, frame, relation, isDefault) {
    if (isDefault) {
      FB.UIServer._defaultCb[frame] = cb;
    }

    return FB.XD.handler(function(data) {
      FB.UIServer._xdRecv(data, cb);
    }, relation) + '&frame=' + frame;
  },

  /**
   * Handles the parsed message, invokes the bound callback with the data and
   * removes the related window/frame. This is the asynchronous entry point for
   * when a message arrives.
   *
   * @access private
   * @param data {Object} the message parameters
   * @param cb {Function} the callback function
   */
  _xdRecv: function(data, cb) {
    var frame = FB.UIServer.getLoadedNode(data.frame);
    if (frame) {
      // iframe
      try {
        if (FB.Dom.containsCss(frame, 'FB_UI_Hidden')) {
          // wait before the actual removal because of race conditions with
          // async flash crap. seriously, dont ever ask me about it.
          window.setTimeout(function() {
            // remove the parentNode to match what FB.UIServer.hidden() does
            frame.parentNode.parentNode.removeChild(frame.parentNode);
          }, 3000);
        } else if (FB.Dom.containsCss(frame, 'FB_UI_Dialog')) {
          FB.Dialog.remove(frame);
          if (FB.TemplateUI && FB.UA.mobile()) {
            FB.TemplateUI.populateCache();
          }
        }
      } catch (x) {
        // do nothing, permission error
      }

      // popup window
      try {
        if (frame.close) {
          frame.close();
          FB.UIServer._popupCount--;
        }
      } catch (y) {
        // do nothing, permission error
      }

    }
    // cleanup and fire
    delete FB.UIServer._loadedNodes[data.frame];
    delete FB.UIServer._defaultCb[data.frame];
    cb(data);
  },

  /**
   * Some Facebook redirect URLs use a special ``xxRESULTTOKENxx`` to return
   * custom values. This is a convenience function to wrap a callback that
   * expects this value back.
   *
   * @access private
   * @param cb        {Function} the callback function
   * @param frame     {String}   the frame id for the callback is tied to
   * @param target    {String}   parent or opener to indicate window relation
   * @param isDefault {Boolean}  is this the default callback for the frame
   * @return          {String}   the xd url bound to the callback
   */
  _xdResult: function(cb, frame, target, isDefault) {
    return (
      FB.UIServer._xdNextHandler(function(params) {
        cb && cb(params.result &&
                 params.result != FB.UIServer._resultToken &&
                 FB.JSON.parse(params.result));
      }, frame, target, isDefault) +
      '&result=' + encodeURIComponent(FB.UIServer._resultToken)
    );
  }
});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 *
 * @provides fb.auth
 * @requires fb.prelude
 *           fb.qs
 *           fb.event
 *           fb.json
 *           fb.ui
 *           fb.ua
 */

/**
 * Authentication and Authorization.
 *
 * @class FB
 * @static
 * @access private
 */
FB.provide('', {
  /**
   * Find out the current status from the server, and get an authResponse if
   * the user is connected.
   *
   * The user's status or the question of *who is the current user* is
   * the first thing you will typically start with. For the answer, we
   * ask facebook.com. Facebook will answer this question in one of
   * two ways:
   *
   * 1. Someone you don't know.
   * 2. Someone you know and have interacted with.
   *    Here's an authResponse for them.
   *
   *     FB.getLoginStatus(function(response) {
   *       if (response.authResponse) {
   *         FB.assert(response.status === 'connected');
   *         // logged in and connected user, someone you know
   *       } else if (response.status === 'not_authorized') {
   *         // the user is logged in but not connected to the application
   *       } else {
   *         FB.assert(response.status === 'unknown');
   *         // the user isn't even logged in to Facebook.
   *       }
   *     });
   *
   * **Events**
   *
   * #### auth.login
   * This event is fired when your application first notices the user (in other
   * words, gets an authResponse  when it didn't already have a valid one).
   * #### auth.logout
   * This event is fired when your application notices that there is no longer
   * a valid user (in other words, it had an authResponse but can no longer
   * validate the current user).
   * #### auth.authResponseChange
   * This event is fired for **any** auth related change as they all affect the
   * access token: login, logout, and access token refresh.  Access tokens are
   * are refreshed over time as long as the user is active with your
   * application.
   * #### auth.statusChange
   * Typically you will want to use the auth.authResponseChange event,
   * but in rare cases, you want to distinguish between these three states:
   *
   * - Connected
   * - Logged into Facebook but not connected with your application
   * - Not logged into Facebook at all.
   *
   * The [FB.Event.subscribe][subscribe] and
   * [FB.Event.unsubscribe][unsubscribe] functions are used to subscribe to
   * these events. For example:
   *
   *     FB.Event.subscribe('auth.login', function(response) {
   *       // do something with response
   *     });
   *
   * The response object returned to all these events is the same as the
   * response from [FB.getLoginStatus][getLoginStatus], [FB.login][login] or
   * [FB.logout][logout]. This response object contains:
   *
   * status
   * : The status of the User. One of `connected`, `notConnected` or `unknown`.
   *
   * authResponse
   * : The authorization response.  The field is presented if and only if the
   *   user is logged in and connected to your app.
   *
   * [subscribe]: /docs/reference/javascript/FB.Event.subscribe
   * [unsubscribe]: /docs/reference/javascript/FB.Event.unsubscribe
   * [getLoginStatus]: /docs/reference/javascript/FB.getLoginStatus
   * [login]: /docs/reference/javascript/FB.login
   * [logout]: /docs/reference/javascript/FB.logout
   *
   * @access public
   * @param cb {Function} The callback function.
   * @param force {Boolean} Force reloading the login status (default `false`).
   */
  getLoginStatus: function(cb, force) {
    if (!FB._apiKey) {
      FB.log('FB.getLoginStatus() called before calling FB.init().');
      return;
    }

    // we either invoke the callback right away if the status has already been
    // loaded, or queue it up for when the load is done.
    if (cb) {
      if (!force && FB.Auth._loadState == 'loaded') {
        cb({ status: FB._userStatus,
             authResponse: FB._authResponse});
        return;
      } else {
        FB.Event.subscribe('FB.loginStatus', cb);
      }
    }

    // if we're already loading, and this is not a force load, we're done
    if (!force && FB.Auth._loadState == 'loading') {
      return;
    }

    FB.Auth._loadState = 'loading';

    // invoke the queued callbacks
    var lsCb = function(response) {
      // done
      FB.Auth._loadState = 'loaded';

      // invoke callbacks
      FB.Event.fire('FB.loginStatus', response);
      FB.Event.clear('FB.loginStatus');
    };

    FB.Auth.fetchLoginStatus(lsCb);
  },

  /**
   * Returns the full packet of information about the user and
   * his or her access token, or null if there's no active access
   * token.  This packet is referred to as the authorization response.
   *
   * @access public
   * return {Object} a record containing the access token, then user id,
   *                 the amount of time before it expires, and the
   *                 signed request (or null if there's no active access token).
   */
  getAuthResponse: function() {
    return FB._authResponse;
  },

  /**
   * Returns the access token embedded within the authResponse
   * (or null if it's not available).
   *
   * @access public
   * @return {String} the access token, if available, or null if not.
   */
  getAccessToken: function() {
    return (FB._authResponse && FB._authResponse.accessToken) || null;
  },

  /**
   * Returns the ID of the connected user, or 0 if
   * the user is logged out or otherwise couldn't be
   * discerned from cookie or access token information.
   *
   * @access public
   * @return {Integer} the ID of the logged in, connected user.
   */
  getUserID: function() {
    return FB._userID;
  },

  /**
   * Login/Authorize/Permissions.
   *
   * Once you have determined the user's status, you may need to
   * prompt the user to login. It is best to delay this action to
   * reduce user friction when they first arrive at your site. You can
   * then prompt and show them the "Connect with Facebook" button
   * bound to an event handler which does the following:
   *
   *     FB.login(function(response) {
   *       if (response.authResponse) {
   *         // user successfully logged in
   *       } else {
   *         // user cancelled login
   *       }
   *     });
   *
   * You should **only** call this on a user event as it opens a
   * popup. Most browsers block popups, _unless_ they were initiated
   * from a user event, such as a click on a button or a link.
   *
   *
   * Depending on your application's needs, you may need additional
   * permissions from the user. A large number of calls do not require
   * any additional permissions, so you should first make sure you
   * need a permission. This is a good idea because this step
   * potentially adds friction to the user's process. Another point to
   * remember is that this call can be made even _after_ the user has
   * first connected. So you may want to delay asking for permissions
   * until as late as possible:
   *
   *     FB.login(function(response) {
   *       if (response.authResponse) {
   *         // if you need to know which permissions were granted then
   *         // you can can make an fql-call
   *         FB.api({
   *                  method: 'fql.query',
   *                  query: 'select read_stream, publish_stream, ' +
   *                    'offline_access from permissions where uid=me()'
   *                },
   *                function (data) {
   *                  if (data[0].read_stream) {
   *                    // we have read_stream
   *                  }
   *                });
   *       } else {
   *         // user is not logged in
   *       }
   *     }, {scope:'read_stream, publish_stream, offline_access'});
   *
   * @access public
   * @param cb {Function} The callback function.
   * @param opts {Object} (_optional_) Options to modify login behavior.
   *
   * Name                     | Type    | Description
   * ------------------------ | ------- | -------------------------------------
   * enable_profile_selector  | Boolean | When true, prompt the user to grant
   *                          |         | permission for one or more Pages.
   * profile_selector_ids     | String  | Comma separated list of IDs to
   *                          |         | display in the profile selector.
   * scope                    | String  | Comma or space delimited list of
   *                          |         | [Extended permissions]
   *                          |         | (/docs/authentication/permissions).
   */
  login: function(cb, opts) {
    if (opts && opts.perms && !opts.scope) {
      opts.scope = opts.perms;
      delete opts.perms;
      FB.log('OAuth2 specification states that \'perms\' ' +
             'should now be called \'scope\'.  Please update.');
    }
    FB.ui(FB.copy({
        method: 'permissions.oauth',
        display: 'popup',
        domain: location.hostname
      }, opts || {}),
      cb);
  },

  /**
   * Logout the user in the background.
   *
   * Just like logging in is tied to facebook.com, so is logging out -- and
   * this call logs the user out of both Facebook and your site. This is a
   * simple call:
   *
   *     FB.logout(function(response) {
   *       // user is now logged out
   *     });
   *
   * NOTE: You can only log out a user that is connected to your site.
   *
   * @access public
   * @param cb {Function} The callback function.
   */
  logout: function(cb) {
    FB.ui({ method: 'auth.logout', display: 'hidden' }, cb);
  }
});

/**
 * Internal Authentication implementation.
 *
 * @class FB.Auth
 * @static
 * @access private
 */
FB.provide('Auth', {
  // pending callbacks for FB.getLoginStatus() calls
  _callbacks: [],
  _xdStorePath: 'xd_localstorage/',

  /**
   * Fetch a fresh login status from the server. This should not ordinarily
   * be called directly; use FB.getLoginStatus instead.
   */
  fetchLoginStatus: function(lsCb) {
    // CORDOVA PATCH
    if (FB.UA.mobile() && window.postMessage && window.localStorage && !FB._nativeInterface) {
           FB.Auth.staticAuthCheck(lsCb);
    } else {
      FB.ui({
          method: 'login.status',
          display: 'none',
          domain: location.hostname
        },
        lsCb
      );
    }
  },

  /**
   * Perform auth check using static endpoint first, then use
   * login_status as backup when static endpoint does not fetch any
   * results.
   */
  staticAuthCheck: function(lsCb) {
    var domain =  FB.getDomain('https_staticfb');
    FB.Content.insertIframe({
      root: FB.Content.appendHidden(''),
      className: 'FB_UI_Hidden',
      url: domain + FB.Auth._xdStorePath,
      onload: function(iframe) {
        var server = frames[iframe.name];
        var guid = FB.guid();
        var handled = false;
        var fn = function(response) {
          if (!handled) {
            handled = true;
            FB.Auth._staticAuthHandler(lsCb, response);
          }
        };

        FB.XD.handler(fn, 'parent', true, guid);
        // In case the static handler doesn't respond in time, we use
        // a timer to trigger a response.
        setTimeout(fn, 500);

        server.postMessage(
          FB.JSON.stringify({
            method: 'getItem',
            params: ['LoginInfo_' + FB._apiKey, /* do_log */ true],
            returnCb: guid
          }),
          domain);
      }
    });
  },

  _staticAuthHandler: function(cb, response) {
    if (response && response.data && response.data.status &&
        response.data.status == 'connected') {
      var r;
      var status = response.data.status;

      if (response.data.https == 1) {
        FB._https = true;
      }

      var authResponse = response.data.authResponse || null;
      r = FB.Auth.setAuthResponse(authResponse, status);
      cb && cb(r);
    } else {
      // finally make the call to login status
      FB.ui({ method: 'login.status', display: 'none' }, cb);
    }
  },

  /**
   * Sets new access token and user status values.  Invokes all the registered
   * subscribers if needed.
   *
   * @access private
   * @param authResponse {Object} the new auth response surrouning the access
   *                              token, user id, signed request, and expiry
   *                              time.
   * @param status       {String} the new status
   * @return             {Object} the "response" object, which is a simple
   *                              dictionary object surrounding the two
   *                              incoming values.
   */
  setAuthResponse: function(authResponse, status) {
    var userID = 0;
    if (authResponse) {
      // if there's an auth record, then there are a few ways we might
      // actually get a user ID out of it.  If an explcit user ID is provided,
      // then go with that.  If there's no explicit user ID, but there's a valid
      // signed request with a user ID inside, then use that as a backup.
      if (authResponse.userID) {
        userID = authResponse.userID;
      } else if (authResponse.signedRequest) {
        var parsedSignedRequest =
          FB.Auth.parseSignedRequest(authResponse.signedRequest);
        if (parsedSignedRequest && parsedSignedRequest.user_id) {
          userID = parsedSignedRequest.user_id;
        }
      }
    }

    var
      login = !FB._userID && authResponse,
      logout = FB._userID && !authResponse,
      both = authResponse && FB._userID != userID,
      authResponseChange = login || logout || both,
      statusChange = status != FB._userStatus;

    var response = {
      authResponse : authResponse,
      status : status
    };

    FB._authResponse = authResponse;
    FB._userID = userID;
    FB._userStatus = status;

    if (logout || both) {
      FB.Event.fire('auth.logout', response);
    }
    if (login || both) {
      FB.Event.fire('auth.login', response);
    }
    if (authResponseChange) {
      FB.Event.fire('auth.authResponseChange', response);
    }
    if (statusChange) {
      FB.Event.fire('auth.statusChange', response);
    }

    // re-setup a timer to refresh the authResponse if needed. we only do this
    // if FB.Auth._loadState exists, indicating that the application relies on
    // the JS to get and refresh authResponse information
    // (vs managing it themselves).
    if (FB.Auth._refreshTimer) {
      window.clearTimeout(FB.Auth._refreshTimer);
      delete FB.Auth._refreshTimer;
    }

    if (FB.Auth._loadState && authResponse) {
      FB.Auth._refreshTimer = window.setTimeout(function() {
        FB.getLoginStatus(null, true); // force refresh
      }, 1200000); // 20 minutes
    }

    return response;
  },

  _getContextType: function() {
    // Set session origin
    // WEB = 1
    // MOBILE_CANVAS = 2
    // NATIVE_MOBILE = 3
    // DESKTOP = 4
    // WEB_CANVAS = 5
    if (FB.UA.nativeApp()) {
      return 3;
    }
    if (FB.UA.mobile()) {
      return 2;
    }
    if (FB._inCanvas) {
      return 5;
    }
    return 1;
  },

  /**
   * This handles receiving an access token from:
   *  - /dialog/oauth
   *
   * Whenever a user is logged in and has connected to the application, the
   * params passed to the supplied callback include:
   *
   *   {
   *     access_token: an access token
   *     expires_in: the number of seconds before the access token expires
   *     code: the authorization code used to generate
   *     signed_request: the code/user_id cookie, provided if and only if
   *             cookies are enabled.
   *   }
   *
   * If the user is logged out, or if the user is logged in and not connected,
   * then the callback gets a smaller param record that includes:
   *
   *   {
   *     error: either 'not_authorized' or 'unknown'
   *   }
   *
   * @access private
   * @param cb                {Function} the callback function.
   * @param frame             {String}   the frame id the callback is tied to.
   * @param target            {String}   'parent' or 'opener' to indicate window
   *                                     relation.
   * @param authResponse {Object}   backup access token record, if not
   *                                     found in response.
   * @param method            {String}   the name of the method invoking this
   * @return                  {String}   the xd url bound to the callback
   */
  xdHandler: function(cb, frame, target, authResponse, method) {
    return FB.UIServer._xdNextHandler(
      FB.Auth.xdResponseWrapper(cb, authResponse, method),
      frame,
      target,
      true);
  },

  /**
   * This handles receiving an access token from:
   *  - /dialog/oauth
   *
   * It updates the internal SDK access token record based on the response
   * and invokes the (optional) user specified callback.
   *
   * Whenever a user is logged in and has connected to the application, the
   * callback gets the following passed to it:
   *
   *   {
   *     access_token: an access token
   *     expires_in: the number of seconds before the access token expires
   *     code: the authorization code used to generate
   *     signed_request: the code/user_id cookie, provided if and only if
   *             cookies are enabled.
   *   }
   *
   * If the user is logged out, or if the user is logged in and not connected,
   * then the callback gets a smaller param record that includes:
   *
   *   {
   *     error: either 'not_authorized' or 'unknown'
   *   }
   *
   * @access private
   * @param cb           {Function} the callback function
   * @param status       {String}   the connect status this handler will
   *                                trigger
   * @param authResponse {Object}   backup access token record, if none
   *                                is found in response
   * @param method       {String}   the name of the method invoking this
   * @return             {Function} the wrapped xd handler function
   */
  xdResponseWrapper: function(cb, authResponse, method) {
    return function(params) {
      if (params.access_token) {
        // Whatever this is a response to, it succeeded
        var parsedSignedRequest =
          FB.Auth.parseSignedRequest(params.signed_request);
        authResponse = {
          accessToken: params.access_token,
          userID: parsedSignedRequest.user_id,
          expiresIn: parseInt(params.expires_in, 10),
          signedRequest: params.signed_request
        };

        if (FB.Cookie.getEnabled()) {
          var expirationTime = authResponse.expiresIn === 0
            ? 0 // make this a session cookie if it's for offline access
            : (new Date()).getTime() + authResponse.expiresIn * 1000;

          var baseDomain = FB.Cookie._domain;
          if (!baseDomain && params.base_domain) {
            // if no base domain was set, and we got a base domain back
            // from the our side, lets use this and prepend . to also
            // cover subdomains (this will actually be added anyway by
            // the browser).
            baseDomain = '.' + params.base_domain;
          }
          FB.Cookie.setSignedRequestCookie(params.signed_request,
                                           expirationTime,
                                           baseDomain);
        }
        FB.Auth.setAuthResponse(authResponse, 'connected');
      } else if (!FB._authResponse && authResponse) {
        // Should currently not be hit since authResponse is a copy of
        // FB._authResponse

        // use the cached version we had access to
        FB.Auth.setAuthResponse(authResponse, 'connected');
      } else if (!(authResponse && method == 'permissions.oauth')) {
        // Do not enter this when we had an authResponse at the time
        // of calling permissions.oauth, and no access_token was returned.
        // This is the case when a TOSed app requests additional perms,
        // but the user skips this.
        var status;
        if (params.error && params.error === 'not_authorized') {
          status = 'not_authorized';
        } else {
          status = 'unknown';
        }
        FB.Auth.setAuthResponse(null, status);
        if (FB.Cookie.getEnabled()) {
          FB.Cookie.clearSignedRequestCookie();
        }
      }

      // Use HTTPS for future requests.
      if (params && params.https == 1 && !FB._https) {
        FB._https = true;
      }

      response = {
        authResponse: FB._authResponse,
        status: FB._userStatus
      };

      cb && cb(response);
    };
  },

  /**
   * Discards the signature part of the signed request
   * (we don't have the secret used to sign it, and we can't
   * expect developers to expose their secret here), and
   * base64URL-decodes and json-decodes the payload portion
   * to return a small dictionary around the authorization code
   * and user id.
   *
   * @return {Object} small JS object housing an authorization
   *         code and the user id.
   */
  parseSignedRequest: function(signed_request) {
    if (!signed_request) {
      return null;
    }

    var boom = signed_request.split('.', 2);
    // boom[0] is a signature that can't be verified here, because
    // we don't (and shouldn't) have client side access to the app secret
    var payload = boom[1];
    var data = FB.Auth.base64URLDecode(payload);
    return FB.JSON.parse(data);
  },

  /**
   * Standard algorithm to decode a packet known to be encoded
   * using the standard base64 encoding algorithm, save for the
   * difference that the packet contains - where there would normally
   * have been a +, and _ where there'd normally be a /.
   *
   * @param {String}
   */
  base64URLDecode: function(input) {
    // +'s and /'s are replaced, by Facebook, with urlencode-safe
    // characters - and _, respectively.  We could just changed the
    // key string, but better to clarify this and then go with the
    // standard key string, in case this code gets lifted and dropped
    // somewhere else.
    input = input.replace(/\-/g, '+').replace(/\_/g, '/');

    // our signed requests aren't automatically 0 mod 4 in length, so we
    // need to pad with some '=' characters to round it out.
    if (input.length % 4 !== 0) {
      var padding = 4 - input.length % 4;
      for (var d = 0; d < padding; d++) {
        input = input + '=';
      }
    }
    var keyStr =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var output = "";
    var chr1, chr2, chr3 = "";
    var enc1, enc2, enc3, enc4 = "";

    for (var i = 0; i < input.length; i += 4) {
      enc1 = keyStr.indexOf(input.charAt(i));
      enc2 = keyStr.indexOf(input.charAt(i + 1));
      enc3 = keyStr.indexOf(input.charAt(i + 2));
      enc4 = keyStr.indexOf(input.charAt(i + 3));
      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;
      output = output + String.fromCharCode(chr1);
      if (enc3 != 64) {
        output = output + String.fromCharCode(chr2);
      }
      if (enc4 != 64) {
        output = output + String.fromCharCode(chr3);
      }
      chr1 = chr2 = chr3 = "";
      enc1 = enc2 = enc3 = enc4 = "";
    }

    return unescape(output);
  }
});

FB.provide('UIServer.Methods', {
  'permissions.oauth': {
    url       : 'dialog/oauth',
    size      : { width: (FB.UA.mobile() ? null : 627),
                  height: (FB.UA.mobile() ? null : 326) },
    transform : function(call) {
      if (!FB._apiKey) {
        FB.log('FB.login() called before FB.init().');
        return;
      }

      // if an access token is already available and no additional
      // params are being requested (via a scope attribute within the params)
      // then the callback should be pinged directly without the round trip.
      if (FB._authResponse && !call.params.scope) {
        FB.log('FB.login() called when user is already connected.');
        call.cb && call.cb({ status: FB._userStatus,
                             authResponse: FB._authResponse });
        return;
      }

      var
        cb = call.cb,
        id = call.id;
      delete call.cb;
      FB.copy(
        call.params, {
          client_id : FB._apiKey,
          redirect_uri : FB.URI.resolve(
            FB.Auth.xdHandler(
              cb,
              id,
              'opener',
              FB._authResponse,
              'permissions.oauth')),
          origin : FB.Auth._getContextType(),
          response_type: 'token,signed_request',
          domain: location.hostname
        });

      return call;
    }
  },

  'auth.logout': {
    url       : 'logout.php',
    transform : function(call) {
      if (!FB._apiKey) {
        FB.log('FB.logout() called before calling FB.init().');
      } else if (!FB._authResponse) {
        FB.log('FB.logout() called without an access token.');
      } else {
        call.params.next = FB.Auth.xdHandler(call.cb,
                                             call.id,
                                             'parent',
                                             FB._authResponse);
        return call;
      }
    }
  },

  'login.status': {
    url       : 'dialog/oauth',
    transform : function(call) {
      var
        cb = call.cb,
        id = call.id;
      delete call.cb;
      FB.copy(call.params, {
        client_id : FB._apiKey,
        redirect_uri : FB.Auth.xdHandler(cb,
                                         id,
                                         'parent',
                                         FB._authResponse),
        origin : FB.Auth._getContextType(),
        response_type : 'token,signed_request,code',
        domain: location.hostname
      });

      return call;
    }
  }
});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 *
 * Contains the public method ``FB.Insights.setDoneLoading`` for tracking
 * application load times
 *
 * @provides fb.canvas.insights
 * @requires fb.canvas
 */

/**
 * @class FB.CanvasInsights
 * @static
 * @access public
 */
FB.provide('CanvasInsights', {
  /**
   * Deprecated - use FB.Canvas.setDoneLoading
   */
  setDoneLoading : function(callback) {
    FB.Canvas.setDoneLoading(callback);
  }
});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 *
 * @provides fb.cookie
 * @requires fb.prelude
 *           fb.qs
 *           fb.event
 */

/**
 * Cookie Support.
 *
 * @class FB.Cookie
 * @static
 * @access private
 */
FB.provide('Cookie', {
  /**
   * Holds the base_domain property to match the Cookie domain.
   *
   * @access private
   * @type String
   */
  _domain: null,

  /**
   * Indicate if Cookie support should be enabled.
   *
   * @access private
   * @type Boolean
   */
  _enabled: false,

  /**
   * Enable or disable Cookie support.
   *
   * @access private
   * @param val {Boolean} true to enable, false to disable
   */
  setEnabled: function(val) {
    FB.Cookie._enabled = !!val;
    if (typeof val == 'string') {
      FB.Cookie._domain = val;
    }
  },

  /**
   * Return the current status of the cookie system.
   *
   * @access private
   * @returns {Boolean} true if Cookie support is enabled
   */
  getEnabled: function() {
    return FB.Cookie._enabled;
  },

  /**
   * Try loading metadata from the unsecure fbm_ cookie
   *
   * @access private
   * @return {Object} the meta data for for the connect implementation
   */
  loadMeta: function() {
    var
      // note, we have the opening quote for the value in the regex, but do
      // not have a closing quote. this is because the \b already handles it.
      cookie = document.cookie.match('\\bfbm_' + FB._apiKey + '=([^;]*)\\b'),
      meta;

    if (cookie) {
      // url encoded session stored as "sub-cookies"
      meta = FB.QS.decode(cookie[1]);
      if (!FB.Cookie._domain) {
        // capture base_domain for use when we need to clear
        FB.Cookie._domain = meta.base_domain;
      }
    }

    return meta;
  },

  /**
   * Try loading the signedRequest from the cookie if one is found.
   *
   * @return {String} the cached signed request, or null if one can't be found.
   */
  loadSignedRequest: function() {
    var cookie =
      document.cookie.match('\\bfbsr_' + FB._apiKey + '=([^;]*)\\b');
    if (!cookie) {
      return null;
    }

    return cookie[1];
  },

  /**
   * Set the signed request cookie to something nonempty
   * and without expiration time, or clear it if the cookie is
   * missing or empty.
   *
   * @access private
   * @param {String} signed_request_cookie the code/user_id cookie
   *        in signed request format.
   * @param {Integer} The time at which the cookie should expire.
   * @param {String} The domain for which this cookie should be set.
   */
  setSignedRequestCookie: function(signed_request_cookie, expiration_time,
       base_domain) {
    if (!signed_request_cookie) {
      throw new Error('Value passed to FB.Cookie.setSignedRequestCookie ' +
                      'was empty.');
    }

    if (!FB.Cookie.getEnabled()) {
      return;
    }

    if (base_domain) {
      // store this so that we can use it when deleting the cookie
      var meta  = FB.QS.encode({
        base_domain: base_domain
      });
      FB.Cookie.setRaw('fbm_', meta, expiration_time, base_domain);
    }
    FB.Cookie._domain = base_domain;
    FB.Cookie.setRaw('fbsr_', signed_request_cookie, expiration_time,
        base_domain);
  },

  /**
   * Clears the signed request cookie normally set by
   * setSignedRequestCookie above.
   */
  clearSignedRequestCookie: function() {
    if (!FB.Cookie.getEnabled()) {
      return;
    }

    FB.Cookie.setRaw('fbsr_', '', 0, FB.Cookie._domain);
  },

  /**
   * Helper function to set cookie value.
   *
   * @access private
   * @param prefix {String} short string namespacing the cookie
   * @param val    {String} the string value (should already be encoded)
   * @param ts     {Number} a unix timestamp denoting expiration
   * @param domain {String} optional domain for cookie
   */
  setRaw: function(prefix, val, ts, domain) {
    // Start by clearing potentially overlapping cookies
    if (domain) {
      // No domain set (will become example.com)
      document.cookie =
        prefix + FB._apiKey + '=; expires=Wed, 04 Feb 2004 08:00:00 GMT;';
      // This domain, (will become .example.com)
      document.cookie =
        prefix + FB._apiKey + '=; expires=Wed, 04 Feb 2004 08:00:00 GMT;' +
        'domain=' + location.hostname + ';';
    }

    var expires = new Date(ts).toGMTString();
    document.cookie =
      prefix + FB._apiKey + '=' + val +
      (val && ts === 0 ? '' : '; expires=' + expires) +
      '; path=/' +
      (domain ? '; domain=' + domain : '');
  }
});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.frictionless
 * @requires fb.prelude
 *           fb.api
 *           fb.array
 *           fb.auth
 *           fb.event
 *           fb.string
 */

/**
 * Frictionless request recipient list management.
 *
 * @class FB.Frictionless
 * @static
 * @private
 */
FB.provide('Frictionless', {

  // mapping of user id to boolean indicating whether that recipient can receive
  // frictionless requests
  _allowedRecipients: {},

  _useFrictionless: false,

  /**
   * Requests the frictionless request recipient list via a graph api call.
   */
  _updateRecipients: function() {
    FB.Frictionless._allowedRecipients = {};
    FB.api('/me/apprequestformerrecipients', function(response) {
      if (!response || response.error) {
        return;
      }
      FB.Array.forEach(response.data, function(recipient) {
          FB.Frictionless._allowedRecipients[recipient.recipient_id] = true;
        }, false);
    });
  },

  /**
   * Subscribes to login event and updates recipients when it fire.
   */
  init: function() {
    FB.Frictionless._useFrictionless = true;
    FB.getLoginStatus(function(response) {
      if (response.status == 'connected') {
        FB.Frictionless._updateRecipients();
      }
    });
    FB.Event.subscribe('auth.login', function(login) {
      if (login.authResponse) {
        FB.Frictionless._updateRecipients();
      }
    });
  },

  /**
   * Returns a callback function wrapper that updates the recipient list
   * before calling the wrapped user callback
   *
   * @param cb {Function} the user callback function to wrap
   * @return {Function} the wrapped callback function
   */
  _processRequestResponse: function(cb, hidden) {
    return function(params) {
      var updated = params && params.updated_frictionless;
      if (FB.Frictionless._useFrictionless && updated) {
        // only update the recipient list if the request dialog was shown and
        // this is a frictionless app
        FB.Frictionless._updateRecipients();
      }

      if (params) {
        if (!hidden && params.frictionless) {
          FB.Dialog._hideLoader();
          FB.Dialog._restoreBodyPosition();
          FB.Dialog._hideIPadOverlay();
        }
        delete params.frictionless;
        delete params.updated_frictionless;
      }
      // call user callback
      cb && cb(params);
    };
  },

  /**
   * Checks if a set of user ids are all in the frictionless request recipient
   * list.  Handles number, string, and array inputs.
   *
   * @param user_ids {String|Number|Array} the user ids to test
   * @return {Boolean} whether all user ids allow frictionless requests
   */
  isAllowed: function(user_ids) {
    if (!user_ids) {
      return false;
    }

    if (typeof user_ids === 'number') {
      return FB.Frictionless._allowedRecipients[user_ids];
    }
    if (typeof user_ids === 'string') {
      user_ids = user_ids.split(',');
    }
    user_ids = FB.Array.map(user_ids, FB.String.trim);

    var allowed = true;
    var has_user_ids = false;
    FB.Array.forEach(user_ids, function(user_id) {
        allowed = allowed && FB.Frictionless._allowedRecipients[user_id];
        has_user_ids = true;
      }, false);
    return allowed && has_user_ids;
  }
});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 *
 * JavaScript library providing Facebook Connect integration.
 *
 * @provides fb.canvas.prefetcher
 * @requires fb.array
 *           fb.init
 *           fb.json
 *           fb.prelude
 */

/**
 * This class samples applications' resources and uploads them to Facebook so
 * that they may be flushed early if they are used frequently enough.
 * @class FB.Canvas.Prefetcher
 * @static
 * @access public
 */
FB.provide('Canvas.Prefetcher', {
  _sampleRate : 0,
  _appIdsBlacklist : [],
  _links : [],
  COLLECT_AUTOMATIC : 0,
  COLLECT_MANUAL : 1,
  _collectionMode : 0, // COLLECT_AUTOMATIC

  /**
   * Add a url for a resource that was used on this page load, but which did not
   * appear in the DOM (and thus Facebook could not detect it automatically).
   */
  addStaticResource: function(url) {
    if (!FB._inCanvas || !FB._apiKey) {
      return;
    }
    FB.Canvas.Prefetcher._links.push(url);
  },

  /**
   * Set collection mode:
   *   FB.Canvas.Prefetcher.COLLECT_AUTOMATIC (default) -
   *     FB automatically scrapes your application's DOM to
   *     determine which resources to report.  It will pick the top several.
   *     You can also call addResource() to inform FB of resources it missed.
   *   FB.Canvas.Prefetcher.COLLECT_MANUAL -
   *     FB does not automatically scrape your application.  Use this
   *     mode to completely control which resources are reported.  Also, you
   *     can use it to turn off early flush, or turn it off for certain page
   *     loads that you don't want to affect the statistics.
   *
   * Returns: true on success.
   */
  setCollectionMode: function(mode) {
      if (!FB._inCanvas || !FB._apiKey) {
        return false;
      }
      if (mode != FB.Canvas.Prefetcher.COLLECT_AUTOMATIC &&
          mode != FB.Canvas.Prefetcher.COLLECT_MANUAL) {
        return false;
      }
      FB.Canvas.Prefetcher._collectionMode = mode;
    },

  _maybeSample : function() {
    if (!FB._inCanvas || !FB._apiKey || !FB.Canvas.Prefetcher._sampleRate) {
      return;
    }

    var rand = Math.random();
    if (rand > 1 / FB.Canvas.Prefetcher._sampleRate) {
      return;
    }

    if (FB.Canvas.Prefetcher._appIdsBlacklist == '*') {
      return;
    }
    if (FB.Array.indexOf(
          FB.Canvas.Prefetcher._appIdsBlacklist,
          parseInt(FB._apiKey, 10)) != -1) {
      return;
    }
    // We are definitely taking a sample.  Wait 30 seconds to take it.
    window.setTimeout(FB.Canvas.Prefetcher._sample, 30000);
  },

  _sample : function() {
    // For now, get some random tags.  Will do a more complete job later.
    var resourceFieldsByTag = {
      object: 'data',
      link: 'href',
      script: 'src'
    };

    // Application wants control over what resources are flushed
    if (FB.Canvas.Prefetcher._collectionMode ==
        FB.Canvas.Prefetcher.COLLECT_AUTOMATIC) {
      FB.Array.forEach(resourceFieldsByTag, function(propertyName, tagName) {
          FB.Array.forEach(
            window.document.getElementsByTagName(tagName), function(tag) {
              if (tag[propertyName]) {
                FB.Canvas.Prefetcher._links.push(tag[propertyName]);
              }
            });
        });
    }

    // Hit API with a JSON array of links to resources
    var payload = FB.JSON.stringify(FB.Canvas.Prefetcher._links);
    FB.api(FB._apiKey + '/staticresources', 'post',
           { urls: payload, is_https: FB._https });

    FB.Canvas.Prefetcher._links = [];
  }
});

/**
 * Deprecated - use FB.Canvas.Prefetcher
 * @class FB.Canvas.EarlyFlush
 * @static
 * @access public
 */
FB.provide('Canvas.EarlyFlush', {
  addResource: function(url) {
    return FB.Canvas.Prefetcher.addStaticResource(url);
  },

  setCollectionMode: function(mode) {
    return FB.Canvas.Prefetcher.setCollectionMode(mode);
  }
});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 *
 * JavaScript library providing Facebook Connect integration.
 *
 * @provides fb.init
 * @requires fb.prelude
 *           fb.auth
 *           fb.api
 *           fb.canvas
 *           fb.canvas.prefetcher
 *           fb.cookie
 *           fb.frictionless
 *           fb.ui
 *           fb.ua
 *           fb.xd
 */

/**
 * This is the top level for all the public APIs.
 *
 * @class FB
 * @static
 * @access public
 */
FB.provide('', {

  // set by CONNECT_FB_INIT_CONFIG
  initSitevars : {},

  /**
   * Initialize the library.
   *
   * Typical initialization enabling all optional features:
   *
   *      <div id="fb-root"></div>
   *      <script src="http://connect.facebook.net/en_US/all.js"></script>
   *      <script>
   *        FB.init({
   *          appId  : 'YOUR APP ID',
   *          status : true, // check login status
   *          cookie : true, // cookies allow server access to signed_request
   *          xfbml  : true  // parse XFBML
   *        });
   *      </script>
   *
   * The best place to put this code is right before the closing
   * `</body>` tag.
   *
   * ### Asynchronous Loading
   *
   * The library makes non-blocking loading of the script easy to use by
   * providing the `fbAsyncInit` hook. If this global function is defined, it
   * will be executed when the library is loaded:
   *
   *     <div id="fb-root"></div>
   *     <script>
   *       window.fbAsyncInit = function() {
   *         FB.init({
   *           appId  : 'YOUR APP ID',
   *           status : true, // check login status
   *           cookie : true, // cookies allow server access to signed_request
   *           xfbml  : true  // parse XFBML
   *         });
   *       };
   *
   *       (function() {
   *         var e = document.createElement('script');
   *         e.src = document.location.protocol +
   *                 '//connect.facebook.net/en_US/all.js';
   *         e.async = true;
   *         document.getElementById('fb-root').appendChild(e);
   *       }());
   *     </script>
   *
   * The best place to put the asynchronous version of the code is right after
   * the opening `<body>` tag. This allows Facebook initialization to happen in
   * parallel with the initialization on the rest of your page.
   *
   * ### Internationalization
   *
   * Facebook Connect features are available many locales. You can replace the
   * `en_US` locale specifed above with one of the [supported Facebook
   * Locales][locales]. For example, to load up the library and trigger dialogs,
   * popups and plugins to be in Hindi (`hi_IN`), you can load the library from
   * this URL:
   *
   *     http://connect.facebook.net/hi_IN/all.js
   *
   * [locales]: http://wiki.developers.facebook.com/index.php/Facebook_Locales
   *
   * ### SSL
   *
   * Facebook Connect is also available over SSL. You should only use this when
   * your own page is served over `https://`. The library will rely on the
   * current page protocol at runtime. The SSL URL is the same, only the
   * protocol is changed:
   *
   *     https://connect.facebook.net/en_US/all.js
   *
   * **Note**: Some [UI methods][FB.ui] like **stream.publish** and
   * **stream.share** can be used without registering an application or calling
   * this method. If you are using an appId, all methods **must** be called
   * after this method.
   *
   * [FB.ui]: /docs/reference/javascript/FB.ui
   *
   * @access public
   * @param options {Object}
   *
   * Property             | Type    | Description                            | Argument   | Default
   * -------------------- | ------- | ------------------------------------   | ---------- | -------
   * appId                | String  | Your application ID.                   | *Optional* | `null`
   * cookie               | Boolean | `true` to enable cookie support.       | *Optional* | `false`
   * logging              | Boolean | `false` to disable logging.            | *Optional* | `true`
   * status               | Boolean | `false` to disable status ping.        | *Optional* | `true`
   * xfbml                | Boolean | `true` to parse [[wiki:XFBML]] tags.   | *Optional* | `false`
   * useCachedDialogs     | Boolean | `false` to disable cached dialogs      | *Optional* | `true`
   * frictionlessRequests | Boolean | `true` to enable frictionless requests | *Optional* | `false`
   * authResponse         | Object  | Use specified access token record      | *Optional* | `null`
   * hideFlashCallback    | function | (Canvas Only) callback for each flash element when popups overlay the page | *Optional* | `null`
   */
  init: function(options) {
    // only need to list values here that do not already have a falsy default.
    // this is why cookie/authResponse are not listed here.
    options = FB.copy(options || {}, {
      logging: true,
      status: true
    });

    FB._userID = 0; // assume unknown or disconnected unless proved otherwise
    FB._apiKey = options.appId || options.apiKey;

    // CORDOVA PATCH
    // if nativeInterface is specified then fire off the native initialization as well.
    FB._nativeInterface = options.nativeInterface;
    if (FB._nativeInterface) {
      FB._nativeInterface.init(FB._apiKey, function(e) {alert('Cordova Facebook Connect plugin fail on init!');});
    }
    
    // disable logging if told to do so, but only if the url doesnt have the
    // token to turn it on. this allows for easier debugging of third party
    // sites even if logging has been turned off.
    if (!options.logging &&
        window.location.toString().indexOf('fb_debug=1') < 0) {
      FB._logging = false;
    }

    FB.XD.init(options.channelUrl);

    if (FB.UA.mobile() && FB.TemplateUI &&
        FB.TemplateData && FB.TemplateData._enabled &&
        options.useCachedDialogs !== false) {
      FB.TemplateUI.init();
      FB.Event.subscribe('auth.statusChange', FB.TemplateData.update);
    }

    if (options.reportTemplates) {
      FB.reportTemplates = true;
    }

    if (options.frictionlessRequests) {
      FB.Frictionless.init();
    }

    if (FB._apiKey) {
      // enable cookie support if told to do so
      FB.Cookie.setEnabled(options.cookie);

    if (options.authResponse) {
        FB.Auth.setAuthResponse(options.authResponse,
                                'connected');
      } else {
        // we don't have an access token yet, but we might have a user
        // ID based on a signed request in the cookie.
        var signedRequest = FB.Cookie.loadSignedRequest();
        var parsedSignedRequest = FB.Auth.parseSignedRequest(signedRequest);
        FB._userID =
          (parsedSignedRequest && parsedSignedRequest.user_id) || 0;
        FB.Cookie.loadMeta();
      }

      // load a fresh authRequest (or access token) if requested
      if (options.status) {
        FB.getLoginStatus();
      }
    }

    if (FB._inCanvas) {
      FB.Canvas._setHideFlashCallback(options.hideFlashCallback);
      FB.Canvas.init();
    }

    FB.Event.subscribe('xfbml.parse', function() {
      FB.XFBML.IframeWidget.batchWidgetPipeRequests();
    });

    // weak dependency on XFBML
    if (options.xfbml) {
      // do this in a setTimeout to delay it until the current call stack has
      // finished executing
      window.setTimeout(function() {
        if (FB.XFBML) {
          if (FB.initSitevars.parseXFBMLBeforeDomReady) {
            // poll to render new elements as fast as possible,
            // without waiting for things like external js to load
            FB.XFBML.parse();
            var myI = window.setInterval(
              function() {
                FB.XFBML.parse();
              },
              100);
            FB.Dom.ready(
              function() {
                window.clearInterval(myI);
                FB.XFBML.parse();
              });
          } else {
            // traditional xfbml parse after dom is loaded
            FB.Dom.ready(FB.XFBML.parse);
          }
        }
      }, 0);
    }
    if (FB.Canvas && FB.Canvas.Prefetcher) {
      FB.Canvas.Prefetcher._maybeSample();
    }
  }
});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.ui.methods
 * @requires fb.prelude
 *           fb.ui
 *           fb.ua
 */


/**
 * Handler for UI dialogs that can be created as iframe dialog
 * on mobile browser.
 */
FB.provide('UIServer.MobileIframableMethod', {
  transform: function(call) {
    // For mobile display on mobile browsers that support
    // postMessage, we use iframe dialog if the app has
    // access token
    if (call.params.display === 'touch' &&
        call.params.access_token &&
        window.postMessage
       ) {
      // Prepare for iframe by adding an channel parameter
      // for resizing and add in_iframe parameter
      call.params.channel = FB.UIServer._xdChannelHandler(
        call.id,
        'parent'
      );
      // No iframe for modal dialogs in the native app
      if (!FB.UA.nativeApp()) {
        call.params.in_iframe = 1;
      }
      return call;
    } else {
      return FB.UIServer.genericTransform(call);
    }
  },
  getXdRelation: function(params) {
    var display = params.display;
    if (display === 'touch' && window.postMessage && params.in_iframe) {
      // mobile iframe directly use postMessage to communicate
      // with parent window for resizing, so the xd relation should be
      // parent instead of parent.parent.
      return 'parent';
    }
    return FB.UIServer.getXdRelation(params);
  }
});



/**
 * Simple UI methods. Consider putting complex UI methods in their own modules.
 */
FB.provide('UIServer.Methods', {
  'stream.share': {
    size      : { width: 650, height: 340 },
    url       : 'sharer.php',
    transform : function(call) {
      if (!call.params.u) {
        call.params.u = window.location.toString();
      }
      return call;
    }
  },

  'fbml.dialog': {
    size            : { width: 575, height: 300 },
    url             : 'render_fbml.php',
    loggedOutIframe : true,
    // if we left transform blank, it would default to UI Server's transform
    transform       : function(call) { return call; }
  },

  // Just logs a user into Facebook and does NOT TOS the application
  'auth.logintofacebook': {
    size            : { width: 530, height: 287 },
    url             : 'login.php',
    transform       : function(call) {
      // login.php will redirect you to uiserver if you have an api_key
      // without this param
      call.params.skip_api_login = 1;

      // login.php won't let you put the XDhandler as your next url unless you
      // are already logged in. After many attempts to do this with login.php,
      // it is easier to log you in, then send you back to login.php with the
      // next handler as the parameter. Feel free to do this in login.php
      // instead, if you can figure it out.
      var relation = FB.UIServer.getXdRelation(call.params);
      var next = FB.UIServer._xdResult(
          call.cb,
          call.id,
          relation,
          true // isDefault
        );
      call.params.next = FB.getDomain(FB._https ? 'https_www' : 'www') +
        "login.php?" + FB.QS.encode({
            api_key: FB._apiKey,
            next: next,
            skip_api_login: 1
        });

      return call;
    }
  },
  // Some extra stuff happens in FB.Frictionless.init() for this next one
  'apprequests': {
    transform: function(call) {
      call = FB.UIServer.MobileIframableMethod.transform(call);

      call.params.frictionless = FB.Frictionless &&
        FB.Frictionless._useFrictionless;
      if (call.params.frictionless) {

        if (FB.Frictionless.isAllowed(call.params.to)) {
          // Always use iframe (instead of popup or new webview)
          // for frictionless request that's already
          // enabled for the current user and app because this action
          // will be UI less.
          call.params.in_iframe = true;
          // hide load screen if this is a frictionless request
          call.hideLoader = true;
        }

        // wrap user specified callback
        call.cb = FB.Frictionless._processRequestResponse(
          call.cb,
          call.hideLoader
        );
      }
      return call;
    },
    getXdRelation: function(params) {
      return FB.UIServer.MobileIframableMethod.getXdRelation(params);
    }
  },
  'feed': FB.UIServer.MobileIframableMethod
});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 *
 * @provides fb.compat.ui
 * @requires fb.prelude
 *           fb.qs
 *           fb.ui
 *           fb.ui.methods
 *           fb.json
 */

/**
 * NOTE: You should use FB.ui() instead.
 *
 * UI Calls.
 *
 * @class FB
 * @static
 * @access private
 */
FB.provide('', {
  /**
   * NOTE: You should use FB.ui() instead.
   *
   * Sharing is the light weight way of distributing your content. As opposed
   * to the structured data explicitly given in the [FB.publish][publish] call,
   * with share you simply provide the URL.
   *
   *      FB.share('http://github.com/facebook/connect-js');
   *
   * Calling [FB.share][share] without any arguments will share the current
   * page.
   *
   * This call can be used without requiring the user to sign in.
   *
   * [publish]: /docs/?u=facebook.jslib-alpha.FB.publish
   * [share]: /docs/?u=facebook.jslib-alpha.FB.share
   *
   * @access private
   * @param u {String} the url (defaults to current URL)
   */
  share: function(u) {
    FB.log('FB.share() has been deprecated. Please use FB.ui() instead.');
    FB.ui({
      display : 'popup',
      method  : 'stream.share',
      u       : u
    });
  },

  /**
   * NOTE: You should use FB.ui() instead.
   *
   * Publish a post to the stream.
   *
   * This is the main, fully featured distribution mechanism for you
   * to publish into the user's stream. It can be used, with or
   * without an API key. With an API key you can control the
   * Application Icon and get attribution. You must also do this if
   * you wish to use the callback to get notified of the `post_id`
   * and the `message` the user typed in the published post, or find
   * out if the user did not publish (clicked on the skipped button).
   *
   * Publishing is a powerful feature that allows you to submit rich
   * media and provide a integrated experience with control over your
   * stream post. You can guide the user by choosing the prompt,
   * and/or a default message which they may customize. In addition,
   * you may provide image, video, audio or flash based attachments
   * with along with their metadata. You also get the ability to
   * provide action links which show next to the "Like" and "Comment"
   * actions. All this together provides you full control over your
   * stream post. In addition, if you may also specify a target for
   * the story, such as another user or a page.
   *
   * A post may contain the following properties:
   *
   * Property            | Type   | Description
   * ------------------- | ------ | --------------------------------------
   * message             | String | This allows prepopulating the message.
   * attachment          | Object | An [[wiki:Attachment (Streams)]] object.
   * action_links        | Array  | An array of [[wiki:Action Links]].
   * actor_id            | String | A actor profile/page id.
   * target_id           | String | A target profile id.
   * user_message_prompt | String | Custom prompt message.
   *
   * The post and all the parameters are optional, so use what is best
   * for your specific case.
   *
   * Example:
   *
   *     var post = {
   *       message: 'getting educated about Facebook Connect',
   *       attachment: {
   *         name: 'Facebook Connect JavaScript SDK',
   *         description: (
   *           'A JavaScript library that allows you to harness ' +
   *           'the power of Facebook, bringing the user\'s identity, ' +
   *           'social graph and distribution power to your site.'
   *         ),
   *         href: 'http://github.com/facebook/connect-js'
   *       },
   *       action_links: [
   *         {
   *           text: 'GitHub Repo',
   *           href: 'http://github.com/facebook/connect-js'
   *         }
   *       ],
   *       user_message_prompt: 'Share your thoughts about Facebook Connect'
   *     };
   *
   *     FB.publish(
   *       post,
   *       function(published_post) {
   *         if (published_post) {
   *           alert(
   *             'The post was successfully published. ' +
   *             'Post ID: ' + published_post.post_id +
   *             '. Message: ' + published_post.message
   *           );
   *         } else {
   *           alert('The post was not published.');
   *         }
   *       }
   *     );
   *
   * @access private
   * @param post {Object} the post object
   * @param cb {Function} called with the result of the action
   */
  publish: function(post, cb) {
    FB.log('FB.publish() has been deprecated. Please use FB.ui() instead.');
    post = post || {};
    FB.ui(FB.copy({
      display : 'popup',
      method  : 'stream.publish',
      preview : 1
    }, post || {}), cb);
  },

  /**
   * NOTE: You should use FB.ui() instead.
   *
   * Prompt the user to add the given id as a friend.
   *
   * @access private
   * @param id {String} the id of the target user
   * @param cb {Function} called with the result of the action
   */
  addFriend: function(id, cb) {
    FB.log('FB.addFriend() has been deprecated. Please use FB.ui() instead.');
    FB.ui({
      display : 'popup',
      id      : id,
      method  : 'friend.add'
    }, cb);
  }
});

// the "fake" UIServer method was called auth.login
FB.UIServer.Methods['auth.login'] = FB.UIServer.Methods['permissions.request'];

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.xfbml
 * @layer xfbml
 * @requires fb.prelude
 *           fb.array
 *           fb.dom
 *           fb.ua
 */

/**
 * Methods for the rendering of [[wiki:XFBML]] tags.
 *
 * To render the tags, simply put the tags anywhere in your page, and then
 * call:
 *
 *      FB.XFBML.parse();
 *
 * @class FB.XFBML
 * @static
 */
FB.provide('XFBML', {
  /**
   * The time allowed for all tags to finish rendering.
   *
   * @type Number
   */
  _renderTimeout: 30000,

  /**
   * Finds elements that will become plugins.
   * Looks for <fb:like> and <div class="fb-like">
   *
   * @param dom {DOMElement} the root DOM node
   * @param xmlns {String} the XML namespace
   * @param localName {String} the unqualified tag name
   * @return {Array}
   */
  getElements: function(dom, xmlns, localName) {
    var arr = FB.Array,
        xfbmlDoms = FB.XFBML._getDomElements(dom, xmlns, localName),
        html5Doms = FB.Dom.getByClass(xmlns + '-' + localName, dom, 'div');

    xfbmlDoms = arr.toArray(xfbmlDoms);
    html5Doms = arr.toArray(html5Doms);

    // filter out html5 candidates that are not empty
    // to prevent cases like <div class="fb-like"><fb:like></fb:like></div>
    html5Doms = arr.filter(html5Doms, function(el) {
      // let's throw it out unless
      // the child is just one (1) empty text node (nodeType 3)
      return !el.hasChildNodes() ||
             (el.childNodes.length === 1 && el.childNodes[0].nodeType === 3);
    });

    return arr.merge(xfbmlDoms, html5Doms);
  },

  /**
   * Parse and render XFBML markup in the document. XFBML enables you to
   * incorporate [FBML](../fbml) into your websites and IFrame applications.
   *
   * You can parse the following XFBML tags with this method:
   *
   *    * [fb:activity](../plugins/activity)
   *    * [fb:add-profile-tab](../fbml/add-profile-tab)
   *    * [fb:add-to-timeline](../plugins/add-to-timeline)
   *    * [fb:bookmark](../fbml/bookmark)
   *    * [fb:comments](../plugins/comments)
   *    * [fb:facepile](../plugins/facepile)
   *    * [fb:like](../plugins/like)
   *    * [fb:like-box](../plugins/like-box)
   *    * [fb:live-stream](../plugins/live-stream)
   *    * [fb:login-button](../plugins/login)
   *    * [fb:pronoun](../fbml/pronoun)
   *    * [fb:recommendations](../plugins/recommendations)
   *    * [fb:serverFbml](../fbml/serverFbml)
   *    * [fb:user-status](../fbml/user-status)
   *
   * Examples
   * --------
   *
   * By default, this is all you need to make XFBML work:
   *
   *       FB.XFBML.parse();
   *
   * Alternately, you may want to only evaluate a portion of
   * the document. In that case, you can pass in the elment.
   *
   *       FB.XFBML.parse(document.getElementById('foo'));
   *
   * @access public
   * @param dom {DOMElement} (optional) root DOM node, defaults to body
   * @param cb {Function} (optional) invoked when elements are rendered
   */
  parse: function(dom, cb) {
    dom = dom || document.body;

    // We register this function on each tag's "render" event. This allows us
    // to invoke the callback when we're done rendering all the found elements.
    //
    // We start with count=1 rather than 0, and finally call onTagDone() after
    // we've kicked off all the tag processing. This ensures that we do not hit
    // count=0 before we're actually done queuing up all the tags.
    var
      count = 1,
      onTagDone = function() {
        count--;
        if (count === 0) {
          // Invoke the user specified callback for this specific parse() run.
          cb && cb();

          // Also fire a global event. A global event is fired for each
          // invocation to FB.XFBML.parse().
          FB.Event.fire('xfbml.render');
        }
      };

    var cachedDomElements = {};
    if (FB.XFBML._widgetPipeIsEnabled()) {
      // first count the number of XFBML tags in the page that would benefit
      // from a transition to use Widget Pipe.  We do this, because we only
      // want to engage widget pipe if the overhead is counterbalanced by the
      // server-side generation time.  And to make sure we don't scan for,
      // say, all fb:like tags twice, we cache them so they can be referred
      // during the loop that formally processes all of the tags.
      FB.Array.forEach(FB.XFBML._tagInfos, function(tagInfo) {
        if (tagInfo.supportsWidgetPipe) {
          var xmlns = tagInfo.xmlns ? tagInfo.xmlns : 'fb';
          var xfbmlDoms = FB.XFBML.getElements(dom, xmlns, tagInfo.localName);
          cachedDomElements[tagInfo.localName] = xfbmlDoms;
          FB.XFBML._widgetPipeEnabledTagCount += xfbmlDoms.length;
        }
      });
    }

    // First, find all tags that are present
    FB.Array.forEach(FB.XFBML._tagInfos, function(tagInfo) {
      // default the xmlns if needed
      if (!tagInfo.xmlns) {
        tagInfo.xmlns = 'fb';
      }

      var xfbmlDoms;
      if (cachedDomElements[tagInfo.localName] !== undefined) {
        xfbmlDoms = cachedDomElements[tagInfo.localName];
      } else {
        xfbmlDoms = FB.XFBML.getElements(
          dom,
          tagInfo.xmlns,
          tagInfo.localName
        );
      }

      for (var i=0; i < xfbmlDoms.length; i++) {
        count++;
        FB.XFBML._processElement(xfbmlDoms[i], tagInfo, onTagDone);
      }
    });

    // Inform all tags that they've at least been processed, even if their
    // content hasn't quite been fetched yet.
    FB.Event.fire('xfbml.parse');

    // Setup a timer to ensure all tags render within a given timeout
    window.setTimeout(function() {
      if (count > 0) {
        FB.log(
          count + ' XFBML tags failed to render in ' +
          FB.XFBML._renderTimeout + 'ms.'
        );
      }
    }, FB.XFBML._renderTimeout);
    // Call once to handle count=1 as described above.
    onTagDone();
  },

  /**
   * Register a custom XFBML tag. If you create an custom XFBML tag, you can
   * use this method to register it so the it can be treated like
   * any build-in XFBML tags.
   *
   * Example
   * -------
   *
   * Register fb:name tag that is implemented by class FB.XFBML.Name
   *       tagInfo = {xmlns: 'fb',
   *                  localName: 'name',
   *                  className: 'FB.XFBML.Name'},
   *       FB.XFBML.registerTag(tagInfo);
   *
   * @access private
   * @param {Object} tagInfo
   * an object containiner the following keys:
   * - xmlns
   * - localName
   * - className
   */
  registerTag: function(tagInfo) {
    FB.XFBML._tagInfos.push(tagInfo);
  },

  /**
   * Decides on behalf of the entire document whether
   * using WidgetPipe is even worth it.
   *
   * @return {Boolean} true if and only if the number of
   *         widget-pipe-compatible tags exceeds a certain
   *         threshold.
   */

  shouldUseWidgetPipe: function() {
    if (!FB.XFBML._widgetPipeIsEnabled()) {
      return false;
    }

    var aboveThreshold =
      FB.XFBML._widgetPipeEnabledTagCount > 1;
    return aboveThreshold;
  },

  /**
   * Return a boolean value for a DOM attribute
   *
   * @param el {HTMLElement} DOM element
   * @param attr {String} Attribute name
   */
  getBoolAttr: function(el, attr) {
    attr = FB.XFBML.getAttr(el, attr);
    return (attr && FB.Array.indexOf(
              ['true', '1', 'yes', 'on'],
              attr.toLowerCase()) > -1);
  },

  /**
   * Return a value for a DOM attribute if exists
   * Checks the attrib name verbatim as well as
   * prepended with data-*
   *
   * @param el {HTMLElement} DOM element
   * @param attr {String} Attribute name
   */
  getAttr: function(el, attr) {
    return (
      el.getAttribute(attr) ||
      el.getAttribute(attr.replace(/_/g, '-')) ||
      el.getAttribute(attr.replace(/-/g, '_')) ||
      el.getAttribute(attr.replace(/-/g, '')) ||
      el.getAttribute(attr.replace(/_/g, '')) ||
      el.getAttribute('data-' + attr) ||
      el.getAttribute('data-' + attr.replace(/_/g, '-')) ||
      el.getAttribute('data-' + attr.replace(/-/g, '_')) ||
      el.getAttribute('data-' + attr.replace(/-/g, '')) ||
      el.getAttribute('data-' + attr.replace(/_/g, '')) ||
      null
    );
  },

  //////////////// Private methods ////////////////////////////////////////////

  /**
   * Process an XFBML element.
   *
   * @access private
   * @param dom {DOMElement} the dom node
   * @param tagInfo {Object} the tag information
   * @param cb {Function} the function to bind to the "render" event for the tag
   */
  _processElement: function(dom, tagInfo, cb) {
    // Check if element for the dom already exists
    var element = dom._element;
    if (element) {
      element.subscribe('render', cb);
      element.process();
    } else {
      var processor = function() {
        var fn = eval(tagInfo.className);

        // TODO(naitik) cleanup after f8
        //
        // currently, tag initialization is done via a constructor function,
        // there by preventing a tag implementation to vary between two types
        // of objects. post f8, this should be changed to a factory function
        // which would allow the login button to instantiate the Button based
        // tag or Iframe based tag depending on the attribute value.
        var isLogin = false;
        var showFaces = true;
        var showLoginFace = false;
        var renderInIframe = false;
        var addToTimeline = (tagInfo.className === 'FB.XFBML.AddToTimeline');
        if ((tagInfo.className === 'FB.XFBML.LoginButton') || addToTimeline) {
          renderInIframe = FB.XFBML.getBoolAttr(dom, 'render-in-iframe');
          mode = FB.XFBML.getAttr(dom, 'mode');
          showFaces = (addToTimeline && mode != 'button') ||
                      FB.XFBML.getBoolAttr(dom, 'show-faces');
          showLoginFace = FB.XFBML.getBoolAttr(dom, 'show-login-face');
          isLogin = addToTimeline ||
                    renderInIframe ||
                    showFaces ||
                    showLoginFace ||
                    FB.XFBML.getBoolAttr(dom, 'oneclick');
          if (isLogin && !addToTimeline) {
            // override to be facepile-ish for an app id
            fn = FB.XFBML.Login;
          }
        }

        element = dom._element = new fn(dom);
        if (isLogin) {
          showFaces = !!showFaces;
          showLoginFace = !!showLoginFace;
          var extraParams = {show_faces: showFaces,
                             show_login_face: showLoginFace,
                             add_to_profile: addToTimeline,
                             mode: mode};

          // For now we support both the perms and scope attribute
          var scope = FB.XFBML.getAttr(dom, 'scope') ||
            FB.XFBML.getAttr(dom, 'perms');
          if (scope) {
            extraParams.scope = scope;
          }
          element.setExtraParams(extraParams);
        }

        element.subscribe('render', cb);
        element.process();
      };

      if (FB.CLASSES[tagInfo.className.substr(3)]) {
        processor();
      } else {
        FB.log('Tag ' + tagInfo.className + ' was not found.');
      }
    }
  },

  /**
   * Get all the DOM elements present under a given node with a given tag name.
   *
   * @access private
   * @param dom {DOMElement} the root DOM node
   * @param xmlns {String} the XML namespace
   * @param localName {String} the unqualified tag name
   * @return {DOMElementCollection}
   */
  _getDomElements: function(dom, xmlns, localName) {
    // Different browsers behave slightly differently in handling tags
    // with custom namespace.
    var fullName = xmlns + ':' + localName;

    if (FB.UA.firefox()) {
      // Use document.body.namespaceURI as first parameter per
      // suggestion by Firefox developers.
      // See https://bugzilla.mozilla.org/show_bug.cgi?id=531662
      return dom.getElementsByTagNameNS(document.body.namespaceURI, fullName);
    } else if (FB.UA.ie() < 9) {
      // accessing document.namespaces when the library is being loaded
      // asynchronously can cause an error if the document is not yet ready
      try {
        var docNamespaces = document.namespaces;
        if (docNamespaces && docNamespaces[xmlns]) {
          var nodes = dom.getElementsByTagName(localName);
          // if it's a modern browser, and we haven't found anything yet, we
          // can try the fallback below, otherwise return whatever we found.
          if (!document.addEventListener || nodes.length > 0) {
            return nodes;
          }
        }
      } catch (e) {
        // introspection doesn't yield any identifiable information to scope
      }
      // It seems that developer tends to forget to declare the fb namespace
      // in the HTML tag (xmlns:fb="http://ogp.me/ns/fb#") IE
      // has a stricter implementation for custom tags. If namespace is
      // missing, custom DOM dom does not appears to be fully functional. For
      // example, setting innerHTML on it will fail.
      //
      // If a namespace is not declared, we can still find the element using
      // GetElementssByTagName with namespace appended.
      return dom.getElementsByTagName(fullName);
    } else {
      return dom.getElementsByTagName(fullName);
    }
  },

  /**
   * Register the default set of base tags. Each entry must have a localName
   * and a className property, and can optionally have a xmlns property which
   * if missing defaults to 'fb'.
   *
   * NOTE: Keep the list alpha sorted.
   */
  _tagInfos: [
    { localName: 'activity',        className: 'FB.XFBML.Activity'        },
    { localName: 'add-profile-tab', className: 'FB.XFBML.AddProfileTab'   },
    { localName: 'add-to-timeline', className: 'FB.XFBML.AddToTimeline'   },
    { localName: 'bookmark',        className: 'FB.XFBML.Bookmark'        },
    { localName: 'comments',        className: 'FB.XFBML.Comments'        },
    { localName: 'comments-count',  className: 'FB.XFBML.CommentsCount'   },
    { localName: 'connect-bar',     className: 'FB.XFBML.ConnectBar'      },
    { localName: 'fan',             className: 'FB.XFBML.Fan'             },
    { localName: 'like',            className: 'FB.XFBML.Like',
      supportsWidgetPipe: true                                            },
    { localName: 'like-box',        className: 'FB.XFBML.LikeBox'         },
    { localName: 'live-stream',     className: 'FB.XFBML.LiveStream'      },
    { localName: 'login',           className: 'FB.XFBML.Login'           },
    { localName: 'login-button',    className: 'FB.XFBML.LoginButton'     },
    { localName: 'facepile',        className: 'FB.XFBML.Facepile'        },
    { localName: 'friendpile',      className: 'FB.XFBML.Friendpile'      },
    { localName: 'name',            className: 'FB.XFBML.Name'            },
    { localName: 'profile-pic',     className: 'FB.XFBML.ProfilePic'      },
    { localName: 'question',        className: 'FB.XFBML.Question'        },
    { localName: 'recommendations', className: 'FB.XFBML.Recommendations' },
    { localName: 'recommendations-bar',
      className: 'FB.XFBML.RecommendationsBar' },
    { localName: 'registration',    className: 'FB.XFBML.Registration'    },
    { localName: 'send',            className: 'FB.XFBML.Send'            },
    { localName: 'serverfbml',      className: 'FB.XFBML.ServerFbml'      },
    { localName: 'share-button',    className: 'FB.XFBML.ShareButton'     },
    { localName: 'social-context',  className: 'FB.XFBML.SocialContext'   },
    { localName: 'subscribe',       className: 'FB.XFBML.Subscribe'       }
  ],

  // the number of widget-pipe-compatible tags we found in the DOM
  _widgetPipeEnabledTagCount: 0,

  /**
   * Returns true if and only if we're willing to try out WidgetPipe
   * in hopes of increasing plugin parallelization.
   */
  _widgetPipeIsEnabled: function() {
    return FB.widgetPipeEnabledApps &&
      FB.widgetPipeEnabledApps[FB._apiKey] !== undefined;
  }
});

/*
 * For IE, we will try to detect if document.namespaces contains 'fb' already
 * and add it if it does not exist.
 */
// wrap in a try/catch because it can throw an error if the library is loaded
// asynchronously and the document is not ready yet
(function() {
  try {
    if (document.namespaces && !document.namespaces.item.fb) {
       document.namespaces.add('fb');
    }
  } catch(e) {
    // introspection doesn't yield any identifiable information to scope
  }
}());

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.compat.xfbml
 * @requires fb.prelude
 *           fb.xfbml
 */

/**
 * Methods for the rendering of [[wiki:XFBML]] tags.
 *
 * To render the tags, simply put the tags anywhere in your page, and then
 * call:
 *
 *      FB.XFBML.parse();
 *
 * @class FB.XFBML
 * @static
 */
FB.provide('XFBML', {
  /**
   * NOTE: This method is deprecated. You should instead set the innerHTML
   * yourself and call FB.XFBML.parse() on the DOMElement after.
   *
   * Dynamically set XFBML markup on a given DOM element. Use this
   * method if you want to set XFBML after the page has already loaded
   * (for example, in response to an Ajax request or API call).
   *
   * Example:
   * --------
   * Set the innerHTML of a dom element with id "container"
   * to some markup (fb:name + regular HTML) and render it
   *
   *      FB.XFBML.set(FB.$('container'),
   *          '<fb:name uid="4"></fb:name><div>Hello</div>');
   *
   * @access private
   * @param {DOMElement} dom  DOM element
   * @param {String} markup XFBML markup. It may contain reguarl
   *         HTML markup as well.
   */
  set: function(dom, markup, cb) {
    FB.log('FB.XFBML.set() has been deprecated.');
    dom.innerHTML = markup;
    FB.XFBML.parse(dom, cb);
  }
});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.waitable
 * @layer data
 * @requires fb.prelude fb.type fb.string fb.array fb.event fb.obj
 */

/**
 * A container for asynchronous data that may not be available immediately.
 * This is base type for results returned from FB.Data.query()
 * method.
 *
 * @class FB.Waitable
 */
FB.subclass('Waitable', 'Obj',
  /**
   * Construct a Waitable object.
   *
   * @access private
   * @constructor
   */
  function() {},
  {
  /**
   * Set value property of the data object. This will
   * cause "value" event to be fire on the object. Any callback functions
   * that are waiting for the data through wait() methods will be invoked
   * if the value was previously not set.
   *
   * @private
   * @param {Object} value new value for the Waitable
   */
  set: function(value) {
    this.setProperty('value', value);
  },


  /**
   * Fire the error event.
   *
   * @access private
   * @param ex {Exception} the exception object
   */
  error: function(ex) {
    this.fire("error", ex);
  },

  /**
   * Register a callback for an asynchronous value, which will be invoked when
   * the value is ready.
   *
   * Example
   * -------
   *
   * In this
   *      val v = get_a_waitable();
   *      v.wait(function (value) {
   *        // handle the value now
   *      },
   *      function(error) {
   *        // handle the errro
   *      });
   *      // later, whoever generated the waitable will call .set() and
   *      // invoke the callback
   *
   * @param {Function} callback A callback function that will be invoked
   * when this.value is set. The value property will be passed to the
   * callback function as a parameter
   * @param {Function} errorHandler [optional] A callback function that
   * will be invoked if there is an error in getting the value. The errorHandler
   * takes an optional Error object.
   */
  wait: function(callback, errorHandler) {
    // register error handler first incase the monitor call causes an exception
    if (errorHandler) {
      this.subscribe('error', errorHandler);
    }

    this.monitor('value', this.bind(function() {
      if (this.value !== undefined) {
        callback(this.value);
        return true;
      }
    }));
  }
});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.data.query
 * @layer data
 * @requires fb.waitable
 */

/**
 * Object that represents the results of an asynchronous FQL query, typically
 * constructed by a call [FB.Data.query](FB.Data.query)().
 *
 * These objects can be used in one of two ways:
 *
 * * Call [wait](FB.Waitable.wait)() to handle the value when it's ready:
 *
 *         var query = FB.Data.query(
 *           'select name from page where username = 'barackobama');
 *         query.wait(function(result) {
 *           document.getElementById('page').innerHTML = result[0].name
 *         });
 *
 * * Pass it as an argument to a function that takes a Waitable. For example,
 *   in this case you can construct the second query without waiting for the
 *   results from the first, and it will combine them into one request:
 *
 *         var query = FB.Data.query(
 *           'select username from page where page_id = 6815841748');
 *         var dependentQuery = FB.Data.query(
 *           'select name from page where username in ' +
 *           '(select username from {0})', query);
 *
 *         // now wait for the results from the dependent query
 *         dependentQuery.wait(function(data) {
 *           document.getElementById('page').innerHTML = result[0].name
 *         });
 *
 * * Wait for multiple waitables at once with [FB.Data.waitOn](FB.Data.waitOn).
 *
 * Check out the [tests][tests] for more usage examples.
 * [tests]: http://github.com/facebook/connect-js/blob/master/tests/js/data.js
 *
 * @class FB.Data.Query
 * @access public
 * @extends FB.Waitable
 */
FB.subclass('Data.Query', 'Waitable',
  function() {
    if (!FB.Data.Query._c) {
      FB.Data.Query._c = 1;
    }
    this.name = 'v_' + FB.Data.Query._c++;
  },
  {
  /**
   * Use the array of arguments using the FB.String.format syntax to build a
   * query, parse it and populate this Query instance.
   *
   * @params args
   */
  parse: function(args) {
    var
      fql = FB.String.format.apply(null, args),
      re = (/^select (.*?) from (\w+)\s+where (.*)$/i).exec(fql); // Parse it
    this.fields = this._toFields(re[1]);
    this.table = re[2];
    this.where = this._parseWhere(re[3]);

    for (var i=1; i < args.length; i++) {
      if (FB.Type.isType(args[i], FB.Data.Query)) {
        // Indicate this query can not be merged because
        // others depend on it.
        args[i].hasDependency = true;
      }
    }

    return this;
  },

  /**
   * Renders the query in FQL format.
   *
   * @return {String} FQL statement for this query
   */
  toFql: function() {
    var s = 'select ' + this.fields.join(',') + ' from ' +
            this.table + ' where ';
    switch (this.where.type) {
      case 'unknown':
        s += this.where.value;
        break;
      case 'index':
        s += this.where.key + '=' + this._encode(this.where.value);
        break;
      case 'in':
        if (this.where.value.length == 1) {
          s += this.where.key + '=' +  this._encode(this.where.value[0]);
        } else {
          s += this.where.key + ' in (' +
            FB.Array.map(this.where.value, this._encode).join(',') + ')';
        }
        break;
    }
    return s;
  },

  /**
   * Encode a given value for use in a query string.
   *
   * @param value {Object} the value to encode
   * @returns {String} the encoded value
   */
  _encode: function(value) {
    return typeof(value) == 'string' ? FB.String.quote(value) : value;
  },

  /**
   * Return the name for this query.
   *
   * TODO should this be renamed?
   *
   * @returns {String} the name
   */
  toString: function() {
    return '#' + this.name;
  },

  /**
   * Return an Array of field names extracted from a given string. The string
   * here is a comma separated list of fields from a FQL query.
   *
   * Example:
   *     query._toFields('abc, def,  ghi ,klm')
   * Returns:
   *     ['abc', 'def', 'ghi', 'klm']
   *
   * @param s {String} the field selection string
   * @returns {Array} the fields
   */
  _toFields: function(s) {
    return FB.Array.map(s.split(','), FB.String.trim);
  },

  /**
   * Parse the where clause from a FQL query.
   *
   * @param s {String} the where clause
   * @returns {Object} parsed where clause
   */
  _parseWhere: function(s) {
    // First check if the where is of pattern
    // key = XYZ
    var
      re = (/^\s*(\w+)\s*=\s*(.*)\s*$/i).exec(s),
      result,
      value,
      type = 'unknown';
    if (re) {
      // Now check if XYZ is either an number or string.
      value = re[2];
      // The RegEx expression for checking quoted string
      // is from http://blog.stevenlevithan.com/archives/match-quoted-string
      if (/^(["'])(?:\\?.)*?\1$/.test(value)) {
        // Use eval to unquote the string
        // convert
        value = eval(value);
        type = 'index';
      } else if (/^\d+\.?\d*$/.test(value)) {
        type = 'index';
      }
    }

    if (type == 'index') {
      // a simple <key>=<value> clause
      result = { type: 'index', key: re[1], value: value };
    } else {
      // Not a simple <key>=<value> clause
      result = { type: 'unknown', value: s };
    }
    return result;
  }
});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.data
 * @layer data
 * @requires fb.prelude
 *           fb.type
 *           fb.api
 *           fb.array
 *           fb.string
 *           fb.obj
 *           fb.data.query
 *           fb.json
 */


/**
 * Data access class for accessing Facebook data efficiently.
 *
 * FB.Data is a data layer that offers the following advantages over
 * direct use of FB.Api:
 *
 * 1. Reduce number of individual HTTP requests through the following
 *    optimizations:
 *
 *   a. Automatically combine individual data requests into a single
 *      multi-query request.
 *
 *   b. Automatic query optimization.
 *
 *   c. Enable caching of data through browser local cache (not implemented yet)
 *
 * 2. Reduce complexity of asynchronous API programming, especially multiple
 *     asynchronous request, though FB.Waitable and FB.waitOn.
 *
 * @class FB.Data
 * @access public
 * @static
 */
FB.provide('Data', {
  /**
   * Performs a parameterized FQL query and returns a [FB.Data.query](FB.Data.query)
   * object which can be waited on for the asynchronously fetched data.
   *
   * Examples
   * --------
   *
   * Make a simple FQL call and handle the results.
   *
   *      var query = FB.Data.query('select name, uid from user where uid={0}',
   *                                user_id);
   *      query.wait(function(rows) {
   *        document.getElementById('name').innerHTML =
   *          'Your name is ' + rows[0].name;
   *      });
   *
   * Display the names and events of 10 random friends. This can't be done
   * using a simple FQL query because you need more than one field from more
   * than one table, so we use FB.Data.query to help construct the call to
   * [[api:fql.multiquery]].
   *
   *      // First, get ten of the logged-in user's friends and the events they
   *      // are attending. In this query, the argument is just an int value
   *      // (the logged-in user id). Note, we are not firing the query yet.
   *      var query = FB.Data.query(
   *            "select uid, eid from event_member "
   *          + "where uid in "
   *          + "(select uid2 from friend where uid1 = {0}"
   *          + " order by rand() limit 10)",
   *          user_id);
   *
   *      // Now, construct two dependent queries - one each to get the
   *      // names of the friends and the events referenced
   *      var friends = FB.Data.query(
   *            "select uid, name from user where uid in "
   *          + "(select uid from {0})", query);
   *      var events = FB.Data.query(
   *            "select eid, name from event where eid in "
   *          + " (select eid from {0})", query);
   *
   *      // Now, register a callback which will execute once all three
   *      // queries return with data
   *      FB.Data.waitOn([query, friends, events], function() {
   *        // build a map of eid, uid to name
   *        var eventNames = friendNames = {};
   *        FB.Array.forEach(events.value, function(row) {
   *          eventNames[row.eid] = row.name;
   *        });
   *        FB.Array.forEach(friends.value, function(row) {
   *          friendNames[row.uid] = row.name;
   *        });
   *
   *        // now display all the results
   *        var html = '';
   *        FB.Array.forEach(query.value, function(row) {
   *          html += '<p>'
   *            + friendNames[row.uid]
   *            + ' is attending '
   *            + eventNames[row.eid]
   *            + '</p>';
   *        });
   *        document.getElementById('display').innerHTML = html;
   *      });
   *
   * @param {String} template FQL query string template. It can contains
   * optional formatted parameters in the format of '{<argument-index>}'.
   * @param {Object} data optional 0-n arguments of data. The arguments can be
   * either real data (String or Integer) or an [FB.Data.query](FB.Data.query)
   * object from a previos [FB.Data.query](FB.Data.query).
   * @return {FB.Data.Query}
   * An async query object that contains query result.
   */
  query: function(template, data) {
    var query = new FB.Data.Query().parse(arguments);
    FB.Data.queue.push(query);
    FB.Data._waitToProcess();
    return query;
  },

  /**
   * Wait until the results of all queries are ready. See also
   * [FB.Data.query](FB.Data.query) for more examples of usage.
   *
   * Examples
   * --------
   *
   * Wait for several queries to be ready, then perform some action:
   *
   *      var queryTemplate = 'select name from profile where id={0}';
   *      var u1 = FB.Data.query(queryTemplate, 4);
   *      var u2 = FB.Data.query(queryTemplate, 1160);
   *      FB.Data.waitOn([u1, u2], function(args) {
   *        log('u1 value = '+ args[0].value);
   *        log('u2 value = '+ args[1].value);
   *      });
   *
   * Same as above, except we take advantage of JavaScript closures to
   * avoid using args[0], args[1], etc:
   *
   *      var queryTemplate = 'select name from profile where id={0}';
   *      var u1 = FB.Data.query(queryTemplate, 4);
   *      var u2 = FB.Data.query(queryTemplate, 1160);
   *      FB.Data.waitOn([u1, u2], function(args) {
   *        log('u1 value = '+ u1.value);
   *        log('u2 value = '+ u2.value);
   *      });
   *
   * Create a new Waitable that computes its value based on other Waitables:
   *
   *      var friends = FB.Data.query('select uid2 from friend ' +
   *        'where uid1=me()');
   *      // ...
   *      // Create a Waitable that is the count of friends
   *      var count = FB.Data.waitOn([friends], 'args[0].length');
   *      displayFriendsCount(count);
   *      // ...
   *      function displayFriendsCount(count) {
   *        count.wait(function(result) {
   *          log('friends count = ' + result);
   *        });
   *      }
   *
   * You can mix Waitables and data in the list of dependencies
   * as well.
   *
   *      var queryTemplate = 'select name from profile where id={0}';
   *      var u1 = FB.Data.query(queryTemplate, 4);
   *      var u2 = FB.Data.query(queryTemplate, 1160);
   *
   *      FB.Data.waitOn([u1, u2, FB.getUserID()], function(args) {
   *          log('u1 = '+ args[0]);
   *          log('u2 = '+ args[1]);
   *          log('uid = '+ args[2]);
   *       });
   *
   * @param dependencies {Array} an array of dependencies to wait on. Each item
   * could be a Waitable object or actual value.
   * @param callback {Function} A function callback that will be invoked
   * when all the data are ready. An array of ready data will be
   * passed to the callback. If a string is passed, it will
   * be evaluted as a JavaScript string.
   * @return {FB.Waitable} A Waitable object that will be set with the return
   * value of callback function.
   */
  waitOn: function(dependencies, callback) {
    var
      result = new FB.Waitable(),
      count = dependencies.length;

    // For developer convenience, we allow the callback
    // to be a string of javascript expression
    if (typeof(callback) == 'string') {
      var s = callback;
      callback = function(args) {
        return eval(s);
      };
    }

    FB.Array.forEach(dependencies, function(item) {
      item.monitor('value', function() {
        var done = false;
        if (FB.Data._getValue(item) !== undefined) {
          count--;
          done = true;
        }
        if (count === 0) {
          var value = callback(FB.Array.map(dependencies, FB.Data._getValue));
          result.set(value !== undefined ? value : true);
        }
        return done;
      });
    });
    return result;
  },

  /**
   * Helper method to get value from Waitable or return self.
   *
   * @param item {FB.Waitable|Object} potential Waitable object
   * @returns {Object} the value
   */
  _getValue: function(item) {
    return FB.Type.isType(item, FB.Waitable) ? item.value : item;
  },

  /**
   * Alternate method from query, this method is more specific but more
   * efficient. We use it internally.
   *
   * @access private
   * @param fields {Array} the array of fields to select
   * @param table {String} the table name
   * @param name {String} the key name
   * @param value {Object} the key value
   * @returns {FB.Data.Query} the query object
   */
  _selectByIndex: function(fields, table, name, value) {
    var query = new FB.Data.Query();
    query.fields = fields;
    query.table = table;
    query.where = { type: 'index', key: name, value: value };
    FB.Data.queue.push(query);
    FB.Data._waitToProcess();
    return query;
  },

  /**
   * Set up a short timer to ensure that we process all requests at once. If
   * the timer is already set then ignore.
   */
  _waitToProcess: function() {
    if (FB.Data.timer < 0) {
      FB.Data.timer = setTimeout(FB.Data._process, 10);
    }
  },

  /**
   * Process the current queue.
   */
  _process: function() {
    FB.Data.timer = -1;

    var
      mqueries = {},
      q = FB.Data.queue;
    FB.Data.queue = [];

    for (var i=0; i < q.length; i++) {
      var item = q[i];
      if (item.where.type == 'index' && !item.hasDependency) {
        FB.Data._mergeIndexQuery(item, mqueries);
      } else {
        mqueries[item.name] = item;
      }
    }

    // Now make a single multi-query API call
    var params = { q : {} };
    FB.copy(params.q, mqueries, true, function(query) {
      return query.toFql();
    });

    params.queries = FB.JSON.stringify(params.queries);

    FB.api('/fql', 'GET', params,
      function(result) {
        if (result.error) {
          FB.Array.forEach(mqueries, function(q1) {
            q1.error(new Error(result.error.message));
          });
        } else {
          FB.Array.forEach(result.data, function(o) {
            mqueries[o.name].set(o.fql_result_set);
          });
        }
      }
    );
  },

  /**
   * Check if y can be merged into x
   * @private
   */
  _mergeIndexQuery: function(item, mqueries) {
    var key = item.where.key,
    value = item.where.value;

    var name = 'index_' +  item.table + '_' + key;
    var master = mqueries[name];
    if (!master) {
      master = mqueries[name] = new FB.Data.Query();
      master.fields = [key];
      master.table = item.table;
      master.where = {type: 'in', key: key, value: []};
    }

    // Merge fields
    FB.Array.merge(master.fields, item.fields);
    FB.Array.merge(master.where.value, [value]);

    // Link data from master to item
    master.wait(function(r) {
      item.set(FB.Array.filter(r, function(x) {
        return x[key] == value;
      }));
    });
  },

  timer: -1,
  queue: []
});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 *
 * @provides fb.init.helper
 * @requires fb.init
 *           fb.qs
 *           fb.array
 */

// we do it in a setTimeout to wait until the current event loop as finished.
// this allows potential library code being included below this block (possible
// when being served from an automatically combined version)
window.setTimeout(function() {
  // this is useful to enable fragment based initialization to reduce the
  // amount of code needed to perform the common initialization logic
  var pattern = /(connect.facebook.net|facebook.com\/assets.php).*?#(.*)/;
  FB.Array.forEach(document.getElementsByTagName('script'), function(script) {
    if (script.src) {
      var match = pattern.exec(script.src);
      if (match) {
        var opts = FB.QS.decode(match[2]);
        FB.Array.forEach(opts, function(val, key) {
          if (val == '0') {
            opts[key] = 0;
          }
        });

        opts.oauth = true;
        FB.init(opts);
      }
    }
  });

  // this is useful when the library is being loaded asynchronously
  if (window.fbAsyncInit && !window.fbAsyncInit.hasRun) {
    window.fbAsyncInit.hasRun = true;
    fbAsyncInit();
  }
}, 0);

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.nativecalls
 * @requires fb.prelude
 *           fb.ua
 */

/**
 * Provides a way to make native calls to a container Facebook iPhone or
 * Android application from Javascript. Used by Mobile Canvas apps. Functions
 * provided are:
 *
 * FB.Native.open(url) - takes a HTTP or HTTPS URL to be opened in the
 * popup webview. Returns an object that implements a close() method closing
 * the popup webview.
 *
 * FB.Native.postMessage(message, target) - sends the provided 'message' to
 * the specified 'target' window, analagous to javascript's postMessage. Used
 * for communication between two webviews (i.e. the canvas webview and a popup
 * opened using FB.Native.open).
 *
 * FB.Native.setOrientation(orientation) (Deprecated - use the developer
 * setting for orientation instead). Takes a string parameter that is either
 * "portrait" or "landscape", and locks the screen in the specified orientation
 *
 * Since the native JS injection happens asynchronously, all native functions
 * should be called within the callback to FB.Native.onready.
 * Example:
 * FB.Native.onready(function () {
 *   var popupWindow = FB.Native.open("http://facebook.com");
 *   popupWindow.close();
 * });
 *
 */
FB.provide('Native', {
  NATIVE_READY_EVENT: 'fbNativeReady',

  /**
   * Takes a callback function as a parameter and executes it once the native
   * container has injected the javascript functions to make native calls.
   *
   * (This is necessary since native JS injection happens asynchronously)
   */
  onready: function(func) {
    // Check that we're within a native container
    if (!FB.UA.nativeApp()) {
      FB.log('FB.Native.onready only works when the page is rendered ' +
             'in a WebView of the native Facebook app. Test if this is the ' +
             'case calling FB.UA.nativeApp()');
      return;
    }

    // if the native container has injected JS but we haven't copied it
    // into the FB.Native namespace, do that now. This way, all caller
    // functions can use methods like FB.Native.open and not have to care
    // about window.__fbNative
    if (window.__fbNative && !this.nativeReady) {
      FB.provide('Native', window.__fbNative);
    }

    // This will evaluate to true once the native app injects the JS methods
    if (this.nativeReady) {
      func();
    } else {
      // If the native interfaces haven't been injected yet,
      // wait for an event to fire.
      var nativeReadyCallback = function(evt) {
        window.removeEventListener(FB.Native.NATIVE_READY_EVENT,
            nativeReadyCallback);
        FB.Native.onready(func);
      };
      window.addEventListener(FB.Native.NATIVE_READY_EVENT,
        nativeReadyCallback,
        false);
    }
  }
});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.pay
 * @requires fb.prelude
 *           fb.arbiter
 *           fb.json
 *           fb.ui
 *           fb.xd
 */

/**
 * Implementation of the payment flow UI initiation
 */
FB.provide('UIServer.Methods', {
  'pay.prompt': {
    transform : function(call) {
      var handler = FB.XD.handler(function(msg) {
        call.cb(FB.JSON.parse(msg.response));
      }, 'parent.frames[' + (window.name || 'iframe_canvas') + ']');

      call.params.channel = handler;

      FB.Arbiter.inform('Pay.Prompt', call.params);
      return false;
    }
  }
});

FB.provide('UIServer.Methods', {
  'pay': {
    size      : { width: 555, height: 120 },
    noHttps   : true,
    connectDisplay : 'popup',
    transform : function(call) {
      if (!FB._inCanvas) {
        // Hack to keep backward compatibility
        call.params.order_info = FB.JSON.stringify(call.params.order_info);
        return call;
      }
      var handler = FB.XD.handler(function(msg) {
        call.cb(FB.JSON.parse(msg.response));
      }, 'parent.frames[' + (window.name || 'iframe_canvas') + ']');

      call.params.channel = handler;
      call.params.uiserver = true;

      FB.Arbiter.inform('Pay.Prompt', call.params);
      return false;
    }
  }
});


/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.helper
 * @layer xfbml
 * @requires fb.prelude
 */

/**
 * Helper class for XFBML
 * @class FB.Helper
 * @static
 * @private
 */
FB.provide('Helper', {
  /**
   * Check if an id is an user id, instead of a page id
   *
   * [NOTE:] This code is based on fbid_in_uid_range function in our server code
   * If that function changes, we'd have to update this one as well.
   *
   * @param {uid} id
   * @returns {Boolean} true if the given id is a user id
   */
  isUser: function(id) {
    return id < 2200000000 ||
      (id >= 100000000000000 &&  // 100T is first 64-bit UID
       id <= 100099999989999) || // 100T + 3,333,333*30,000 - 1)
      (id >= 89000000000000 &&   // DBTYPE_TEST2: see flib/core/fbid/hash.php
       id <= 89999999999999);
  },

  /**
   * Return the current user's UID if available.
   *
   * @returns {String|Number} returns the current user's UID or null
   */
  getLoggedInUser: function() {
    return FB.getUserID(); // pass the buck to the auth response
  },

  /**
   * Uppercase the first character of the String.
   *
   * @param s {String} the string
   * @return {String} the string with an uppercase first character
   */
  upperCaseFirstChar: function(s) {
    if (s.length > 0) {
      return s.substr(0, 1).toUpperCase() + s.substr(1);
    }
    else {
      return s;
    }
  },

  /**
   * Link to the explicit href or profile.php.
   *
   * @param userInfo {FB.UserInfo} User info object.
   * @param html {String} Markup for the anchor tag.
   * @param href {String} Custom href.
   * @returns {String} the anchor tag markup
   */
  getProfileLink: function(userInfo, html, href) {
    href = href || (userInfo ? FB.getDomain('www') + 'profile.php?id=' +
                    userInfo.uid : null);
    if (href) {
      html = '<a class="fb_link" href="' + href + '">' + html + '</a>';
    }
    return html;
  },

  /**
   * Convenienve function to fire an event handler attribute value. This is a
   * no-op for falsy values, eval for strings and invoke for functions.
   *
   * @param handler {Object}
   * @param scope {Object}
   * @param args {Array}
   */
  invokeHandler: function(handler, scope, args) {
    if (handler) {
      if (typeof handler === 'string') {
        eval(handler);
      } else if (handler.apply) {
        handler.apply(scope, args || []);
      }
    }
  },

  /**
   * Convenience function that fires the given event using both
   * FB.Helper.fire and the prototype fire method. Passes the
   * event raiser's href attriubute as an argument.
   *
   * @param evenName {String}
   * @param eventRaiser {Object}
   */
  fireEvent: function(eventName, eventSource) {
    var href = eventSource._attr.href;
    eventSource.fire(eventName, href); // dynamically attached
    FB.Event.fire(eventName, href, eventSource); // global
  },

  /**
   * Converts a string to a function without using eval()
   *
   * From http://stackoverflow.com/questions/359788
   */
  executeFunctionByName: function(functionName /*, args */) {
    var args = Array.prototype.slice.call(arguments, 1);
    var namespaces = functionName.split(".");
    var func = namespaces.pop();
    var context = window;
    for (var i = 0; i < namespaces.length; i++) {
      context = context[namespaces[i]];
    }
    return context[func].apply(this, args);
  }

});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 *
 * JavaScript library providing Facebook Connect integration.
 *
 * @provides fb.template_data
 * @requires fb.api
 *           fb.json
 *           fb.helper
 */

/**
 * For preview templates, we need some per-app, per-user data that we fetch
 * asynchronosly and cache in local browser storage for as long as possible.
 * The events that might cause a local storage update are logging in or out
 * and a periodical timeout.
 *
 * @class FB.TemplateData
 * @static
 * @access private
 */
FB.provide('TemplateData', {
  _initialized: false,
  _version: 0,
  _response: null,
  _localStorageTimeout: 60 * 60 * 24,
  // Set in ConnectStaticResponse as a temporary emergency
  // tool until we're sure most Akamai-related issues are
  // known to us.
  _enabled: true,

  enabled: function() {
    return FB.TemplateData._enabled &&
      FB.TemplateData._initialized &&
      FB.TemplateData.supportsLocalStorage() &&
      FB._userStatus == 'connected' &&
      FB.TemplateData.getResponse();
  },

  supportsLocalStorage: function() {
    try {
      return 'localStorage' in window && window.localStorage !== null;
    } catch (e) {
      // Bug in old Firefox versions for disabled cookies
      return false;
    }
  },

  /**
   * True if all of these are met:
   *   - there's a response in localStorage
   *   - it was set soon enough
   *   - the version is up to date
   */
  _isStale: function(response) {
    if (!response || !response.version ||
        response.version != FB.TemplateData._version ||
        response.currentUserID != FB.getUserID()) {
      return true;
    }
    var currentTime = Math.round((new Date()).getTime());
    return (currentTime - response.setAt) / 1000.0 >
           FB.TemplateData._localStorageTimeout;
  },

  getResponse: function() {
    var self = FB.TemplateData;
    try {
      self._response = self._response ||
        (self.supportsLocalStorage() &&
         FB.JSON.parse(localStorage.FB_templateDataResponse || "null"));
    } catch (e) {
      // Catch possible bad data in localStorage
      self._response = null;
    }
    if (self._isStale(self._response)) {
      self.saveResponse(null);
    }
    return self._response;
  },

  saveResponse: function(response) {
    FB.TemplateData._response = response;
    if (FB.TemplateData.supportsLocalStorage()) {
      localStorage.FB_templateDataResponse = FB.JSON.stringify(response);
    }
  },

  /**
   * Returns the data in FB_templateDataResponse or {}
   * if one hasn't been loaded yet.
   */
  getData: function() {
    var response = FB.TemplateData.getResponse();
    return response ? response.data : {};
  },

  init: function(version) {
    if (!version) {
      return;
    }
    FB.TemplateData._initialized = true;
    FB.TemplateData._version = version;
    if (FB.TemplateData.supportsLocalStorage() &&
        !('FB_templateDataResponse' in localStorage)) {
      FB.TemplateData.clear();
    }
  },

  clear: function() {
    FB.TemplateData.saveResponse(null);
  },

  /**
   * Called on auth.statusChange.
   * Updates the state of this module as appropriate.
   * Assumes init() has been called.
   */
  update: function(loginStatusResponse) {
    if (FB._userStatus != 'connected') {
      FB.TemplateData.clear();
    }
    if (FB._userStatus == 'connected' &&
        !FB.TemplateData.getResponse()) {
      FB.api({ method: 'dialog.template_data'}, function(response) {
        if ('error_code' in response) {
          // Something went wrong
          return;
        }
        var data = {
          data: response,
          currentUserID: FB.getUserID(),
          setAt: (new Date()).getTime(),
          version: FB.TemplateData._version};
        FB.TemplateData.saveResponse(data);
      });
    }
  }
});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 *
 * @provides fb.template_ui
 * @requires fb.type
 *           fb.obj
 *           fb.template_data
 *           fb.ua
 *           fb.ui
 */

/**
 * Provide Support for Template UI dialog
 *
 * @class FB.TemplateUI
 * @access private
 */
FB.subclass('TemplateUI', 'Obj',
// Constructor
function(method, isPreload) {
  this.method = method;
  var in_iframe = FB.UA.nativeApp() ? 0 : 1;
  var query_params =
   {display: 'touch',
    preview_template: 1,
    in_iframe: in_iframe,
    locale: FB._locale,
    v: FB.TemplateUI._version,
    user_agent: navigator.userAgent
   };

  if (window.devicePixelRatio) {
    query_params.m_pixel_ratio = window.devicePixelRatio;
  }

  var query_string = FB.QS.encode(query_params);

  // Create a dialog that points to akamai cached template
  // ui dialog, then hide the dialog, so that it may be used
  // later.
  this.cachedCall = {
    url: FB.getDomain('staticfb') + 'dialog/' + method + '?' + query_string,
    frameName: FB.guid(),
    id: FB.guid(),
    size: FB.UIServer.getDefaultSize(),
    hideLoader: true
  };

  // A Mobile Safari bug prevents pages from caching even if only fragment in
  // a url changes, so we use cross-domain communication to pass data
  // parameters. This also means the parameter size won't be limited browser's
  // maximum url length.
  FB.XD.handler(this.bind(function(data) {
    if (data.type == 'getParams') {
      // store returnCb for later when the cached dialog is
      // used.
      this.setProperty('getParamsCb', data.returnCb);
    }
  }), 'parent', true, this.cachedCall.frameName);

  // Create an iframe first, then hide the dialog. This allows us to effectively
  // hide the time it takes for a browser to parse and render a page.
  // On iPhone 3GS, that can be 500ms.
  // Note currently we cannot pre-load for popup and native dialogs because
  // we can't create them in hidden mode.
  if (in_iframe) {
    FB.UIServer.iframe(this.cachedCall);
    FB.Dialog.hide(this.cachedCall.root);
  } else if (isPreload && !FB.TemplateUI._preloads[this.cachedCall.url]) {
    // For now, we don't have a good way to preload template dialog inside
    // native app because we don't create a hidden dialog and show it
    // later.
    // However, if we create a hidden iframe to the same url, we'd at least
    // be able to pre-fetch resources from Akamai in case of cold cache since
    // template dialog is completedly static and cacheable.
    var container = document.createElement('div');
    FB.TemplateUI._preloads[this.cachedCall.url] = {container: container};
    FB.Content.insertIframe({
      url: this.cachedCall.url,
      root: FB.Content.appendHidden(container)
    });
  }
},
// Instance Methods
{
  /**
   * Use the template UI
   * @access private
   * @param call {Object} call parameters
   */
  use: function(call) {
    if (!this.cachedCall.root) {
      FB.UIServer.touch(this.cachedCall);
      // Check if there is an iframe that was used to preload
      // the same url. If so, remove it because we don't need it
      // anymore
      var preload = FB.TemplateUI._preloads[this.cachedCall.url];
      if (preload && preload.container) {
        preload.container.parentNode.removeChild(preload.container);
        delete preload.container;
      }
    }
    call.ui_created = true;
    // Set dialog root to that of the cached one.
    call.root = this.cachedCall.root;

    // Switch any place where cached call id is used.
    // Absolutely terrible. Needs refactoring.

    // FB.UIServer._loadedNodes will keep the new id, which
    // is not related to the DOM in any way.
    FB.UIServer.setLoadedNode(call,
      FB.UIServer.getLoadedNode(this.cachedCall.id));
    delete FB.UIServer._loadedNodes[this.cachedCall.id];

    // FB.Dialog._dialogs and FB.Dialog._loadedNodes[frame].fbCallID
    // will keep the real iframe's id
    // because that's used to later resize the iframes.
    var dialog = FB.Dialog._dialogs[call.id];
    FB.Dialog._dialogs[this.cachedCall.id] = dialog;
    dialog.id = this.cachedCall.id;
    delete FB.Dialog._dialogs[call.id];
    FB.UIServer.getLoadedNode(call).fbCallID = this.cachedCall.id;

    this.cachedCall.id = call.id;

    var template_params = {};
    FB.copy(template_params, call.params);
    FB.copy(template_params, FB.TemplateData.getData()[this.method]);
    template_params.frictionless =
      FB.TemplateUI.isFrictionlessAppRequest(this.method, template_params);
    template_params.common = FB.TemplateData.getData().common;
    template_params.method = this.method;
    this.setParams(template_params);
    // Note that the same check in FB.UIServer.touch covers the regular version
    // of the dialog, and this one covers the template version. This is because
    // the default cb is not associated with the template dialog until
    // FB.TemplateUI.use() is called.
    if (FB.UA.nativeApp()) {
      FB.UIServer._popupMonitor();
    }
  },

  /**
   * Use postMessage to pass data parameter to template iframe
   * @access private
   * @param params {Object} data parametes
   */
  setParams: function(params) {
    // We need to wait until the iframe send callback cb
    // for getParams
    this.monitor('getParamsCb', this.bind(function() {
      if (this.getParamsCb) {
        var dialogWindow = frames[this.cachedCall.frameName] ||
          FB.UIServer.getLoadedNode(this.cachedCall);
        dialogWindow.postMessage(FB.JSON.stringify(
          {params: params,
           cb:     this.getParamsCb
          }), '*');
        return true;
      }
    }));
  }
});

// Static methods
FB.provide('TemplateUI', {
  _timer: null,
  _cache: {},
  _preloads: {},
  // Overridden by the PLATFORM_DIALOG_TEMPLATE_VERSION sitevar.
  // A value of 0 disables templates.
  _version: 0,

  /**
   * Initialization function.
   */
  init: function() {
    FB.TemplateData.init(FB.TemplateUI._version);
    FB.TemplateUI.initCache();
  },

  /**
   * Use cached UI for dialog
   * @param method {string} method name
   * @param call   {call}   call parameters
   */
  useCachedUI: function(method, call) {
    try {
      // Ensure the relevant iframe is rendered. Usually a no-op.
      FB.TemplateUI.populateCache();

      cache = FB.TemplateUI._cache[method];

      // Ensure we don't try to reuse the same iframe later
      delete FB.TemplateUI._cache[method];

      cache.use(call);
    } catch (e) {
      // To prevent an eternally broken state
      // caused by completely unexpected data-related errors.
      FB.TemplateData.clear();
    }
  },

  /**
   * Will prerender any iframes not already in
   * FB.TemplateUI._cache. Called at init time and after
   * a cached iframe is closed.
   */
  populateCache: function(isPreload) {
    if (!FB.TemplateData.enabled() || !FB.UA.mobile()) {
      return;
    }
    clearInterval(FB.TemplateUI._timer);
    var methods = {feed: true, apprequests: true};
    for (var method in methods) {
      if (!(method in FB.TemplateUI._cache)) {
        FB.TemplateUI._cache[method] = new FB.TemplateUI(method, isPreload);
      }
    }
  },

  /**
   * We use a timer to check and initialize cached UI for two
   * reasons:
   * 1. Try to delay the loading of the cached UI to minimize impact
   * on application
   * 2. If the template data is not ready, we need to wait for it.
   */
  initCache: function() {
    FB.TemplateUI._timer = setInterval(function() {
      FB.TemplateUI.populateCache(true);
    }, 2000);
  },

  /**
   * Only the feed and apprequests dialogs run template versions
   * when possible, though some of their features can't be or aren't
   * implemented with templates yet.
   */
  supportsTemplate: function(method, call) {
    return FB.TemplateData.enabled() &&
      FB.TemplateUI.paramsAllowTemplate(method, call.params) &&
      call.params.display === 'touch' &&
      FB.UA.mobile();
  },

  /**
   * Feed templates don't support these:
   * - dialogs posting to a friend's wall
   * - deprecated attachment params
   * - source, which means video
   * App Request templates don't support these:
   * - pre-specified friend
   * - suggestions
   * @param method     {String} method name
   * @param app_params {Object} the FB.ui parameters
   * @return           {Boolean} whether the call can use a template dialog
   */
  paramsAllowTemplate: function(method, app_params) {
    var bad_params =
      {feed:        {to: 1, attachment: 1, source: 1},
       apprequests: {}};
    if (!(method in bad_params)) {
      return false;
    }
    for (var param in bad_params[method]) {
      if (app_params[param]) {
        return false;
      }
    }
    return !FB.TemplateUI.willWriteOnGet(method, app_params);
  },

  isFrictionlessAppRequest: function(method, app_params) {
    return method === 'apprequests' && FB.Frictionless &&
      FB.Frictionless._useFrictionless;
  },

  /**
   * Frictionless requests kick off the full-param version
   * of the dialog if enabled for the specified recipient
   * because they send out the notification on the first
   * server request.
   * @param method     {String} method name
   * @param app_params {Object} the FB.ui parameters
   * @return           {Boolean} true if a regular call would
   *                             write to the DB on the first request
   */
  willWriteOnGet: function(method, app_params) {
    return FB.TemplateUI.isFrictionlessAppRequest(method, app_params) &&
      app_params.to &&
      FB.Frictionless.isAllowed(app_params.to);
  }

});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 * @provides fb.uri
 * @requires fb.ua
 */

/**
 * URI Handling
 */
FB.provide('URI', {

  /**
   * Resolve a relative URL to an absolute URL.  An absolute URL will resolve to
   * itself.  The empty string resolves to the current window location.
   */
  resolve: function(uri) {
    if (!uri) { // IE handles this case poorly, so we will be explicit about it
      return window.location.href;
    }

    var div = document.createElement('div');
    // This uses `innerHTML` because anything else doesn't resolve properly or
    // causes an HTTP request in IE6/7.
    div.innerHTML = '<a href="' + uri.replace(/"/g, '&quot;') + '"></a>';
    return div.firstChild.href; // This will be an absolute URL.  MAGIC!
  }

});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.xfbml.element
 * @layer xfbml
 * @requires fb.type fb.event fb.array
 */

/**
 * Base class for all XFBML elements. To create your own XFBML element, make a
 * class that derives from this, and then call [FB.XFBML.registerTag](FB.XFBML.registerTag).
 *
 * @access private
 * @class FB.XFBML.Element
 */
FB.Class('XFBML.Element',
  /**
   * Create a new Element.
   *
   * @access private
   * @constructor
   * @param dom {DOMElement} the DOMElement for the tag
   */
  function(dom) {
    this.dom = dom;
  },

  FB.copy({
  /**
   * Get the value of an attribute associated with this tag.
   *
   * Note, the transform function is never executed over the default value. It
   * is only used to transform user set attribute values.
   *
   * @access private
   * @param name {String} Name of the attribute.
   * @param defaultValue {Object} Default value if attribute isn't set.
   * @param transform {Function} Optional function to transform found value.
   * @return {Object} final value
   */
  getAttribute: function(name, defaultValue, transform) {
    var value = FB.XFBML.getAttr(this.dom, name);
    return value ? (transform ? transform(value) : value) : defaultValue;
  },

  /**
   * Helper function to extract boolean attribute value.
   *
   * @access private
   * @param name {String} Name of the attribute.
   * @param defaultValue {Object} Default value if attribute isn't set.
   */
  _getBoolAttribute: function(name, defaultValue) {
    if (FB.XFBML.getAttr(this.dom, name) === null) {
      return defaultValue;
    }
    return FB.XFBML.getBoolAttr(this.dom, name);
  },

  /**
   * Get an integer value for size in pixels.
   *
   * @access private
   * @param name {String} Name of the attribute.
   * @param defaultValue {Object} Default value if attribute isn't set.
   */
  _getPxAttribute: function(name, defaultValue) {
    return this.getAttribute(name, defaultValue, function(s) {
      var size = parseInt(s.replace('px', ''), 10);
      if (isNaN(size)) {
        return defaultValue;
      } else {
        return size;
      }
    });
  },

  /**
   * Get a value if it is in the allowed list, otherwise return the default
   * value. This function ignores case and expects you to use only lower case
   * allowed values.
   *
   * @access private
   * @param name {String} Name of the attribute.
   * @param defaultValue {Object} Default value
   * @param allowed {Array} List of allowed values.
   */
  _getAttributeFromList: function(name, defaultValue, allowed) {
    return this.getAttribute(name, defaultValue, function(s) {
      s = s.toLowerCase();
      if (FB.Array.indexOf(allowed, s) > -1) {
        return s;
      } else {
        return defaultValue;
      }
    });
  },

  /**
   * Check if this node is still valid and in the document.
   *
   * @access private
   * @returns {Boolean} true if element is valid
   */
  isValid: function() {
    for (var dom = this.dom; dom; dom = dom.parentNode) {
      if (dom == document.body) {
        return true;
      }
    }
  },

  /**
   * Clear this element and remove all contained elements.
   *
   * @access private
   */
  clear: function() {
    this.dom.innerHTML = '';
  }
}, FB.EventProvider));

/**
 * @provides fb.xfbml.iframewidget
 * @requires fb.arbiter
 *           fb.content
 *           fb.event
 *           fb.qs
 *           fb.type
 *           fb.xfbml.element
 * @css fb.css.iframewidget
 * @layer xfbml
 */

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Base implementation for iframe based XFBML Widgets.
 *
 * @class FB.XFBML.IframeWidget
 * @extends FB.XFBML.Element
 * @private
 */
FB.subclass('XFBML.IframeWidget', 'XFBML.Element', null, {
  /**
   * The name that should be used for the 'name' attribute of
   * the iframe.  Normally null, which means that it can be auto-generated
   * without any regard for convention, but it can be set by the
   * subclass if the name is important.
   */
  _iframeName: null,

  /**
   * Indicate if the loading animation should be shown while the iframe is
   * loading.
   */
  _showLoader: true,

  /**
   * Indicate if the widget should be reprocessed when the user enters or
   * leaves the "unknown" state. (Logs in/out of facebook, but not the
   * application.)
   */
  _refreshOnAuthChange: false,

  /**
   * Indicates if the widget should be reprocessed on auth.statusChange events.
   * This is the default for XFBML Elements, but is usually undesirable for
   * Iframe Widgets.
   */
  _allowReProcess: false,

  /**
   * Indicates if the widget should be loaded from a static response cached
   * version the CDN, only needed for high performance widgets that need to
   * minimize TTI.
   */
  _fetchPreCachedLoader: false,

  /**
   * Indicates when the widget will be made visible.
   *
   *   load: when the iframe's page onload event is fired
   *   resize: when the first resize message is received
   *   immediate: when there is any HTML.
   */
  _visibleAfter: 'load',

  /**
   * Indicates whether or not the widget should be rendered using
   * WidgetPipe.  The default is false, but this same field should
   * be set to true if the IframeWidget subclass has WidgetPipe support.
   */
  _widgetPipeEnabled: false,

  /////////////////////////////////////////////////////////////////////////////
  // Methods the implementation MUST override
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Implemented by the inheriting class to return a **name** and **params**.
   *
   * The name is the the file name in the plugins directory. So the name "fan"
   * translates to the path "/plugins/fan.php". This enforces consistency.
   *
   * The params should be the query params needed for the widget. API Key,
   * Session Key, SDK and Locale are automatically included.
   *
   * @return {Object} an object containing a **name** and **params**.
   */
  getUrlBits: function() {
    throw new Error('Inheriting class needs to implement getUrlBits().');
  },

  /////////////////////////////////////////////////////////////////////////////
  // Methods the implementation CAN override
  /////////////////////////////////////////////////////////////////////////////

  /**
   * This method is invoked before any processing is done to do any initial
   * setup and do any necessary validation on the attributes. A return value of
   * false will indicate that validation was unsuccessful and processing will
   * be halted. If you are going to return false and halt processing, you
   * should ensure you use FB.log() to output a short informative message
   * before doing so.
   *
   * @return {Boolean} true to continue processing, false to halt it
   */
  setupAndValidate: function() {
    return true;
  },

  /**
   * This is useful for setting up event handlers and such which should not be
   * run again if the widget is reprocessed.
   */
  oneTimeSetup: function() {},

  /**
   * Implemented by the inheriting class to return the initial size for the
   * iframe. If the inheriting class does not implement this, we default to
   * null which implies no element level style. This is useful if you are
   * defining the size based on the className.
   *
   * @return {Object} object with a width and height as Numbers (pixels assumed)
   */
  getSize: function() {},

  /**
   * Generates and returns a unique frame name for this particular
   * iframe if a name hasn't already been provided *and* the
   * widget/plugin is widget-pipe-enabled, so that one needs to
   * be generated.  If the name has already been generated, or
   * if it hasn't but we don't care to generate one because it
   * isn't widget-pipe enabled, then we just return what the
   * iframe name currently is.
   *
   * @return {String} the name given to the iframe.
   */
  getIframeName: function() {
    if (!this._iframeName &&
        this._widgetPipeEnabled &&
        FB.XFBML.shouldUseWidgetPipe()) {
      this._iframeName = this.generateWidgetPipeIframeName();
      FB.XFBML.IframeWidget.allWidgetPipeIframes[this._iframeName] = this;
      if (FB.XFBML.IframeWidget.masterWidgetPipeIframe === null) {
        FB.XFBML.IframeWidget.masterWidgetPipeIframe = this;
      }
    }

    return this._iframeName;
  },

  /**
   * Implemented by a subclass that wants to attach a title as an attribute
   * to the top-level iframe tag.
   */
  getIframeTitle: function() {},

  /////////////////////////////////////////////////////////////////////////////
  // Public methods the implementation CAN use
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Get a channel url for use with this widget.
   *
   * @return {String} the channel URL
   */
  getChannelUrl: function() {
    if (!this._channelUrl) {
      // parent.parent => the message will be going from cdn => fb => app (with
      // cdn being the deepest frame, and app being the top frame)
      var self = this;
      this._channelUrl = FB.XD.handler(function(message) {
        self.fire('xd.' + message.type, message);
      }, 'parent.parent', true);
    }
    return this._channelUrl;
  },

  /**
   * Returns the iframe node (if it has already been created).
   *
   * @return {DOMElement} the iframe DOM element
   */
  getIframeNode: function() {
    // not caching to allow for the node to change over time without needing
    // house-keeping for the cached reference.
    return this.dom.getElementsByTagName('iframe')[0];
  },

  /**
   * Call FB.Arbiter.inform with values appropriate to a social plugin embedded
   * in a 3rd party site.  The `this.loaded` variable is changed in an
   * `iframe.onload` callback, so it's state is not guaranteed to be correct in
   * the context of an `iframe.onload` event handler.  Therefore, this function
   * will not necessarily work if called from inside an `iframe.onload` event
   * handler.
   */
  arbiterInform: function(event, message, behavior) {
    if (this.loaded) {
      this._arbiterInform(event, message, behavior);
    } else {
      this.subscribe( // inform once iframe exists
        'iframe.onload',
        FB.bind(this._arbiterInform, this, event, message, behavior));
    }
  },

  /**
   * This is an internal helper to deal with synchronization to prevent race
   * conditions in arbiterInform.  Clients should use arbiterInform.
   */
  _arbiterInform: function(event, message, behavior) {
    var relation = 'parent.frames["' + this.getIframeNode().name + '"]';
    FB.Arbiter.inform(
      event, message, relation, window.location.protocol == 'https:', behavior);
  },

  /**
   * Returns the default domain that should be used for all
   * plugins served from our web tier.
   */
  getDefaultWebDomain: function() {
    return 'www';
  },

  /**
   * Returns the default domain that should be used for all
   * plugins served from our Akamai tier.
   */
  getDefaultStaticDomain: function() {
    return 'cdn';
  },

  /////////////////////////////////////////////////////////////////////////////
  // Private methods the implementation MUST NOT use or override
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Inheriting classes should not touch the DOM directly, and are only allowed
   * to override the methods defined at the top.
   *
   * @param force {Boolean} force reprocessing of the node
   */
  process: function(force) {
    // guard agains reprocessing if needed
    if (this._done) {
      if (!this._allowReProcess && !force) {
        return;
      }
      this.clear();
    } else {
      this._oneTimeSetup();
    }
    this._done = true;

    if (!this.setupAndValidate()) {
      // failure to validate means we're done rendering what we can
      this.fire('render');
      return;
    }

    // show the loader if needed
    if (this._showLoader) {
      this._addLoader();
    }

    // it's always hidden by default
    FB.Dom.addCss(this.dom, 'fb_iframe_widget');
    if (this._visibleAfter != 'immediate') {
      FB.Dom.addCss(this.dom, 'fb_hide_iframes');
    } else {
      this.subscribe('iframe.onload', FB.bind(this.fire, this, 'render'));
    }

    // the initial size
    var size = this.getSize() || {};
    var url = this.getFullyQualifiedURL();

    if (size.width == '100%') {
      FB.Dom.addCss(this.dom, 'fb_iframe_widget_fluid');
    }

    FB.Content.insertIframe({
      url       : url,
      root      : this.dom.appendChild(document.createElement('span')),
      name      : this.getIframeName(),
      title     : this.getIframeTitle(),
      className : FB._localeIsRtl ? 'fb_rtl' : 'fb_ltr',
      height    : size.height,
      width     : size.width,
      onload    : FB.bind(this.fire, this, 'iframe.onload')
    });

    this.loaded = false;
    this.subscribe(
      'iframe.onload', FB.bind(function() { this.loaded = true; }, this));
  },

  /**
   * The default way we generate iframe names.  This (protected)
   * method should be overridden by the subclass if it requires
   * a different iframe naming convention.
   *
   * @return {String} the name that should be given to the widget-pipe
   *         enabled iframe.
   */
  generateWidgetPipeIframeName: function() {
    FB.XFBML.IframeWidget.widgetPipeIframeCount++;
    return 'fb_iframe_' + FB.XFBML.IframeWidget.widgetPipeIframeCount;
  },

  /**
   * Computes the full URL that should be implanted iframe src.
   * In the case of short URLs, the traditional GET approach is used,
   * but for excessively large URLs we set the URL to be 'about:blank'
   * and use POST to get the content after the iframe loads (note the
   * subscription to and eventually unsubscription from the iframe.onload
   * event. Clever.)
   *
   * @return {String} the fully qualified, properly encoded URL
   */
  getFullyQualifiedURL: function() {
    if (FB.XFBML.shouldUseWidgetPipe() && this._widgetPipeEnabled) {
      return this._getWidgetPipeShell();
    }

    // we use a GET request if the URL is less than 2k, otherwise we need to do
    // a <form> POST. we prefer a GET because it prevents the "POST resend"
    // warning browsers shown on page refresh.
    var url = this._getURL();
    if (!this._fetchPreCachedLoader) {
      url += '?' + FB.QS.encode(this._getQS());
    }

    if (url.length > 2000) {
      // we will POST the form once the empty about:blank iframe is done loading
      url = 'about:blank';
      var onload = FB.bind(function() {
        this._postRequest();
        this.unsubscribe('iframe.onload', onload);
      }, this);
      this.subscribe('iframe.onload', onload);
    }

    return url;
  },

  /**
   * Identifies the static resource that should be loaded
   * if the widget is relying on a separate iframe to fetch
   * its content with that of other widget-pipe-enabled widgets.
   *
   * @return {String} the URL of the widget pipe shell that
   *         contains the inlined JavaScript invoked when the
   *         widget pipe iframe has pulled its content and signal
   *         this iframe that the content is ready.
   */

  _getWidgetPipeShell: function() {
    return FB.getDomain('www') + 'common/widget_pipe_shell.php';
  },

  /**
   * Internal one time setup logic.
   */
  _oneTimeSetup: function() {
    // the XD messages we want to handle. it is safe to subscribe to these even
    // if they will not get used.
    this.subscribe('xd.resize', FB.bind(this._handleResizeMsg, this));

    // weak dependency on FB.Auth
    if (FB.getLoginStatus) {
      this.subscribe(
        'xd.refreshLoginStatus',
        FB.bind(FB.getLoginStatus, FB, function(){}, true));
      this.subscribe(
        'xd.logout',
        FB.bind(FB.logout, FB, function(){}));
    }

    // setup forwarding of auth.statusChange events
    if (this._refreshOnAuthChange) {
      this._setupAuthRefresh();
    }

    // if we need to make it visible on iframe load
    if (this._visibleAfter == 'load') {
      this.subscribe('iframe.onload', FB.bind(this._makeVisible, this));
    }

    // hook for subclasses
    this.oneTimeSetup();
  },

  /**
   * Make the iframe visible and remove the loader.
   */
  _makeVisible: function() {
    this._removeLoader();
    FB.Dom.removeCss(this.dom, 'fb_hide_iframes');
    this.fire('render');
  },

  /**
   * Most iframe plugins do not tie their internal state to the "Connected"
   * state of the application. In other words, the fan box knows who you are
   * even if the page it contains does not. These plugins therefore only need
   * to reload when the user signs in/out of facebook, not the application.
   *
   * This misses the case where the user switched logins without the
   * application knowing about it. Unfortunately this is not possible/allowed.
   */
  _setupAuthRefresh: function() {
    FB.getLoginStatus(FB.bind(function(response) {
      var lastStatus = response.status;
      FB.Event.subscribe('auth.statusChange', FB.bind(function(response) {
        if (!this.isValid()) {
          return;
        }
        // if we gained or lost a user, reprocess
        if (lastStatus == 'unknown' || response.status == 'unknown') {
          this.process(true);
        }
        lastStatus = response.status;
      }, this));
    }, this));
  },

  /**
   * Invoked by the iframe when it wants to be resized.
   */
  _handleResizeMsg: function(message) {
    if (!this.isValid()) {
      return;
    }
    var iframe = this.getIframeNode();
    iframe.style.height = message.height + 'px';
    if (message.width) {
      iframe.style.width = message.width + 'px';
    }
    iframe.style.border = 'none';
    this._makeVisible();
  },

  /**
   * Add the loader.
   */
  _addLoader: function() {
    if (!this._loaderDiv) {
      FB.Dom.addCss(this.dom, 'fb_iframe_widget_loader');
      this._loaderDiv = document.createElement('div');
      this._loaderDiv.className = 'FB_Loader';
      this.dom.appendChild(this._loaderDiv);
    }
  },

  /**
   * Remove the loader.
   */
  _removeLoader: function() {
    if (this._loaderDiv) {
      FB.Dom.removeCss(this.dom, 'fb_iframe_widget_loader');
      if (this._loaderDiv.parentNode) {
        this._loaderDiv.parentNode.removeChild(this._loaderDiv);
      }
      this._loaderDiv = null;
    }
  },

  /**
   * Get's the final QS/Post Data for the iframe with automatic params added
   * in.
   *
   * @return {Object} the params object
   */
  _getQS: function() {
    return FB.copy({
      api_key      : FB._apiKey,
      locale       : FB._locale,
      sdk          : 'joey',
      ref          : this.getAttribute('ref')
    }, this.getUrlBits().params);
  },

  /**
   * Gets the final URL based on the name specified in the bits.
   *
   * @return {String} the url
   */
  _getURL: function() {
    var
      domain = this.getDefaultWebDomain(),
      static_path = '';

    if (this._fetchPreCachedLoader) {
      domain = this.getDefaultStaticDomain();
      static_path = 'static/';
    }

    return FB.getDomain(domain) + 'plugins/' + static_path +
           this.getUrlBits().name + '.php';
  },

  /**
   * Will do the POST request to the iframe.
   */
  _postRequest: function() {
    FB.Content.submitToTarget({
      url    : this._getURL(),
      target : this.getIframeNode().name,
      params : this._getQS()
    });
  }
});

FB.provide('XFBML.IframeWidget', {
  widgetPipeIframeCount: 0,
  masterWidgetPipeIframe: null,
  allWidgetPipeIframes: {},
  batchWidgetPipeRequests: function() {
    if (!FB.XFBML.IframeWidget.masterWidgetPipeIframe) {
      // nothing widget-pipe enabled is being rendered,
      // so ignore this entirely.
      return;
    }

    var widgetPipeDescriptions =
      FB.XFBML.IframeWidget._groupWidgetPipeDescriptions();
    var widgetPipeParams = {
      widget_pipe: FB.JSON.stringify(widgetPipeDescriptions),
      href: window.location,
      site: location.hostname,
      channel: FB.XFBML.IframeWidget.masterWidgetPipeIframe.getChannelUrl(),
      api_key: FB._apiKey,
      locale: FB._locale,
      sdk: 'joey'
    };
    var widgetPipeIframeName = FB.guid();
    var masterWidgetPipeDom = FB.XFBML.IframeWidget.masterWidgetPipeIframe.dom;
    // we need a dedicated span within the first fb:like tag to house the
    // iframe that fetches all of the plugin data.
    var masterWidgetPipeSpan =
      masterWidgetPipeDom.appendChild(document.createElement('span'));
    FB.Content.insertIframe({
      url: 'about:blank',
      root: masterWidgetPipeSpan,
      name: widgetPipeIframeName,
      className: 'fb_hidden fb_invisible',
      onload: function() {
        FB.Content.submitToTarget({
          url: FB._domain.www + 'widget_pipe.php?widget_pipe=1',
          target: widgetPipeIframeName,
          params: widgetPipeParams
        });
      }
    });
  },

  _groupWidgetPipeDescriptions: function() {
    var widgetPipeDescriptions = {};
    for (var key in FB.XFBML.IframeWidget.allWidgetPipeIframes) {
      var controller = FB.XFBML.IframeWidget.allWidgetPipeIframes[key];
      var urlBits = controller.getUrlBits();
      var widgetPipeDescription = {
        widget: urlBits.name
      };
      FB.copy(widgetPipeDescription, urlBits.params);
      widgetPipeDescriptions[key] = widgetPipeDescription;
    }

    return widgetPipeDescriptions;
  }
});


/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.xfbml.activity
 * @layer xfbml
 * @requires fb.type fb.xfbml.iframewidget
 */

/**
 * Implementation for fb:activity tag.
 *
 * @class FB.XFBML.Activity
 * @extends FB.XFBML.IframeWidget
 * @private
 */
FB.subclass('XFBML.Activity', 'XFBML.IframeWidget', null, {
  _visibleAfter: 'load',

  /**
   * Refresh the iframe on auth.statusChange events.
   */
  _refreshOnAuthChange: true,

  /**
   * Do initial attribute processing.
   */
  setupAndValidate: function() {
    this._attr = {
      border_color    : this.getAttribute('border-color'),
      colorscheme     : this.getAttribute('color-scheme'),
      filter          : this.getAttribute('filter'),
      action          : this.getAttribute('action'),
      max_age         : this.getAttribute('max_age'),
      font            : this.getAttribute('font'),
      linktarget      : this.getAttribute('linktarget', '_blank'),
      header          : this._getBoolAttribute('header'),
      height          : this._getPxAttribute('height', 300),
      recommendations : this._getBoolAttribute('recommendations'),
      site            : this.getAttribute('site', location.hostname),
      width           : this._getPxAttribute('width', 300)
    };

    return true;
  },

  /**
   * Get the initial size.
   *
   * @return {Object} the size
   */
  getSize: function() {
    return { width: this._attr.width, height: this._attr.height };
  },

  /**
   * Get the URL bits for the iframe.
   *
   * @return {Object} the iframe URL bits
   */
  getUrlBits: function() {
    return { name: 'activity', params: this._attr };
  }
});

/**
 * @provides fb.xfbml.buttonelement
 * @requires fb.string
 *           fb.type
 *           fb.xfbml.element
 * @css fb.css.button
 * @layer xfbml
 */

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Base class for a button element.
 *
 * @class FB.XFBML.ButtonElement
 * @extends  FB.XFBML.Element
 * @private
 */
FB.subclass('XFBML.ButtonElement', 'XFBML.Element', null, {
  _allowedSizes: ['icon', 'small', 'medium', 'large', 'xlarge'],

  /////////////////////////////////////////////////////////////////////////////
  // Methods the implementation MUST override
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Invoked when the button is clicked.
   */
  onClick: function() {
    throw new Error('Inheriting class needs to implement onClick().');
  },

  /////////////////////////////////////////////////////////////////////////////
  // Methods the implementation CAN override
  /////////////////////////////////////////////////////////////////////////////

  /**
   * This method is invoked before any processing is done to do any initial
   * setup and do any necessary validation on the attributes. A return value of
   * false will indicate that validation was unsuccessful and processing will
   * be halted. If you are going to return false and halt processing, you
   * should ensure you use FB.log() to output a short informative message
   * before doing so.
   *
   * @return {Boolean} true to continue processing, false to halt it
   */
  setupAndValidate: function() {
    return true;
  },

  /**
   * Should return the button markup. The default behaviour is to return the
   * original innerHTML of the element.
   *
   * @return {String} the HTML markup for the button
   */
  getButtonMarkup: function() {
    return this.getOriginalHTML();
  },

  /////////////////////////////////////////////////////////////////////////////
  // Public methods the implementation CAN use
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Get the original innerHTML of the element.
   *
   * @return {String} the original innerHTML
   */
  getOriginalHTML: function() {
    return this._originalHTML;
  },

  /////////////////////////////////////////////////////////////////////////////
  // Private methods the implementation MUST NOT use or override
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Processes this tag.
   */
  process: function() {
    if (!('_originalHTML' in this)) {
      this._originalHTML = FB.String.trim(this.dom.innerHTML);
    }

    if (!this.setupAndValidate()) {
      // failure to validate means we're done rendering what we can
      this.fire('render');
      return;
    }

    var
      size = this._getAttributeFromList('size', 'medium', this._allowedSizes),
      className = '',
      markup    = '';

    if (size == 'icon') {
      className = 'fb_button_simple';
    } else {
      var rtl_suffix = FB._localeIsRtl ? '_rtl' : '';
      markup = this.getButtonMarkup();
      className = 'fb_button' + rtl_suffix + ' fb_button_' + size + rtl_suffix;
    }

    if (markup !== '') {
      this.dom.innerHTML = (
        '<a class="' + className + '">' +
          '<span class="fb_button_text">' + markup + '</span>' +
        '</a>'
      );
      // the firstChild is the anchor tag we just setup above
      this.dom.firstChild.onclick = FB.bind(this.onClick, this);
    }
    this.fire('render');
  }
});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.xfbml.addprofiletab
 * @layer xfbml
 * @requires fb.type
 *           fb.intl
 *           fb.ui
 *           fb.xfbml.buttonelement
 *           fb.helper
 */

/**
 * Implementation for fb:add-profile-tab tag.
 *
 * @class FB.XFBML.AddProfileTab
 * @extends  FB.XFBML.ButtonElement
 * @private
 */
FB.subclass('XFBML.AddProfileTab', 'XFBML.ButtonElement', null, {
  /**
   * Should return the button markup. The default behaviour is to return the
   * original innerHTML of the element.
   *
   * @return {String} the HTML markup for the button
   */
  getButtonMarkup: function() {
    return FB.Intl.tx._("Add Profile Tab on Facebook");
  },

  /**
   * The ButtonElement base class will invoke this when the button is clicked.
   */
  onClick: function() {
    FB.ui({ method: 'profile.addtab' }, this.bind(function(result) {
      if (result.tab_added) {
        FB.Helper.invokeHandler(this.getAttribute('on-add'), this);
      }
    }));
  }
});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.xfbml.facepile
 * @layer xfbml
 * @requires fb.type fb.auth
 */

/**
 * Implementation for fb:facepile tag.
 *
 * @class FB.XFBML.Facepile
 * @extends FB.XFBML.Facepile
 * @private
 */
FB.subclass('XFBML.Facepile', 'XFBML.IframeWidget', null, {
  _visibleAfter: 'load',
  _extraParams: {},

  /**
   * Do initial attribute processing.
   */
  setupAndValidate: function() {
    this._attr = {
      href: this.getAttribute('href'),
      channel: this.getChannelUrl(),
      colorscheme: this.getAttribute('colorscheme', 'light'),
      max_rows: this.getAttribute('max-rows'),
      action: this.getAttribute('action', 'like'),
      tense: this.getAttribute('tense', 'past'),
      width: this._getPxAttribute('width', 200),
      ref: this.getAttribute('ref'),
      size: this.getAttribute('size', 'small'),
      extended_social_context:
        this.getAttribute('extended_social_context', false),
      // inner html will become the login button text,
      // if specified
      login_text: this.dom.innerHTML
    };

    // clear out the inner html that we'll be using
    // for the login button text
    this.clear();

    for (var key in this._extraParams) {
      this._attr[key] = this._extraParams[key];
    }

    return true;
  },

  /**
   * Sets extra parameters that will be passed to the widget's url.
   */
  setExtraParams: function(val) {
    this._extraParams = val;
  },


  /**
   * Setup event handlers.
   */
  oneTimeSetup: function() {
    // this widget's internal state is tied to the "connected" status. it
    // doesn't care about the difference between "unknown" and "notConnected".
    var lastStatus = FB._userStatus;
    FB.Event.subscribe('auth.statusChange', FB.bind(function(response) {
      if (lastStatus == 'connected' || response.status == 'connected') {
        this.process(true);
      }
      lastStatus = response.status;
    }, this));
  },

  /**
   * Get the initial size.
   *
   * By default, shows one row of 6 profiles
   *
   * @return {Object} the size
   */
  getSize: function() {
    // made height to 90 to accommodate large profile pic sizes
    if (this._attr.size == 'large') {
        return { width: this._attr.width, height: 90 };
    }
    return { width: this._attr.width, height: 70 };
  },

  /**
   * Get the URL bits for the iframe.
   *
   * @return {Object} the iframe URL bits
   */
  getUrlBits: function() {
    return { name: 'facepile', params: this._attr };
  }
});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.xfbml.addtotimeline
 * @layer xfbml
 * @requires fb.type fb.xfbml.iframewidget fb.xfbml.facepile fb.auth
 */

/**
 * Implementation for fb:add-to-timeline tag.
 *
 * @class FB.XFBML.AddToTimeline
 * @extends FB.XFBML.IframeWidget
 * @private
 */
FB.subclass('XFBML.AddToTimeline', 'XFBML.Facepile', null, {
  _visibleAfter: 'load',

  /**
   * Get the initial size.
   *
   * By default, 300x250
   *
   * @return {Object} the size
   */
  getSize: function() {
    return { width: 300, height: 250 };
  },

  /**
   * Get the URL bits for the iframe.
   *
   * @return {Object} the iframe URL bits
   */
  getUrlBits: function() {
    return { name: 'add_to_timeline', params: this._attr };
  }
});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.xfbml.bookmark
 * @layer xfbml
 * @requires fb.type
 *           fb.intl
 *           fb.ui
 *           fb.xfbml.buttonelement
 *           fb.helper
 */

/**
 * Implementation for fb:bookmark tag.
 *
 * @class FB.XFBML.Bookmark
 * @extends  FB.XFBML.ButtonElement
 * @private
 */
FB.subclass('XFBML.Bookmark', 'XFBML.ButtonElement', null, {
  /**
   * Should return the button markup. The default behaviour is to return the
   * original innerHTML of the element.
   *
   * @return {String} the HTML markup for the button
   */
  getButtonMarkup: function() {
    return FB.Intl.tx._("Bookmark on Facebook");
  },

  /**
   * The ButtonElement base class will invoke this when the button is clicked.
   */
  onClick: function() {
    FB.ui({ method: 'bookmark.add' }, this.bind(function(result) {
      if (result.bookmarked) {
        FB.Helper.invokeHandler(this.getAttribute('on-add'), this);
      }
    }));
  }
});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.xfbml.comments
 * @layer xfbml
 * @requires fb.type fb.xfbml.iframewidget fb.auth fb.ua
 */

/**
 * Implementation for fb:comments tag.
 *
 * @class FB.XFBML.Comments
 * @extends FB.XFBML.IframeWidget
 * @private
 */
FB.subclass('XFBML.Comments', 'XFBML.IframeWidget', null, {
  _visibleAfter: 'immediate',

  /**
   * Refresh the iframe on auth.statusChange events.
   */
  _refreshOnAuthChange: true,

  /**
   * Do initial attribute processing.
   */
  setupAndValidate: function() {
    // query parameters to the comments iframe
    var attr = {
      channel_url : this.getChannelUrl(),
      colorscheme : this.getAttribute('colorscheme'),
      numposts    : this.getAttribute('num-posts', 10),
      width       : this._getPxAttribute('width', 550),
      href        : this.getAttribute('href'),
      permalink   : this.getAttribute('permalink'),
      publish_feed : this.getAttribute('publish_feed'),
      mobile      : this._getBoolAttribute('mobile')
    };

    if (FB.initSitevars.enableMobileComments &&
        FB.UA.mobile() &&
        attr.mobile !== false) {
      attr.mobile = true;
    }

    // legacy comments box params
    if (!attr.href) {
      attr.migrated    = this.getAttribute('migrated');
      attr.xid         = this.getAttribute('xid');
      attr.title       = this.getAttribute('title', document.title);
      attr.url         = this.getAttribute('url', document.URL);
      attr.quiet       = this.getAttribute('quiet');
      attr.reverse     = this.getAttribute('reverse');
      attr.simple      = this.getAttribute('simple');
      attr.css         = this.getAttribute('css');
      attr.notify      = this.getAttribute('notify');

      // default xid to current URL
      if (!attr.xid) {
        // We always want the URL minus the hash "#" also note the encoding here
        // and down below when the url is built. This is intentional, so the
        // string received by the server is url-encoded and thus valid.
        var index = document.URL.indexOf('#');
        if (index > 0) {
          attr.xid = encodeURIComponent(document.URL.substring(0, index));
        }
        else {
          attr.xid = encodeURIComponent(document.URL);
        }
      }

      if (attr.migrated) {
        attr.href =
          'http://www.facebook.com/plugins/comments_v1.php?' +
          'app_id=' + FB._apiKey +
          '&xid=' + encodeURIComponent(attr.xid) +
          '&url=' + encodeURIComponent(attr.url);
      }
    } else {
      // allows deep linking of comments by surfacing linked comments
      var fb_comment_id = this.getAttribute('fb_comment_id');
      if (!fb_comment_id) {
        fb_comment_id =
          FB.QS.decode(
            document.URL.substring(
              document.URL.indexOf('?') + 1)).fb_comment_id;
        if (fb_comment_id && fb_comment_id.indexOf('#') > 0) {
          // strip out the hash if we managed to pick it up
          fb_comment_id =
            fb_comment_id.substring(0,
                                    fb_comment_id.indexOf('#'));
        }
      }

      if (fb_comment_id) {
        attr.fb_comment_id = fb_comment_id;
        this.subscribe('render',
                       FB.bind(function() {
                           window.location.hash = this.getIframeNode().id;
                         }, this));
      }
    }

    this._attr = attr;
    return true;
  },

  /**
   * Setup event handlers.
   */
  oneTimeSetup: function() {
    this.subscribe('xd.addComment',
                   FB.bind(this._handleCommentMsg, this));
    this.subscribe('xd.commentCreated',
                   FB.bind(this._handleCommentCreatedMsg, this));
    this.subscribe('xd.commentRemoved',
                   FB.bind(this._handleCommentRemovedMsg, this));
  },

  /**
   * Get the initial size.
   *
   * @return {Object} the size
   */
  getSize: function() {
    if (this._attr.mobile) {
      return { width: '100%', height: 160 };
    }
    return { width: this._attr.width, height: 160 };
  },

  /**
   * Get the URL bits for the iframe.
   *
   * @return {Object} the iframe URL bits
   */
  getUrlBits: function() {
    return { name: 'comments', params: this._attr };
  },

  /**
   * Returns the default domain that should be used for the
   * comments plugin being served from the web tier.  Because
   * of the complexities involved in serving up the comments
   * plugin for logged out HTTPS users, and because a near-majority
   * of comments plugins are rendered for logged out users, we
   * just always load the comments plugin over https.
   */
  getDefaultWebDomain: function() {
    if (this._attr.mobile) {
      return 'https_m';
    } else {
      return 'https_www';
    }
  },

  /**
   * Invoked by the iframe when a comment is added. Note, this feature needs to
   * be enabled by specifying the notify=true attribute on the tag. This is in
   * order to improve performance by only requiring this overhead when a
   * developer explicitly said they want it.
   *
   * @param message {Object} the message received via XD
   */
  _handleCommentMsg: function(message) {
    //TODO (naitik) what should we be giving the developers here? is there a
    //              comment_id they can get?
    if (!this.isValid()) {
      return;
    }
    FB.Event.fire('comments.add', {
      post: message.post,
      user: message.user,
      widget: this
    });
  },

  _handleCommentCreatedMsg: function(message) {
    if (!this.isValid()) {
      return;
    }

    var eventArgs = {
      href: message.href,
      commentID: message.commentID,
      parentCommentID: message.parentCommentID
    };

    FB.Event.fire('comment.create', eventArgs);
  },

  _handleCommentRemovedMsg: function(message) {
    if (!this.isValid()) {
      return;
    }

    var eventArgs = {
      href: message.href,
      commentID: message.commentID
    };

    FB.Event.fire('comment.remove', eventArgs);
  }
});

/**
 * @provides fb.xfbml.commentscount
 * @requires fb.data
 *           fb.dom
 *           fb.helper
 *           fb.intl
 *           fb.string
 *           fb.type
 *           fb.ui
 *           fb.xfbml
 *           fb.xfbml.element
 * @css fb.css.sharebutton
 * @layer xfbml
 */

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Implementation for fb:comments-count tag.
 * @class FB.XFBML.CommentsCount
 * @extends  FB.XFBML.Element
 * @private
 */
FB.subclass('XFBML.CommentsCount', 'XFBML.Element', null, {
  /**
   * Processes this tag.
   */
  process: function() {
    this._href = this.getAttribute('href', window.location.href);

    this._count = FB.Data._selectByIndex(
      ['commentsbox_count'],
      'link_stat',
      'url',
      this._href
    );

    FB.Dom.addCss(this.dom, 'fb_comments_count_zero');

    this._count.wait(
      FB.bind(
        function() {
          var c = this._count.value[0].commentsbox_count;
          this.dom.innerHTML = FB.String.format(
            '<span class="fb_comments_count">{0}</span>',
            c);

          if (c > 0) {
            FB.Dom.removeCss(this.dom, 'fb_comments_count_zero');
          }

          this.fire('render');
        },
        this)
    );
  }
});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.anim
 * @layer basic
 * @requires fb.prelude fb.array fb.dom
 */

/**
 * This provides helper methods related to basic animation.
 *
 * @class FB.Anim
 * @static
 * @private
 */
FB.provide('Anim', {
  /**
   * Animate Transformable Element
   *
   * Note: only pixel, point, %, and opactity values are animate-able
   *
   * @param dom {DOMElement} the element to be animated
   * @param props {Object} an object with the properties of the animation
   *                       destination
   * @param duration {Number} the number of milliseconds over which the
   *                          animation should happen.
   * @param callback {Function} the callback function to call after the
   *                            animation is complete
   */
  ate: function(dom, props, duration, callback) {
    duration = !isNaN(parseFloat(duration)) && duration >= 0 ? duration : 750;
    var
      frame_speed = 40,
      from        = {},
      to          = {},
      begin       = null,
      s           = dom.style,
      timer       = setInterval(FB.bind(function() {
        if (!begin) { begin = new Date().getTime(); }
        // percent done
        var pd = 1;
        if (duration != 0) {
          pd = Math.min((new Date().getTime() - begin) / duration, 1);
        }
        FB.Array.forEach(props, FB.bind(function(value, prop) {
          if (!from[prop]) { // parse from CSS
            var style = FB.Dom.getStyle(dom, prop);
            // check for can't animate this, bad prop for this browser
            if (style === false) { return; }
            from[prop] = this._parseCSS(style+''); // force string type
          }
          if (!to[prop]) { // parse to CSS
            to[prop] = this._parseCSS(value.toString());
          }
          var next = ''; // the next value to set
          FB.Array.forEach(from[prop], function(pair, i) {
            /* check for user override not animating this part via special
             * symbol, "?". This is best used for animating properties with
             * multiple parts, such as backgroundPosition, where you only want
             * to animate one part and not the other.
             *
             * e.g.
             *   backgroundPosition: '8px 10px' => moves x and y to 8, 10
             *   backgroundPosition: '? 4px' => moves y to 4 and leaves x alone
             *   backgroundPosition: '7px ?' => moves x to 7 and leaves y alone
             */
            if (isNaN(to[prop][i].numPart) && to[prop][i].textPart == '?') {
              next = pair.numPart + pair.textPart;
            /* check for a non animate-able part
             * this includes colors (for now), positions, anything with out a #,
             * etc.
             */
            } else if (isNaN(pair.numPart)) {
              next = pair.textPart;
            // yay it's animate-able!
            } else {
              next +=
                (pair.numPart + // orig value
                 Math.ceil((to[prop][i].numPart - pair.numPart) *
                            Math.sin(Math.PI/2 * pd))) +
                to[prop][i].textPart + ' '; // text part and trailing space
            }
          });
          // update with new value
          FB.Dom.setStyle(dom, prop, next);
        }, this));
        if (pd == 1) { // are we done? clear the timer, call the callback
          clearInterval(timer);
          if (callback) { callback(dom); }
        }
      }, this), frame_speed);
  },

  /*
   * Parses a CSS statment into it's parts
   *
   * e.g. "1px solid black" =>
   *        [[numPart: 1,   textPart: 'px'],
   *         [numPart: NaN, textPart: 'solid'],
   *         [numPart: NaN, textPart: 'black']]
   *  or
   *      "5px 0% 2em none" =>
   *        [[numPart: 5,   textPart: 'px'],
   *         [numPart: 0,   textPart: '%'],
   *         [numPart: 2,   textPart: 'em'],
   *         [numPart: NaN, textPart: 'none']]
   */
  _parseCSS: function(css) {
    var ret = [];
    FB.Array.forEach(css.split(' '), function(peice) {
      var num = parseInt(peice, 10);
      ret.push({numPart: num, textPart: peice.replace(num,'')});
    });
    return ret;
  }
});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 *
 * Contains the public method ``FB.Insights.impression`` for analytics pixel
 *
 * @provides fb.insights
 * @requires fb.prelude
 */

/**
 * Analytics pixel calls. If you are unsure about the potential that
 * integrating Facebook could provide your application, you can use this light
 * weight image beacon to collect some insights.
 *
 * TODO: Where does one go to look at this data?
 *
 * @class FB.Insights
 * @static
 * @access private
 */
FB.provide('Insights', {
  /**
   * This method should be called once by each page where you want to track
   * impressions.
   *
   *     FB.Insights.impression(
   *       {
   *         api_key: 'API_KEY',
   *         lid: 'EVENT_TYPE'
   *       }
   *     );
   *
   * @access private
   * @param params {Object} parameters for the impression
   * @param cb {Function} optional - called with the result of the action
   */
  impression: function(params, cb) {
    // no http or https so browser will use protocol of current page
    // see http://www.faqs.org/rfcs/rfc1808.html
    var g = FB.guid(),
        u = "//ah8.facebook.com/impression.php/" + g + "/",
        i = new Image(1, 1),
        s = [];

    if (!params.api_key && FB._apiKey) {
      params.api_key = FB._apiKey;
    }
    for (var k in params) {
      s.push(encodeURIComponent(k) + '=' + encodeURIComponent(params[k]));
    }

    u += '?' + s.join('&');
    if (cb) {
      i.onload = cb;
    }
    i.src = u;
  }
});


/**
 * @provides fb.xfbml.connectbar
 * @requires fb.anim
 *           fb.auth
 *           fb.data
 *           fb.dom
 *           fb.event
 *           fb.helper
 *           fb.insights
 *           fb.intl
 *           fb.string
 *           fb.type
 *           fb.ua
 *           fb.xfbml
 *           fb.xfbml.element
 * @css fb.css.connectbarwidget
 * @layer xfbml
 */

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @class FB.XFBML.ConnectBar
 * @extends  FB.XFBML.Element
 * @private
 */
FB.subclass('XFBML.ConnectBar', 'XFBML.Element', null, {
  _initialHeight: null,
  _initTopMargin: 0,
  _picFieldName: 'pic_square',
  _page: null, // the external site's content parent node
  _displayed: false, // is the bar currently displayed
  _notDisplayed: false, // is the bar currently not displayed
  _container: null,
  _animationSpeed: 0, // default to no (zero time, instant) animation

  /**
   * Processes this tag.
   */
  process: function() {
    // Wait for status to be known
    FB.getLoginStatus(this.bind(function(resp) {
      FB.Event.monitor('auth.statusChange', this.bind(function() {
        // Is Element still in DOM tree? are we connected?
        if (this.isValid() && FB._userStatus == 'connected') {
          this._uid = FB.Helper.getLoggedInUser();
          FB.api({ // check if marked seen / current seen count
            method: 'Connect.shouldShowConnectBar'
          }, this.bind(function(showBar) {
            if (showBar != 2) {
              this._animationSpeed = (showBar == 0) ? 750 : 0;
              this._showBar();
            } else {
              this._noRender();
            }
          }));
        } else {
          this._noRender();
        }
        return false; // continue monitoring
      }));
    }));
  },

  /**
   * load the data for the bar and render it firing all the events in the
   * process
   */
  _showBar: function() {
    var q1 = FB.Data._selectByIndex(['first_name', 'profile_url',
                                      this._picFieldName],
                                    'user', 'uid', this._uid);
    var q2 = FB.Data._selectByIndex(['display_name'], 'application',
                                    'api_key', FB._apiKey);
    FB.Data.waitOn([q1, q2], FB.bind(function(data) {
      data[0][0].site_name = data[1][0].display_name;
      if (!this._displayed) {
        this._displayed = true;
        this._notDisplayed = false;
        this._renderConnectBar(data[0][0]);
        this.fire('render');
        FB.Insights.impression({
          lid: 104,
          name: 'widget_load'
        });
        this.fire('connectbar.ondisplay');
        FB.Event.fire('connectbar.ondisplay', this);
        FB.Helper.invokeHandler(this.getAttribute('on-display'), this);
      }
    }, this));
  },

  /**
   * If the bar is rendered, hide it and fire the no render events
   */
  _noRender: function() {
    if (this._displayed) {
      this._displayed = false;
      this._closeConnectBar();
    }
    if (!this._notDisplayed) {
      this._notDisplayed = true;
      this.fire('render');
      this.fire('connectbar.onnotdisplay');
      FB.Event.fire('connectbar.onnotdisplay', this);
      FB.Helper.invokeHandler(this.getAttribute('on-not-display'), this);
    }
  },

  /**
   * Given this name, site name, and profile pic url render the connect bar
   */
  _renderConnectBar: function(info) {
    var bar = document.createElement('div'),
        container = document.createElement('div');
    // TODO(alpjor) add rtl support
    bar.className = 'fb_connect_bar';
    container.className = 'fb_reset fb_connect_bar_container';
    container.appendChild(bar);
    document.body.appendChild(container);
    this._container = container;
    this._initialHeight = Math.round(
              parseFloat(FB.Dom.getStyle(container, 'height')) +
              parseFloat(FB.Dom.getStyle(container, 'borderBottomWidth')));
    bar.innerHTML = FB.String.format(
      '<div class="fb_buttons">' +
        '<a href="#" class="fb_bar_close">' +
          '<img src="{1}" alt="{2}" title="{2}"/>' +
        '</a>' +
      '</div>' +
      '<a href="{7}" class="fb_profile" target="_blank">' +
        '<img src="{3}" alt="{4}" title="{4}"/>' +
      '</a>' +
      '{5}' +
      ' <span>' +
        '<a href="{8}" class="fb_learn_more" target="_blank">{6}</a> &ndash; ' +
        '<a href="#" class="fb_no_thanks">{0}</a>' +
      '</span>',
      FB.Intl.tx._("No Thanks"),
      FB.getDomain('cdn') + FB.XFBML.ConnectBar.imgs.buttonUrl,
      FB.Intl.tx._("Close"),
      info[this._picFieldName] || FB.getDomain('cdn') +
                                  FB.XFBML.ConnectBar.imgs.missingProfileUrl,
      FB.String.escapeHTML(info.first_name),
      FB.Intl.tx._("Hi {firstName}. \u003Cstrong>{siteName}\u003C\/strong> is using Facebook to personalize your experience.", {
        firstName: FB.String.escapeHTML(info.first_name),
        siteName: FB.String.escapeHTML(info.site_name)
      }),
      FB.Intl.tx._("Learn More"),
      info.profile_url,
      FB.getDomain('www') + 'sitetour/connect.php'
    );
    var _this = this;
    FB.Array.forEach(bar.getElementsByTagName('a'), function(el) {
      el.onclick = FB.bind(_this._clickHandler, _this);
    });
    this._page = document.body;
    var top_margin = 0;
    if (this._page.parentNode) {
      top_margin = Math.round(
        (parseFloat(FB.Dom.getStyle(this._page.parentNode, 'height')) -
        parseFloat(FB.Dom.getStyle(this._page, 'height'))) / 2);
    } else {
      top_margin = parseInt(FB.Dom.getStyle(this._page, 'marginTop'), 10);
    }
    top_margin = isNaN(top_margin) ? 0 : top_margin;
    this._initTopMargin = top_margin;
    if (!window.XMLHttpRequest) { // ie6
      container.className += " fb_connect_bar_container_ie6";
    } else {
      container.style.top = (-1*this._initialHeight) + 'px';
      FB.Anim.ate(container, { top: '0px' }, this._animationSpeed);
    }
    var move = { marginTop: this._initTopMargin + this._initialHeight + 'px' }
    if (FB.UA.ie()) { // for ie
      move.backgroundPositionY = this._initialHeight + 'px'
    } else { // for others
      move.backgroundPosition = '? ' + this._initialHeight + 'px'
    }
    FB.Anim.ate(this._page, move, this._animationSpeed);
  },

  /**
   * Handle the anchor clicks from the connect bar
   *
   */
  _clickHandler : function(e) {
    e = e || window.event;
    var el = e.target || e.srcElement;
    while (el.nodeName != 'A') { el = el.parentNode; }
    switch (el.className) {
      case 'fb_bar_close':
        FB.api({ // mark seen
          method: 'Connect.connectBarMarkAcknowledged'
        });
        FB.Insights.impression({
          lid: 104,
          name: 'widget_user_closed'
        });
        this._closeConnectBar();
        break;
      case 'fb_learn_more':
      case 'fb_profile':
        window.open(el.href);
        break;
      case 'fb_no_thanks':
        this._closeConnectBar();
        FB.api({ // mark seen
          method: 'Connect.connectBarMarkAcknowledged'
        });
        FB.Insights.impression({
          lid: 104,
          name: 'widget_user_no_thanks'
        });
        FB.api({ method: 'auth.revokeAuthorization', block: true },
               this.bind(function() {
          this.fire('connectbar.ondeauth');
          FB.Event.fire('connectbar.ondeauth', this);
          FB.Helper.invokeHandler(this.getAttribute('on-deauth'), this);
          if (this._getBoolAttribute('auto-refresh', true)) {
            window.location.reload();
          }
        }));
        break;
    }
    return false;
  },

  _closeConnectBar: function() {
    this._notDisplayed = true;
    var move = { marginTop: this._initTopMargin + 'px' }
    if (FB.UA.ie()) { // for ie
      move.backgroundPositionY = '0px'
    } else { // for others
      move.backgroundPosition = '? 0px'
    }
    var speed = (this._animationSpeed == 0) ? 0 : 300;
    FB.Anim.ate(this._page, move, speed);
    FB.Anim.ate(this._container, {
      top: (-1 * this._initialHeight) + 'px'
    }, speed, function(el) {
      el.parentNode.removeChild(el);
    });
    this.fire('connectbar.onclose');
    FB.Event.fire('connectbar.onclose', this);
    FB.Helper.invokeHandler(this.getAttribute('on-close'), this);
  }
});

FB.provide('XFBML.ConnectBar', {
  imgs: {
    buttonUrl: 'images/facebook-widgets/close_btn.png',
    missingProfileUrl: 'pics/q_silhouette.gif'
  }
});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.xfbml.fan
 * @layer xfbml
 * @requires fb.type fb.xfbml.iframewidget
 */

/**
 * Implementation for fb:fan tag.
 *
 * @class FB.XFBML.Fan
 * @extends FB.XFBML.IframeWidget
 * @private
 */
FB.subclass('XFBML.Fan', 'XFBML.IframeWidget', null, {
  _visibleAfter: 'load',

  /**
   * Do initial attribute processing.
   */
  setupAndValidate: function() {
    this._attr = {
      api_key     : FB._apiKey,
      connections : this.getAttribute('connections', '10'),
      css         : this.getAttribute('css'),
      height      : this._getPxAttribute('height'),
      id          : this.getAttribute('profile-id'),
      logobar     : this._getBoolAttribute('logo-bar'),
      name        : this.getAttribute('name'),
      stream      : this._getBoolAttribute('stream', true),
      width       : this._getPxAttribute('width', 300)
    };

    // "id" or "name" is required
    if (!this._attr.id && !this._attr.name) {
      FB.log('<fb:fan> requires one of the "id" or "name" attributes.');
      return false;
    }

    var height = this._attr.height;
    if (!height) {
      if ((!this._attr.connections || this._attr.connections === '0') &&
          !this._attr.stream) {
        height = 65;
      } else if (!this._attr.connections || this._attr.connections === '0') {
        height = 375;
      } else if (!this._attr.stream) {
        height = 250;
      } else {
        height = 550;
      }
    }
    // add space for logobar
    if (this._attr.logobar) {
      height += 25;
    }

    this._attr.height = height;
    return true;
  },

  /**
   * Get the initial size.
   *
   * @return {Object} the size
   */
  getSize: function() {
    return { width: this._attr.width, height: this._attr.height };
  },

  /**
   * Get the URL bits for the iframe.
   *
   * @return {Object} the iframe URL bits
   */
  getUrlBits: function() {
    return { name: 'fan', params: this._attr };
  }
});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.xfbml.friendpile
 * @layer xfbml
 * @requires fb.type fb.xfbml.facepile
 */

/**
 * Implementation for fb:friendpile tag.
 *
 * @class FB.XFBML.Friendpile
 * @extends FB.XFBML.Friendpile
 * @private
 */
FB.subclass('XFBML.Friendpile', 'XFBML.Facepile', null, {});

/**
 * @provides fb.xfbml.edgecommentwidget
 * @requires fb.type
 *           fb.xfbml.iframewidget
 * @css fb.css.edgecommentwidget
 * @layer xfbml
 */

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Base implementation for Edge Comment Widgets.
 *
 * @class FB.XFBML.EdgeCommentWidget
 * @extends FB.XFBML.IframeWidget
 * @private
 */
FB.subclass('XFBML.EdgeCommentWidget', 'XFBML.IframeWidget',
  function(opts) {
    this._iframeWidth = opts.width + 1;
    this._iframeHeight = opts.height;
    this._attr = {
      master_frame_name: opts.masterFrameName,
      offsetX: opts.relativeWidthOffset - opts.paddingLeft
    };
    this.dom = opts.commentNode;
    this.dom.style.top = opts.relativeHeightOffset + 'px';
    this.dom.style.left = opts.relativeWidthOffset + 'px';
    this.dom.style.zIndex = FB.XFBML.EdgeCommentWidget.NextZIndex++;
    FB.Dom.addCss(this.dom, 'fb_edge_comment_widget');
  }, {

  /////////////////////////////////////////////////////////////////////////////
  // Internal stuff.
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Make the iframe visible only when it has finished loading.
   */
  _visibleAfter: 'load',
  _showLoader: false,

  /**
   * Get the initial size.
   *
   * @return {Object} the size
   */
  getSize: function() {
    return {
      width: this._iframeWidth,
      height: this._iframeHeight
    };
  },

  /**
   * Get there URL bits for the iframe.
   *
   * @return {Object} the iframe URL bits.
   */
  getUrlBits: function() {
    return { name: 'comment_widget_shell', params: this._attr };
  }
});

FB.provide('XFBML.EdgeCommentWidget', {
  NextZIndex : 10000
});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.xfbml.edgewidget
 * @layer xfbml
 * @requires fb.type
 *           fb.dom
 *           fb.event
 *           fb.helper
 *           fb.xfbml.iframewidget
 *           fb.xfbml.edgecommentwidget
 */

/**
 * Base implementation for Edge Widgets.
 *
 * @class FB.XFBML.EdgeWidget
 * @extends FB.XFBML.IframeWidget
 * @private
 */
FB.subclass('XFBML.EdgeWidget', 'XFBML.IframeWidget', null, {
  /**
   * Make the iframe visible only when it has finished loading.
   */
  _visibleAfter: 'immediate',
  _showLoader: false,
  _rootPadding: null,

  /**
   * Do initial attribute processing.
   */
  setupAndValidate : function() {
    FB.Dom.addCss(this.dom, 'fb_edge_widget_with_comment');
    this._attr = {
      channel_url             : this.getChannelUrl(),
      debug                   : this._getBoolAttribute('debug'),
      href                    : this.getAttribute('href', window.location.href),
      is_permalink            : this._getBoolAttribute('is-permalink'),
      node_type               : this.getAttribute('node-type', 'link'),
      width                   : this._getWidgetWidth(),
      font                    : this.getAttribute('font'),
      layout                  : this._getLayout(),
      colorscheme             : this.getAttribute('color-scheme'),
      action                  : this.getAttribute('action'),
      ref                     : this.getAttribute('ref'),
      show_faces              : this._shouldShowFaces(),
      no_resize               : this._getBoolAttribute('no_resize'),
      send                    : this._getBoolAttribute('send'),
      url_map                 : this.getAttribute('url_map'),
      extended_social_context :
        this._getBoolAttribute('extended_social_context', false)
    };

    this._rootPadding = {
      left: parseFloat(FB.Dom.getStyle(this.dom, 'paddingLeft')),
      top:  parseFloat(FB.Dom.getStyle(this.dom, 'paddingTop'))
    };

    return true;
  },

  oneTimeSetup : function() {
    this.subscribe('xd.authPrompted',
                   FB.bind(this._onAuthPrompt, this));
    this.subscribe('xd.edgeCreated',
                   FB.bind(this._onEdgeCreate, this));
    this.subscribe('xd.edgeRemoved',
                   FB.bind(this._onEdgeRemove, this));
    this.subscribe('xd.presentEdgeCommentDialog',
                   FB.bind(this._handleEdgeCommentDialogPresentation, this));
    this.subscribe('xd.dismissEdgeCommentDialog',
                   FB.bind(this._handleEdgeCommentDialogDismissal, this));
    this.subscribe('xd.hideEdgeCommentDialog',
                   FB.bind(this._handleEdgeCommentDialogHide, this));
    this.subscribe('xd.showEdgeCommentDialog',
                   FB.bind(this._handleEdgeCommentDialogShow, this));

  },

  /**
   * Get the initial size.
   *
   * @return {Object} the size
   */
  getSize: function() {
    return {
      width: this._getWidgetWidth(),
      height: this._getWidgetHeight()
    };
  },

  /**
   * Returns the height of the widget iframe, taking into
   * account the chosen layout, a user-supplied height, and
   * the min and max values we'll allow.  As it turns out, we
   * don't see too much.  (At the moment, we ignore the any
   * user-defined height, but that might change.)
   *
   * This logic is replicated in html/plugins/like.php and
   * lib/external_node/param_validation.php, and must be replicated
   * because it helps size the client's iframe.
   *
   * @return {String} the CSS-legitimate width in pixels, as
   *         with '460px'.
   */
  _getWidgetHeight : function() {
    var layout = this._getLayout();
    var should_show_faces = this._shouldShowFaces() ? 'show' : 'hide';
    var send = this._getBoolAttribute('send');
    var box_count = 65 + (send ? 25 : 0);
    var layoutToDefaultHeightMap =
      { 'standard' : {'show': 80, 'hide': 35},
        'box_count' : {'show': box_count, 'hide': box_count},
        'button_count' : {'show': 21, 'hide': 21},
        'simple' : {'show': 20, 'hide': 20}};
    return layoutToDefaultHeightMap[layout][should_show_faces];
  },

  /**
   * Returns the width of the widget iframe, taking into
   * account the chosen layout, the user supplied width, and
   * the min and max values we'll allow.  There is much more
   * flexibility in how wide the widget is, so a user-supplied
   * width just needs to fall within a certain range.
   *
   * This logic is replicated in html/plugins/like.php and
   * lib/external_node/param_validation.php, and must be replicated
   * because it helps size the client's iframe.
   *
   * @return {String} the CSS-legitimate width in pixels, as
   *         with '460px'.
   */
  _getWidgetWidth : function() {
    var layout = this._getLayout();
    var send = this._getBoolAttribute('send');
    var should_show_faces = this._shouldShowFaces() ? 'show' : 'hide';

    var recommend = (this.getAttribute('action') === 'recommend');
    var standard_min_width =
      (recommend ? 265 : 225) + (send ? 60 : 0);
    var button_count_default_width =
      (recommend ? 130 : 90) + (send ? 60 : 0);
    var box_count_default_width =
      this.getAttribute('action') === 'recommend' ? 100 : 55;
    var simple_default_width =
      this.getAttribute('action') === 'recommend' ? 90 : 50;
    var layoutToDefaultWidthMap =
      { 'standard': {'show': 450,
                     'hide': 450},
        'box_count': {'show': box_count_default_width,
                      'hide': box_count_default_width},
        'button_count': {'show': button_count_default_width,
                         'hide': button_count_default_width},
        'simple': {'show': simple_default_width,
                   'hide': simple_default_width}};
    var defaultWidth = layoutToDefaultWidthMap[layout][should_show_faces];
    var width = this._getPxAttribute('width', defaultWidth);

    var allowedWidths =
      { 'standard' : {'min' : standard_min_width, 'max' : 900},
        'box_count' : {'min' : box_count_default_width,
                       'max' : 900},
        'button_count' : {'min' : button_count_default_width,
                          'max' : 900},
        'simple' : {'min' : 49,
                    'max' : 900}};
    if (width < allowedWidths[layout].min) {
      width = allowedWidths[layout].min;
    } else if (width > allowedWidths[layout].max) {
      width = allowedWidths[layout].max;
    }

    return width;
  },

  /**
   * Returns the layout provided by the user, which can be
   * any one of 'standard', 'box', or 'bar'.  If the user
   * omits a layout, or if they layout they specify is invalid,
   * then we just go with 'standard'.
   *
   * This logic is replicated in html/plugins/like.php and
   * lib/external_node/param_validation.php, and must be replicated
   * because it helps size the client's iframe.
   *
   * @return {String} the layout of the Connect Widget.
   */
  _getLayout : function() {
    return this._getAttributeFromList(
      'layout',
      'standard',
      ['standard', 'button_count', 'box_count', 'simple']);
  },

  /**
   * Returns true if and only if we should be showing faces in the
   * widget, and false otherwise.
   *
   * This logic is replicated in html/plugins/like.php and
   * lib/external_node/param_validation.php, and must be replicated
   * because it helps size the client's iframe.
   *
   * @return {String} described above.
   */
  _shouldShowFaces : function() {
    return this._getLayout() === 'standard' &&
           this._getBoolAttribute('show-faces', true);
  },

  /**
   * Handles the event fired when the user actually connects to
   * something.  The idea is to tell the host to drop in
   * another iframe widget--an FB.XFBML.EdgeCommentWidget--
   * and sensibly position it so it partially overlays
   * the mother widget.
   *
   * @param {Object} message a dictionary of information about the
   *        event.
   * @return void
   */
  _handleEdgeCommentDialogPresentation : function(message) {
    if (!this.isValid()) {
      return;
    }
    var comment_node = document.createElement('span');
    this._commentSlave = this._createEdgeCommentWidget(message, comment_node);
    this.dom.appendChild(comment_node);
    this._commentSlave.process();
    this._commentWidgetNode = comment_node;
  },

  /**
   * Given a message from an xd comm event and the node where the edge comment
   * widget is to live in the dom, create an instance of
   * FB.XFBML.EdgeCommentWidget with the default parameters for an edge
   * widget. The idea is to allow this method to be overridden so that
   * other edge widgets can have different parameters and maybe even other
   * (sub)types of FB.XFBML.EdgeCommentWidget (e.g. SendButtonFormWidget).
   *
   * @param {Object} message a dictionary of information about the xd comm event
   * @param {Object} comment_node the dom node where the edgecommentwidget
   *                 will live.
   * @return FB.XFBML.EdgeCommentWidget
   */
  _createEdgeCommentWidget : function(message, comment_node) {
    var opts = {
      commentNode          : comment_node,
      externalUrl          : message.externalURL,
      masterFrameName      : message.masterFrameName,
      layout               : this._getLayout(),
      relativeHeightOffset : this._getHeightOffset(message),
      relativeWidthOffset  : this._getWidthOffset(message),
      anchorTargetX        : parseFloat(message['query[anchorTargetX]']) +
                             this._rootPadding.left,
      anchorTargetY        : parseFloat(message['query[anchorTargetY]']) +
                             this._rootPadding.top,
      width                : parseFloat(message.width),
      height               : parseFloat(message.height),
      paddingLeft          : this._rootPadding.left
    };
    return new FB.XFBML.EdgeCommentWidget(opts);
  },

  /**
   * Determines the relative height offset of the external comment
   * widget relative to the top of the primary like widget.
   * The numbers can potentially vary from layout to layout, because
   * the comment widget anchors on varying elements (button itself
   * in button_count and standard, the favicon in box_count, etc.)
   *
   * @param {Object} message the full message of information passed from
   *        like plugin to the comment widget.
   * @return {Number} relative offset that should influence
   *         placement of the external comment widget vsv the primary
   *         comment widget.
   */

  _getHeightOffset : function(message) {
    return parseFloat(message['anchorGeometry[y]']) +
           parseFloat(message['anchorPosition[y]']) +
           this._rootPadding.top;
  },

  /**
   * Determines the relative offset of the external comment
   * widget relative to the left (or right for RTL locales)
   * of the primary like widget.
   *
   * @param {Object} message the full message of information passed from
   *        like plugin to the comment widget.
   * @return {Number} relative offset than should influence
   *         placement of the external comment widget vsv the primary
   *         comment widget.
   */
  _getWidthOffset : function(message) {
    var off = parseFloat(message['anchorPosition[x]']) + this._rootPadding.left;
    var plugin_left = FB.Dom.getPosition(this.dom).x;
    var plugin_width = this.dom.offsetWidth;
    var screen_width = FB.Dom.getViewportInfo().width;
    var comment_width = parseFloat(message.width);
    var flipit = false;

    if (FB._localeIsRtl) {
        flipit = comment_width < plugin_left;
    } else if ((plugin_left + comment_width) > screen_width) {
      flipit = true;
    }

    if (flipit) {
      off += parseFloat(message['anchorGeometry[x]']) - comment_width;
    }

    return off;
  },

  /**
   * Returns an object of options that is used in several types of edge comment
   * widget
   *
   * @param {Object} message a dictionary of information about the xd comm event
   * @param {Object} comment_node the dom node where the edgecommentwidget
   *                 will live
   * @return {Object} options
   */
  _getCommonEdgeCommentWidgetOpts : function(message,
                                             comment_node) {
    return {
      colorscheme             : this._attr.colorscheme,
      commentNode             : comment_node,
      controllerID            : message.controllerID,
      nodeImageURL            : message.nodeImageURL,
      nodeRef                 : this._attr.ref,
      nodeTitle               : message.nodeTitle,
      nodeURL                 : message.nodeURL,
      nodeSummary             : message.nodeSummary,
      width                   : parseFloat(message.width),
      height                  : parseFloat(message.height),
      relativeHeightOffset    : this._getHeightOffset(message),
      relativeWidthOffset     : this._getWidthOffset(message),
      error                   : message.error,
      siderender              : message.siderender,
      extended_social_context : message.extended_social_context,
      anchorTargetX           : parseFloat(message['query[anchorTargetX]']) +
                                this._rootPadding.left,
      anchorTargetY           : parseFloat(message['query[anchorTargetY]']) +
                                this._rootPadding.top
    };
  },

  /**
   * Handles the XD event instructing the host to
   * remove the comment widget iframe.  The DOM node
   * for this widget is currently carrying just one child
   * node, which is the span representing the iframe.
   * We just need to return that one child in order for the
   * comment widget to disappear.
   *
   * @param {Object} message a dictionary of information about
   *        the event.
   * @return void
   */
  _handleEdgeCommentDialogDismissal : function(message) {
    if (this._commentWidgetNode) {
      this.dom.removeChild(this._commentWidgetNode);
      delete this._commentWidgetNode;
    }
  },

  /**
   * Handles the XD event instructing the hose to hide the comment
   * widget iframe.
   */
  _handleEdgeCommentDialogHide: function() {
    if (this._commentWidgetNode) {
      this._commentWidgetNode.style.display="none";
    }
  },

  /**
   * Handles the XD event instructing the hose to show the comment
   * widget iframe.
   */
  _handleEdgeCommentDialogShow: function() {
    if (this._commentWidgetNode) {
      this._commentWidgetNode.style.display="block";
    }
  },

  /**
   * Helper method that fires a specified event and also invokes the
   * given inline handler.
   */
  _fireEventAndInvokeHandler: function(eventName, eventAttribute) {
    FB.Helper.fireEvent(eventName, this);
    FB.Helper.invokeHandler(
      this.getAttribute(eventAttribute), this, [this._attr.href]); // inline
  },

  /**
   * Invoked when the user likes/recommends/whatever the thing to create an
   * edge.
   */
  _onEdgeCreate: function() {
    this._fireEventAndInvokeHandler('edge.create', 'on-create');
  },

  /**
   * Invoked when the user removes a like/recommendation/etc association with
   * something.
   */
  _onEdgeRemove: function() {
    this._fireEventAndInvokeHandler('edge.remove', 'on-remove');
  },

  /**
   * Invoked when the user is prompted to opt-in/log-in due to clicking
   * on an edge widget in an un-authed state.
   */
  _onAuthPrompt: function() {
    this._fireEventAndInvokeHandler('auth.prompt', 'on-prompt');
  }

});

/**
 * @provides fb.xfbml.sendbuttonformwidget
 * @requires fb.type
 *           fb.xfbml.edgecommentwidget
 * @css fb.css.sendbuttonformwidget
 * @layer xfbml
 */

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Implementation for the send button form widget,
 * which is an edge comment widget.
 *
 * @class FB.XFBML.SendButtonFormWidget
 * @extends FB.XFBML.EdgeCommentWidget
 * @private
 */
FB.subclass('XFBML.SendButtonFormWidget', 'XFBML.EdgeCommentWidget',
  function(opts) {
    this._base(opts);

    FB.Dom.addCss(this.dom, 'fb_send_button_form_widget');
    FB.Dom.addCss(this.dom, opts.colorscheme);
    FB.Dom.addCss(this.dom,
      (typeof opts.siderender != 'undefined' && opts.siderender) ?
        'siderender' : '');

    // The url title, and image URL of the node
    this._attr.nodeImageURL = opts.nodeImageURL;
    this._attr.nodeRef      = opts.nodeRef;
    this._attr.nodeTitle    = opts.nodeTitle;
    this._attr.nodeURL      = opts.nodeURL;
    this._attr.nodeSummary  = opts.nodeSummary;
    this._attr.offsetX      = opts.relativeWidthOffset;
    this._attr.offsetY      = opts.relativeHeightOffset;
    this._attr.anchorTargetX = opts.anchorTargetX;
    this._attr.anchorTargetY = opts.anchorTargetY;

    // Main channel
    this._attr.channel      = this.getChannelUrl();

    // We use the controller ID of the SendButton js controller
    // in order for the form controller to inform (via cross-frame Arbiter)
    // the SendButton js controller of events in the form (e.g. message sent).
    this._attr.controllerID = opts.controllerID;

    // Light or dark color scheme.
    this._attr.colorscheme  = opts.colorscheme;

    // If there was any error retrieving the node
    this._attr.error        = opts.error;

    // whether the flyout to appear to come out from the side or from above
    this._attr.siderender   = opts.siderender;

    // Determine if we should show extended social context on the widget
    this._attr.extended_social_context = opts.extended_social_context;
  }, {
  // Since this comment widget is rendered on its own
  // instead of having html injected into it,
  // there will be a very small delay. So in meantime, let's show a loader
  _showLoader: true,

  getUrlBits: function() {
    return { name: 'send_button_form_shell', params: this._attr };
  },

  oneTimeSetup: function() {
    this.subscribe('xd.messageSent',
                   FB.bind(this._onMessageSent, this));
  },

  _onMessageSent: function() {
    FB.Event.fire('message.send', this._attr.nodeURL, this);
  }
});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.xfbml.send
 * @layer xfbml
 * @requires fb.type
 *           fb.xfbml.edgewidget
 *           fb.xfbml.sendbuttonformwidget
 */

/**
 * Implementation for the fb:send tag.
 *
 * @class FB.XFBML.Send
 * @extends FB.XFBML.EdgeWidget
 * @private
 */
FB.subclass('XFBML.Send', 'XFBML.EdgeWidget', null, {
  /**
   * Do initial attribute processing.
   */
  setupAndValidate: function() {
    FB.Dom.addCss(this.dom, 'fb_edge_widget_with_comment');
    this._attr = {
      channel                 : this.getChannelUrl(),
      api_key                 : FB._apiKey,
      font                    : this.getAttribute('font'),
      colorscheme             : this.getAttribute('colorscheme', 'light'),
      href                    : this.getAttribute('href', window.location.href),
      ref                     : this.getAttribute('ref'),
      extended_social_context :
        this.getAttribute('extended_social_context', false)
    };

    this._rootPadding = {
      left: parseFloat(FB.Dom.getStyle(this.dom, 'paddingLeft')),
      top:  parseFloat(FB.Dom.getStyle(this.dom, 'paddingTop'))
    };

    return true;
  },

  /**
   * Get the URL bits for the iframe.
   *
   * @return {Object} the iframe URL bits
   */
  getUrlBits: function() {
    return { name: 'send', params: this._attr };
  },

  /**
   * Given a message from an xd comm event and the node where the edge comment
   * widget is to live in the dom, create an instance of
   * FB.XFBML.SendButtonFormWidget to be displayed right below the send button.
   *
   * @param {Object} message a dictionary of information about the xd comm event
   * @param {Object} comment_node the dom node where the edgecommentwidget
   *                 will live.
   * @return FB.XFBML.EdgeCommentWidget
   */
  _createEdgeCommentWidget: function(message, comment_node) {
    var opts = this._getCommonEdgeCommentWidgetOpts(message, comment_node);
    return new FB.XFBML.SendButtonFormWidget(opts);
  },

  /**
   * Get the initial size.
   *
   * @return {Object} the size
   */
  getSize: function() {
    return {
      width  : FB.XFBML.Send.Dimensions.width,
      height : FB.XFBML.Send.Dimensions.height
    };
  }
});

FB.provide('XFBML.Send', {
  Dimensions: {
    width: 80,
    height: 25
  }
});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.xfbml.like
 * @layer xfbml
 * @requires fb.type
 *           fb.xfbml.edgewidget
 *           fb.xfbml.send
 *           fb.intl
 */

/**
 * Implementation for fb:like tag.
 *
 * @class FB.XFBML.Like
 * @extends FB.XFBML.EdgeWidget
 * @private
 */
FB.subclass('XFBML.Like', 'XFBML.EdgeWidget', null, {

  /**
   * Like Plugin isn't actually widget-pipe enabled yet, though
   * in principle it can be by just switching this false to
   * true.
   */
  _widgetPipeEnabled: true,

  /**
   * Get the URL bits for the iframe.
   *
   * @return {Object} the iframe URL bits
   */
  getUrlBits: function() {
    return { name: 'like', params: this._attr };
  },

  /**
   * Given a message from an xd comm event and the node where the edge comment
   * widget is to live in the dom, create an instance of
   * FB.XFBML.EdgeCommentWidget to be displayed right below the button.
   *
   * @param {Object} message a dictionary of information about the xd comm event
   * @param {Object} comment_node the dom node where the edgecommentwidget
   *                 will live.
   * @return FB.XFBML.EdgeCommentWidget
   */
  _createEdgeCommentWidget: function(message, comment_node) {
    // the like widget is also responsible for the send button form if the user
    // decides to put a send button with the like widget (e.g. <fb:like
    // send="true"></fb:like>)
    if ('send' in this._attr && 'widget_type' in message &&
        message.widget_type == 'send') {
      var opts = this._getCommonEdgeCommentWidgetOpts(message,
                                                      comment_node);
      return new FB.XFBML.SendButtonFormWidget(opts);
    } else {
      return this._callBase("_createEdgeCommentWidget",
                            message,
                            comment_node);
    }
  },

  /**
   * Get the title attribute for the like plugin's iframe.
   *
   * @return {String} the title of the like plugin's iframe.
   */
  getIframeTitle: function() {
    return 'Like this content on Facebook.';
  }
});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.xfbml.likebox
 * @layer xfbml
 * @requires fb.type fb.xfbml.iframewidget
 */

/**
 * Implementation for fb:like-box tag.
 *
 * @class FB.XFBML.LikeBox
 * @extends FB.XFBML.IframeWidget
 * @private
 */
FB.subclass('XFBML.LikeBox', 'XFBML.EdgeWidget', null, {
  _visibleAfter: 'load',

  /**
   * Do initial attribute processing.
   */
  setupAndValidate: function() {
    this._attr = {
      channel     : this.getChannelUrl(),
      api_key     : FB._apiKey,
      connections : this.getAttribute('connections'),
      css         : this.getAttribute('css'),
      height      : this.getAttribute('height'),
      id          : this.getAttribute('profile-id'),
      header      : this._getBoolAttribute('header', true),
      name        : this.getAttribute('name'),
      show_faces  : this._getBoolAttribute('show-faces', true),
      stream      : this._getBoolAttribute('stream', true),
      width       : this._getPxAttribute('width', 300),
      href        : this.getAttribute('href'),
      colorscheme : this.getAttribute('colorscheme', 'light'),
      border_color: this.getAttribute('border_color')
    };

    if (this._getBoolAttribute('force_wall', false)) {
      this._attr.force_wall = true;
    }

    // also allow connections attr, if specified, to override
    // show_faces
    if (this._attr.connections === '0') {
      this._attr.show_faces = false;
    } else if (this._attr.connections) {
      this._attr.show_faces = true;
    }

    // "id" or "name" or "href" (for Open Graph) is required
    if (!this._attr.id && !this._attr.name && !this._attr.href) {
      FB.log('<fb:like-box> requires one of the "id" or "name" attributes.');
      return false;
    }

    var height = this._attr.height;
    if (!height) {
      if (!this._attr.show_faces &&
          !this._attr.stream) {
        height = 62;
      } else {
        height = 95;

        if (this._attr.show_faces) {
          height += 163;
        }

        if (this._attr.stream) {
          height += 300;
        }

        // add space for header
        if (this._attr.header &&
            this._attr.header !== '0') {
         height += 32;
        }
      }
    }

    this._attr.height = height;

    // listen for the XD 'likeboxLiked' and 'likeboxUnliked' events
    this.subscribe('xd.likeboxLiked', FB.bind(this._onLiked, this));
    this.subscribe('xd.likeboxUnliked', FB.bind(this._onUnliked, this));

    return true;
  },

  /**
   * Get the initial size.
   *
   * @return {Object} the size
   */
  getSize: function() {
    return { width: this._attr.width, height: this._attr.height };
  },

  /**
   * Get the URL bits for the iframe.
   *
   * @return {Object} the iframe URL bits
   */
  getUrlBits: function() {
    return { name: 'likebox', params: this._attr };
  },

  /**
   * Invoked when the user Likes the page via the Like button
   * in the likebox.
   */
  _onLiked: function() {
    FB.Helper.fireEvent('edge.create', this);
  },

  /**
   * Invoked when the user Unlikes the page via the Unlike button
   * in the likebox.
   */
  _onUnliked: function() {
    FB.Helper.fireEvent('edge.remove', this);
  }
});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.xfbml.livestream
 * @layer xfbml
 * @requires fb.type fb.xfbml.iframewidget
 */

/**
 * Implementation for fb:live-stream tag.
 *
 * @class FB.XFBML.LiveStream
 * @extends FB.XFBML.IframeWidget
 * @private
 */
FB.subclass('XFBML.LiveStream', 'XFBML.IframeWidget', null, {
  _visibleAfter: 'load',

  /**
   * Do initial attribute processing.
   */
  setupAndValidate: function() {
    this._attr = {
      app_id : this.getAttribute('event-app-id'),
      height : this._getPxAttribute('height', 500),
      hideFriendsTab : this.getAttribute('hide-friends-tab'),
      redesigned : this._getBoolAttribute('redesigned-stream'),
      width : this._getPxAttribute('width', 400),
      xid : this.getAttribute('xid', 'default'),
      always_post_to_friends : this._getBoolAttribute('always-post-to-friends'),
      via_url : this.getAttribute('via_url')
    };

    return true;
  },

  /**
   * Get the initial size.
   *
   * @return {Object} the size
   */
  getSize: function() {
    return { width: this._attr.width, height: this._attr.height };
  },

  /**
   * Get the URL bits for the iframe.
   *
   * @return {Object} the iframe URL bits
   */
  getUrlBits: function() {
    var name = this._attr.redesigned ? 'live_stream_box' : 'livefeed';
    if (this._getBoolAttribute('modern', false)) {
      name = 'live_stream';
    }
    return { name: name, params: this._attr };
  }
});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.xfbml.login
 * @layer xfbml
 * @requires fb.type fb.xfbml.iframewidget fb.xfbml.facepile fb.auth
 */

/**
 * Implementation for fb:login tag.
 *
 * @class FB.XFBML.Login
 * @extends FB.XFBML.IframeWidget
 * @private
 */
FB.subclass('XFBML.Login', 'XFBML.Facepile', null, {
  _visibleAfter: 'load',

  /**
   * Get the initial size.
   *
   * By default, shows one row of 6 profiles
   *
   * @return {Object} the size
   */
  getSize: function() {
    return { width: this._attr.width, height: 94 };
  },

  /**
   * Get the URL bits for the iframe.
   *
   * @return {Object} the iframe URL bits
   */
  getUrlBits: function() {
    return { name: 'login', params: this._attr };
  }
});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.xfbml.loginbutton
 * @layer xfbml
 * @requires fb.type
 *           fb.intl
 *           fb.xfbml.buttonelement
 *           fb.helper
 *           fb.auth
 */

/**
 * Implementation for fb:login-button tag.
 *
 * @class FB.XFBML.LoginButton
 * @extends  FB.XFBML.ButtonElement
 * @private
 */
FB.subclass('XFBML.LoginButton', 'XFBML.ButtonElement', null, {
  /**
   * Do initial attribute processing.
   *
   * @return {Boolean} true to continue processing, false to halt it
   */
  setupAndValidate: function() {
    // This method sometimes makes a callback that will call process() which
    // in-tern calls this method. Let's only setup once.
    if (this._alreadySetup) {
      return true;
    }

    this._alreadySetup = true;
    this._attr = {
      autologoutlink : this._getBoolAttribute('auto-logout-link'),
      length : this._getAttributeFromList(
        'length',         // name
        'short',          // defaultValue
        ['long', 'short'] // allowed
      ),
      onlogin : this.getAttribute('on-login'),
      perms : this.getAttribute('perms'),
      scope : this.getAttribute('scope'),
      registration_url : this.getAttribute('registration-url'),
      status : 'unknown'
    };

    // Change the displayed HTML whenever we know more about the auth status
    if (this._attr.autologoutlink) {
      FB.Event.subscribe('auth.statusChange', FB.bind(this.process, this));
    }

    if (this._attr.registration_url) {
      // The act of putting a registration-url means that unTOSed users will
      // be redirected to the registration widget instead of the TOS dialog.
      FB.Event.subscribe('auth.statusChange',
                         this._saveStatus(this.process, /* on_click */ false));
      // Change the displayed HTML immediately
      FB.getLoginStatus(this._saveStatus(this.process, /* on_click */ false));
    }

    return true;
  },

  /**
   * Should return the button markup. The default behaviour is to return the
   * original innerHTML of the element.
   *
   * @return {String} the HTML markup for the button
   */
  getButtonMarkup: function() {
    var originalHTML = this.getOriginalHTML();
    if (originalHTML) {
      return originalHTML;
    }
    if (!this._attr.registration_url) {
      // In the normal sense, it says "Logout" or "Login"
      if (FB.getAccessToken() && this._attr.autologoutlink) {
        return FB.Intl.tx._("Facebook Logout");
      } else if (FB.getAccessToken()) {
        // logged in already, don't render anything
        return '';
      } else {
        return this._getLoginText();
      }
    } else {
      // If there is a registration url it says "Logout", "Register" or "Login"
      switch (this._attr.status) {
        case 'unknown':
          return this._getLoginText();
        case 'notConnected':
        case 'not_authorized':
          return FB.Intl.tx._("Register");
        case 'connected':
          if (FB.getAccessToken() && this._attr.autologoutlink) {
            return FB.Intl.tx._("Facebook Logout");
          }
          // registered already, don't render anything
          return '';
        default:
          FB.log('Unknown status: ' + this._attr.status);
          return FB.Intl.tx._("Log In");
      }
    }
  },

  /**
   * Helper function to show "Login" or "Login with Facebook"
   */
  _getLoginText: function() {
    return this._attr.length == 'short'
      ? FB.Intl.tx._("Log In")
      : FB.Intl.tx._("Log In with Facebook");
  },

  /**
   * The ButtonElement base class will invoke this when the button is clicked.
   */
  onClick: function() {
    if (!this._attr.registration_url) {
      // In the normal case, this will either log you in, or log you out
      if (!FB.getAccessToken() || !this._attr.autologoutlink) {
        FB.login(FB.bind(this._authCallback, this), {
          perms: this._attr.perms,
          scope: this._attr.scope
        });
      } else {
        FB.logout(FB.bind(this._authCallback, this));
      }
    } else {
      // If there is a registration url, first log them into Facebook
      // and then send them to the registration url
      switch (this._attr.status) {
        case 'unknown':
          FB.ui({ method: 'auth.logintoFacebook' },
                FB.bind(function(response) {
                  // Fetch the status again and then redo the click
                  FB.bind(FB.getLoginStatus(
                    this._saveStatus(this._authCallback, /* on_click */ true),
                                     /* force */ true), this);
                }, this)
          );
          break;
        case 'notConnected':
        case 'not_authorized':
          window.top.location = this._attr.registration_url;
          break;
        case 'connected':
          if (!FB.getAccessToken() || !this._attr.autologoutlink) {
            // do nothing except call their callback
            this._authCallback();
          } else {
            FB.logout(FB.bind(this._authCallback, this));
          }
          break;
        default:
          FB.log('Unknown status: ' + this._attr.status);
      }
    }
  },

  /**
   * This will be invoked with the result of the FB.login() or FB.logout() to
   * pass the result to the developer specified callback if any.
   *
   * @param response {Object} the auth response object
   */
  _authCallback: function(response) {
    FB.Helper.invokeHandler(this._attr.onlogin, this, [response]);
  },

  /**
   * A shortcut to save the response status and handle FB.bind().
   *
   * @param cb {Function} callback
   * @param on_click {bool} whether this is an on click event
   */
  _saveStatus: function(cb, on_click) {
    return FB.bind(function(response) {
      if (on_click &&
          this._attr.registration_url &&
          (this._attr.status == 'notConnected' ||
           this._attr.status == 'not_authorized') &&
          (response.status == 'notConnected' ||
           response.status == 'not_authorized')) {
        // user clicked login and is now logged-in but not registered,
        // so redirect to registration uri
        window.top.location = this._attr.registration_url;
      }
      this._attr.status = response.status;
      if (cb) {
        cb = this.bind(cb, this);
        return cb(response);
      }
    }, this);
  }

});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.xfbml.name
 * @layer xfbml
 * @requires fb.type
 *           fb.xfbml
 *           fb.dom
 *           fb.xfbml.element
 *           fb.data
 *           fb.helper
 *           fb.string
 */

/**
 * @class FB.XFBML.Name
 * @extends  FB.XFBML.Element
 * @private
 */
FB.subclass('XFBML.Name', 'XFBML.Element', null, {
  /**
   * Processes this tag.
   */
  process: function() {
    FB.copy(this, {
      _uid           : this.getAttribute('uid'),
      _firstnameonly : this._getBoolAttribute('first-name-only'),
      _lastnameonly  : this._getBoolAttribute('last-name-only'),
      _possessive    : this._getBoolAttribute('possessive'),
      _reflexive     : this._getBoolAttribute('reflexive'),
      _objective     : this._getBoolAttribute('objective'),
      _linked        : this._getBoolAttribute('linked', true),
      _subjectId     : this.getAttribute('subject-id')
    });

    if (!this._uid) {
      FB.log('"uid" is a required attribute for <fb:name>');
      this.fire('render');
      return;
    }

    var fields = [];
    if (this._firstnameonly) {
      fields.push('first_name');
    } else if (this._lastnameonly) {
      fields.push('last_name');
    } else {
      fields.push('name');
    }

    if (this._subjectId) {
      fields.push('sex');

      if (this._subjectId == FB.Helper.getLoggedInUser()) {
        this._reflexive = true;
      }
    }

    var data;
    // Wait for status to be known
    FB.Event.monitor('auth.statusChange', this.bind(function() {
      // Is Element still in DOM tree?
      if (!this.isValid()) {
        this.fire('render');
        return true; // Stop processing
      }

      if (!this._uid || this._uid == 'loggedinuser') {
        this._uid = FB.Helper.getLoggedInUser();
      }

      if (!this._uid) {
        return; // dont do anything yet
      }

      if (FB.Helper.isUser(this._uid)) {
        data = FB.Data._selectByIndex(fields, 'user', 'uid', this._uid);
      } else {
        data = FB.Data._selectByIndex(['name', 'id'], 'profile', 'id',
                                      this._uid);
      }
      data.wait(this.bind(function(data) {
        if (this._subjectId == this._uid) {
          this._renderPronoun(data[0]);
        } else {
          this._renderOther(data[0]);
        }
        this.fire('render');
      }));
    }));
  },

  /**
   * Given this name, figure out the proper (English) pronoun for it.
   */
  _renderPronoun: function(userInfo) {
    var
      word = '',
      objective = this._objective;
    if (this._subjectId) {
      objective = true;
      if (this._subjectId === this._uid) {
        this._reflexive = true;
      }
    }
    if (this._uid == FB.Connect.get_loggedInUser() &&
        this._getBoolAttribute('use-you', true)) {
      if (this._possessive) {
        if (this._reflexive) {
          word = 'your own';
        } else {
          word = 'your';
        }
      } else {
        if (this._reflexive) {
          word = 'yourself';
        } else {
          word = 'you';
        }
      }
    }
    else {
      switch (userInfo.sex) {
        case 'male':
          if (this._possessive) {
            word = this._reflexive ? 'his own' : 'his';
          } else {
            if (this._reflexive) {
              word = 'himself';
            } else if (objective) {
              word = 'him';
            } else {
              word = 'he';
            }
          }
          break;
        case 'female':
          if (this._possessive) {
            word = this._reflexive ? 'her own' : 'her';
          } else {
            if (this._reflexive) {
              word = 'herself';
            } else if (objective) {
              word = 'her';
            } else {
              word = 'she';
            }
          }
          break;
        default:
          if (this._getBoolAttribute('use-they', true)) {
            if (this._possessive) {
              if (this._reflexive) {
                word = 'their own';
              } else {
                word = 'their';
              }
            } else {
              if (this._reflexive) {
                word = 'themselves';
              } else if (objective) {
                word = 'them';
              } else {
                word = 'they';
              }
            }
          }
          else {
            if (this._possessive) {
              if (this._reflexive) {
                word = 'his/her own';
              } else {
                word = 'his/her';
              }
            } else {
              if (this._reflexive) {
                word = 'himself/herself';
              } else if (objective) {
                word = 'him/her';
              } else {
                word = 'he/she';
              }
            }
          }
          break;
      }
    }
    if (this._getBoolAttribute('capitalize', false)) {
      word = FB.Helper.upperCaseFirstChar(word);
    }
    this.dom.innerHTML = word;
  },

  /**
   * Handle rendering of the element, using the
   * metadata that came with it.
   */
  _renderOther: function(userInfo) {
    var
      name = '',
      html = '';
    if (this._uid == FB.Helper.getLoggedInUser() &&
        this._getBoolAttribute('use-you', true)) {
      if (this._reflexive) {
        if (this._possessive) {
          name = 'your own';
        } else {
          name = 'yourself';
        }
      } else {
        //  The possessive works really nicely this way!
        if (this._possessive) {
          name = 'your';
        } else {
          name = 'you';
        }
      }
    }
    else if (userInfo) {
      //  FQLCantSee structures will show as null.
      if (null === userInfo.first_name) {
        userInfo.first_name = '';
      }
      if (null === userInfo.last_name) {
        userInfo.last_name = '';
      }
      // Structures that don't exist will return undefined
      // (ie. this could happen for an app)
      // In that case we just ignore firstnameonly and
      // lastnameonly
      if (this._firstnameonly && userInfo.first_name !== undefined) {
        name = FB.String.escapeHTML(userInfo.first_name);
      } else if (this._lastnameonly && userInfo.last_name !== undefined) {
        name = FB.String.escapeHTML(userInfo.last_name);
      }

      if (!name) {
        name = FB.String.escapeHTML(userInfo.name);
      }

      if (name !== '' && this._possessive) {
        name += '\'s';
      }
    }

    if (!name) {
      name = FB.String.escapeHTML(
        this.getAttribute('if-cant-see', 'Facebook User'));
    }
    if (name) {
      if (this._getBoolAttribute('capitalize', false)) {
        name = FB.Helper.upperCaseFirstChar(name);
      }
      if (userInfo && this._linked) {
        html = FB.Helper.getProfileLink(userInfo, name,
          this.getAttribute('href', null));
      } else {
        html = name;
      }
    }
    this.dom.innerHTML = html;
  }
});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.xfbml.profilepic
 * @layer xfbml
 * @requires fb.type
 *           fb.data
 *           fb.dom
 *           fb.helper
 *           fb.string
 *           fb.xfbml
 *           fb.xfbml.element
 */

/**
 * @class FB.XFBML.ProfilePic
 * @extends  FB.XFBML.Element
 * @private
 */
FB.subclass('XFBML.ProfilePic', 'XFBML.Element', null, {
  /**
   * Processes this tag.
   */
  process: function() {
    var
      size = this.getAttribute('size', 'thumb'),
      picFieldName = FB.XFBML.ProfilePic._sizeToPicFieldMap[size],
      width = this._getPxAttribute('width'),
      height = this._getPxAttribute('height'),
      style = this.dom.style,
      uid = this.getAttribute('uid');

    // Check if we need to add facebook logo image
    if (this._getBoolAttribute('facebook-logo')) {
      picFieldName += '_with_logo';
    }

    if (width) {
      width = width + 'px';
      style.width = width;
    }
    if (height) {
      height = height + 'px';
      style.height = height;
    }

    var renderFn = this.bind(function(result) {
      var
        userInfo = result ? result[0] : null,
        imgSrc = userInfo ? userInfo[picFieldName] : null;

      if (!imgSrc) {
        // Create default
        imgSrc = FB.getDomain('cdn') +
                 FB.XFBML.ProfilePic._defPicMap[picFieldName];
      }
      // Copy width, height style, and class name of fb:profile-pic down to the
      // image element we create
      var
        styleValue = (
          (width ? 'width:' + width + ';' : '') +
          (height ? 'height:' + width + ';' : '')
        ),
        html = FB.String.format(
          '<img src="{0}" alt="{1}" title="{1}" style="{2}" class="{3}" />',
          imgSrc,
          userInfo ? FB.String.escapeHTML(userInfo.name) : '',
          styleValue,
          this.dom.className
        );

      if (this._getBoolAttribute('linked', true)) {
        html = FB.Helper.getProfileLink(
          userInfo,
          html,
          this.getAttribute('href', null)
        );
      }
      this.dom.innerHTML = html;
      FB.Dom.addCss(this.dom, 'fb_profile_pic_rendered');
      this.fire('render');
    });

    // Wait for status to be known
    FB.Event.monitor('auth.statusChange', this.bind(function() {
      //Is Element still in DOM tree
      if (!this.isValid()) {
        this.fire('render');
        return true; // Stop processing
      }

      if (this.getAttribute('uid', null) == 'loggedinuser') {
        uid = FB.Helper.getLoggedInUser();
      }

      // Is status known?
      if (FB._userStatus && uid) {
        // Get data
        // Use profile if uid is a user, but a page
        FB.Data._selectByIndex(
          ['name', picFieldName],
          FB.Helper.isUser(uid) ? 'user' : 'profile',
          FB.Helper.isUser(uid) ? 'uid' : 'id',
          uid
        ).wait(renderFn);
      } else {
        // Render default
        renderFn();
      }
    }));
  }
});

FB.provide('XFBML.ProfilePic', {
  /**
   * Maps field type to placeholder/silhouette image.
   *
   * This dynamic data is replaced with rsrc.php backed URLs by Haste.
   */
  _defPicMap: {
    pic                  : 'pics/s_silhouette.jpg',
    pic_big              : 'pics/d_silhouette.gif',
    pic_big_with_logo    : 'pics/d_silhouette_logo.gif',
    pic_small            : 'pics/t_silhouette.jpg',
    pic_small_with_logo  : 'pics/t_silhouette_logo.gif',
    pic_square           : 'pics/q_silhouette.gif',
    pic_square_with_logo : 'pics/q_silhouette_logo.gif',
    pic_with_logo        : 'pics/s_silhouette_logo.gif'
  },

  /**
   * Maps user specified attribute for size to a field type.
   */
  _sizeToPicFieldMap: {
    n      : 'pic_big',
    normal : 'pic_big',
    q      : 'pic_square',
    s      : 'pic',
    small  : 'pic',
    square : 'pic_square',
    t      : 'pic_small',
    thumb  : 'pic_small'
  }
});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.xfbml.question
 * @layer xfbml
 * @requires fb.type
 *           fb.xfbml.iframewidget
 */

/**
 * Implementation for the fb:question tag.
 *
 * @class FB.XFBML.Question
 * @extends FB.XFBML.IframeWidget
 * @private
 */
FB.subclass('XFBML.Question', 'XFBML.IframeWidget', null, {
  _visibleAfter: 'load',
  setupAndValidate: function() {
    this._attr = {
      channel      : this.getChannelUrl(),
      api_key      : FB._apiKey,
      permalink    : this.getAttribute('permalink'),
      id           : this.getAttribute('id'),
      width        : this._getPxAttribute('width', 400),
      height       : 0,
      questiontext : this.getAttribute('questiontext'),
      options  : this.getAttribute('options')
    };

    this.subscribe('xd.firstVote', FB.bind(this._onInitialVote, this));
    this.subscribe('xd.vote', FB.bind(this._onChangedVote, this));
    return true;
  },

  getSize: function() {
    return { width: this._attr.width, height: this._attr.height };
  },

  getUrlBits: function() {
    return { name: 'question', params: this._attr };
  },

  /**
   * Invoked when the user initially votes on a question via the Question
   * Plugin.
   */
  _onInitialVote: function(message) {
    FB.Event.fire('question.firstVote', this._attr.permalink, message.vote);
  },

  /**
   * Invoked when the user changes their vote on a question via the
   * Question Plugin.
   */
  _onChangedVote: function(message) {
    FB.Event.fire('question.vote', this._attr.permalink, message.vote);
  }
});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.xfbml.recommendations
 * @layer xfbml
 * @requires fb.type fb.xfbml.iframewidget
 */

/**
 * Implementation for fb:recommendations tag.
 *
 * @class FB.XFBML.Recommendations
 * @extends FB.XFBML.IframeWidget
 * @private
 */
FB.subclass('XFBML.Recommendations', 'XFBML.IframeWidget', null, {
  _visibleAfter: 'load',

  /**
   * Refresh the iframe on auth.statusChange events.
   */
  _refreshOnAuthChange: true,

  /**
   * Do initial attribute processing.
   */
  setupAndValidate: function() {
    this._attr = {
      border_color : this.getAttribute('border-color'),
      colorscheme  : this.getAttribute('color-scheme'),
      filter       : this.getAttribute('filter'),
      font         : this.getAttribute('font'),
      action       : this.getAttribute('action'),
      linktarget   : this.getAttribute('linktarget', '_blank'),
      max_age      : this.getAttribute('max_age'),
      header       : this._getBoolAttribute('header'),
      height       : this._getPxAttribute('height', 300),
      site         : this.getAttribute('site', location.hostname),
      width        : this._getPxAttribute('width', 300)
    };

    return true;
  },

  /**
   * Get the initial size.
   *
   * @return {Object} the size
   */
  getSize: function() {
    return { width: this._attr.width, height: this._attr.height };
  },

  /**
   * Get the URL bits for the iframe.
   *
   * @return {Object} the iframe URL bits
   */
  getUrlBits: function() {
    return { name: 'recommendations', params: this._attr };
  }
});

/**
 * @provides fb.xfbml.recommendationsbar
 * @requires fb.anim
 *           fb.arbiter
 *           fb.type
 *           fb.xfbml.iframewidget
 * @css fb.css.plugin.recommendationsbar
 * @layer xfbml
 */

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Implementation for <fb:recommendations-bar /> social plugin tag.
 *
 * @class FB.XFBML.RecommendationsBar
 * @extends FB.XFBML.IframeWidget
 * @private
 */
FB.subclass(
  'XFBML.RecommendationsBar', 'XFBML.IframeWidget', null, {

    getUrlBits: function() {
      return { name: 'recommendations_bar', params: this._attr };
    },

    setupAndValidate: function() {

      function interval_queue(interval, func) {
        var last_run = 0;
        var queued = null;

        function run() {
          func();
          queued = null;
          last_run = (new Date()).getTime();
        }
        return function() { // First Class Functions <3
          if (!queued) {
            var now = (new Date()).getTime();
            if (now - last_run < interval) {
              queued = window.setTimeout(run, interval - (now - last_run));
            } else {
              run();
            }
          }
          return true;
        };
      }

      function validate_trigger(trigger) {
        if (trigger.match(/^\d+(?:\.\d+)?%$/)) {
          // clip to [0, 100]
          var percent = Math.min(Math.max(parseInt(trigger, 10), 0), 100);
          trigger = percent / 100;
        } else if (trigger != 'manual' && trigger != 'onvisible') {
          trigger = 'onvisible';
        }
        return trigger;
      }

      function validate_read_time(read_time) {
        return Math.max(parseInt(read_time, 10) || 30, 10);
      }

      function validate_side(side) {
        if (side == 'left' || side == 'right') { // Explicitly Provided
          return side;
        }
        return FB._localeIsRtl ? 'left' : 'right'; // Default Guess
      }

      this._attr = {
        channel      : this.getChannelUrl(),
        api_key      : FB._apiKey,
        font         : this.getAttribute('font'),
        colorscheme  : this.getAttribute('colorscheme'),
        href         : FB.URI.resolve(this.getAttribute('href')),
        side         : validate_side(this.getAttribute('side')),
        site         : this.getAttribute('site'),
        action       : this.getAttribute('action'),
        ref          : this.getAttribute('ref'),
        max_age      : this.getAttribute('max_age'),
        trigger      : validate_trigger(this.getAttribute('trigger', '')),
        read_time    : validate_read_time(this.getAttribute('read_time')),
        num_recommendations :
          parseInt(this.getAttribute('num_recommendations'), 10) || 2
      };

      // Right now this is used only to control the use of postMessage in
      // FB.Arbiter.  This is pretty hacky and should be done properly asap.
      FB._inPlugin = true;

      this._showLoader = false;

      this.subscribe(
        'iframe.onload',
        FB.bind(
          function() {
            var span = this.dom.children[0];
            span.className = 'fbpluginrecommendationsbar' + this._attr.side;
          },
          this));

      var action = FB.bind(
        function() {
          FB.Event.unlisten(window, 'scroll', action);
          FB.Event.unlisten(document.documentElement, 'click', action);
          FB.Event.unlisten(document.documentElement, 'mousemove', action);
          window.setTimeout(
            FB.bind(
              this.arbiterInform,
              this,
              'platform/plugins/recommendations_bar/action',
              null,
              FB.Arbiter.BEHAVIOR_STATE),
            this._attr.read_time * 1000); // convert s to ms
          return true;
        }, this);
      FB.Event.listen(window, 'scroll', action);
      FB.Event.listen(document.documentElement, 'click', action);
      FB.Event.listen(document.documentElement, 'mousemove', action);

      if (this._attr.trigger == "manual") {
        var manual = FB.bind(
          function(href) {
            if (href == this._attr.href) {
              FB.Event.unsubscribe('xfbml.recommendationsbar.read', manual);
              this.arbiterInform(
                'platform/plugins/recommendations_bar/trigger', null,
                FB.Arbiter.BEHAVIOR_STATE);
            }
            return true;
          }, this);
        FB.Event.subscribe('xfbml.recommendationsbar.read', manual);
      } else {
        var trigger = interval_queue(
          500,
          FB.bind(
            function() {
              if (this.calculateVisibility()) {
                FB.Event.unlisten(window, 'scroll', trigger);
                FB.Event.unlisten(window, 'resize', trigger);
                this.arbiterInform(
                  'platform/plugins/recommendations_bar/trigger', null,
                  FB.Arbiter.BEHAVIOR_STATE);
              }
              return true;
            }, this));
        FB.Event.listen(window, 'scroll', trigger);
        FB.Event.listen(window, 'resize', trigger);
        trigger(); // in case <fb:recommendations-bar /> is already visible
      }

      this.visible = false;
      var visible = interval_queue(
        500,
        FB.bind(
          function() {
            if (!this.visible && this.calculateVisibility()) {
              this.visible = true;
              this.arbiterInform(
                'platform/plugins/recommendations_bar/visible');
            } else if (this.visible && !this.calculateVisibility()) {
              this.visible = false;
              this.arbiterInform(
                'platform/plugins/recommendations_bar/invisible');
            }
            return true;
          }, this));
      FB.Event.listen(window, 'scroll', visible);
      FB.Event.listen(window, 'resize', visible);
      visible(); // in case <fb:recommendations-bar /> is already visible

      this.focused = true;
      var toggleFocused = FB.bind(
        function() {
          this.focused = !this.focused;
          return true;
        }, this);
      FB.Event.listen(window, 'blur', toggleFocused);
      FB.Event.listen(window, 'focus', toggleFocused);

      this.resize_running = false;
      this.animate = false;
      this.subscribe(
        'xd.signal_animation',
        FB.bind(function() { this.animate = true; }, this));

      return true;
    },

    getSize: function() {
      // The width here is in Chrome; Firefox is 2px smaller in both cases.
      return {
        height: 25, width: (this._attr.action == 'recommend' ? 140 : 96) };
    },

    calculateVisibility: function() {
      var fold = document.documentElement.clientHeight; // viewport height

      // In Firefox, switching tabs causes viewport scrolling and size changes
      // if Firebug is activated, so we avoid changing the visibility state when
      // the document is not in focus.  This has the unfortunate side effect of
      // disabling the read action if the user clicks in the plugin (e.g. to
      // expand the plugin or like the page) because these actions will transfer
      // focus from this document to the plugn.  So, we only perform this check
      // if firebug is running.
      if (!this.focused && window.console && window.console.firebug) {
        return this.visible;
      }

      switch (this._attr.trigger) {
        case "manual":
          return false;

        case "onvisible":
          // <fb:recommendations-bar /> position, relative to the viewport
          var elem = this.dom.getBoundingClientRect().top;
          return elem <= fold;

        default: // "80%", etc.
          var scroll = window.pageYOffset || document.body.scrollTop;
          var height = document.documentElement.scrollHeight; // doc height
          return (scroll + fold) / height >= this._attr.trigger;
      }
    },

    _handleResizeMsg: function(message) {
      if (!this.isValid()) {
        return;
      }

      if (message.width) {
        this.getIframeNode().style.width = message.width + 'px';
      }
      if (message.height) {
        this._setNextResize(message.height);
        this._checkNextResize();
      }

      this._makeVisible();
    },

    _setNextResize: function(height) {
      this.next_resize = height;
    },

    _checkNextResize: function() {
      if (!this.next_resize || this.resize_running) {
        return;
      }

      var iframe = this.getIframeNode();
      var height = this.next_resize;
      this.next_resize = null;


      if (this.animate) {
        this.animate = false; // the signal causes one resize to animate
        this.resize_running = true;
        FB.Anim.ate(
          iframe, { height: height + 'px' }, 330, FB.bind(
            function() {
              this.resize_running = false;
              this._checkNextResize();
            }, this));
      } else {
        iframe.style.height = height + 'px';
      }
    }

  });

/**
 * This is the functions that the 3rd party host site can call to manually
 * trigger the news.read action.  This will work only if the `trigger="manual"`
 * attribute is specified on the <fb:recommendations-bar /> tag.
 */
FB.XFBML.RecommendationsBar.markRead = function(href) {
  FB.Event.fire('xfbml.recommendationsbar.read', href || window.location.href);
};

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.xfbml.registration
 * @layer xfbml
 * @requires fb.arbiter
 *           fb.helper
 *           fb.json
 *           fb.type
 *           fb.xfbml.iframewidget
 *           fb.prelude
 *           fb.event
 */

/**
 * Implementation for fb:registration tag.
 *
 * @class FB.XFBML.Registration
 * @extends FB.XFBML.IframeWidget
 * @private
 */
FB.subclass('XFBML.Registration', 'XFBML.IframeWidget', null, {
  _visibleAfter: 'immediate',

  /** Constants for guessing the height **/
  // Logged out is 139 and logged in is 167, so lets make it nice
  // for logged in people
  _baseHeight: 167,
  // How much taller does adding 1 field make the plugin
  _fieldHeight: 28,

  // Widths below this make the widget render with labels above the fields
  _skinnyWidth: 520,
  // This one is tough since the text wraps so much, but this is assuming
  // 2 lines of text on the top, and 3 lines on the bottom
  _skinnyBaseHeight: 173,
  // Assuming the labels are above, adding a field height
  _skinnyFieldHeight: 52,

  /**
   * Do initial attribute processing.
   */
  setupAndValidate: function() {
    this._attr = {
      action       : this.getAttribute('action'),
      border_color : this.getAttribute('border-color'),
      channel_url  : this.getChannelUrl(),
      client_id    : FB._apiKey,
      fb_only      : this._getBoolAttribute('fb-only', false),
      fb_register  : this._getBoolAttribute('fb-register', false),
      fields       : this.getAttribute('fields'),
      height       : this._getPxAttribute('height'),
      redirect_uri : this.getAttribute('redirect-uri', window.location.href),
      no_footer    : this._getBoolAttribute('no-footer'),
      no_header    : this._getBoolAttribute('no-header'),
      onvalidate   : this.getAttribute('onvalidate'),
      width        : this._getPxAttribute('width', 600),
      target       : this.getAttribute('target')
    };
    // All errors will be handled in the iframe, and they show more obvious
    // messages than FB.log

    if (this._attr.onvalidate) {
      this.subscribe('xd.validate', this.bind(function(message) {
        var value = FB.JSON.parse(message.value);
        var callback = this.bind(function(errors) {
          // Send the message back to facebook
          FB.Arbiter.inform('Registration.Validation',
                            {errors: errors, id: message.id},
                            'parent.frames["' +
                            this.getIframeNode().name +
                            '"]',
                            this._attr.channel_url.substring(0, 5) == "https");
        });

        // Call their function
        var response = FB.Helper.executeFunctionByName(this._attr.onvalidate,
                                                       value, callback);

        // If they returned anything, call the callback
        if (response) {
          callback(response);
        }
      }));
    }

    this.subscribe('xd.authLogin', FB.bind(this._onAuthLogin, this));
    this.subscribe('xd.authLogout', FB.bind(this._onAuthLogout, this));

    return true;
  },

  /**
   * Get the initial size.
   *
   * @return {Object} the size
   */
  getSize: function() {
    return { width: this._attr.width, height: this._getHeight() };
  },

  _getHeight: function() {
    if (this._attr.height) {
      return this._attr.height;
    }
    var fields;
    if (!this._attr.fields) {
      // by default, only the name field
      fields = ['name'];
    } else {
      try {
        // JSON
        fields = FB.JSON.parse(this._attr.fields);
      } catch (e) {
        // CSV
        fields = this._attr.fields.split(/,/);
      }
    }

    if (this._attr.width < this._skinnyWidth) {
      return this._skinnyBaseHeight + fields.length * this._skinnyFieldHeight;
    } else {
      return this._baseHeight + fields.length * this._fieldHeight;
    }
  },

  /**
   * Get the URL bits for the iframe.
   *
   * @return {Object} the iframe URL bits
   */
  getUrlBits: function() {
    return { name: 'registration', params: this._attr };
  },

  /**
   * Returns the default domain that should be used for the
   * registration plugin being served from the web tier.  Because
   * of the complexities involved in serving up the registration
   * plugin for logged out and logged in HTTPS users, and because
   * a near-majority of registration plugins are rendered for logged out
   * users, we just always load the registration plugin over https.
   * Of particular note, redirects from HTTP to HTTPS for logged-in
   * users with account security on cause configuration data to be lost
   * because the large amount of configuration data must be sent via POST
   * instead of GET because of GET limits.
   */
  getDefaultWebDomain: function() {
    return 'https_www';
  },

  /**
   * Invoked when the user logs in
   */
  _onAuthLogin: function() {
    if (!FB.getAuthResponse()) {
      FB.getLoginStatus();
    }
    FB.Helper.fireEvent('auth.login', this);
  },

  /**
   * Invoked when the user logs out
   */
  _onAuthLogout: function() {
    if (!FB.getAuthResponse()) {
      FB.getLoginStatus();
    }
    FB.Helper.fireEvent('auth.logout', this);
  }

});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.xfbml.serverfbml
 * @layer xfbml
 * @requires fb.type fb.content fb.xfbml.iframewidget fb.auth
 */

/**
 * Implementation for fb:serverfbml tag.
 *
 * @class FB.XFBML.ServerFbml
 * @extends FB.XFBML.IframeWidget
 * @private
 */
FB.subclass('XFBML.ServerFbml', 'XFBML.IframeWidget', null, {
  /**
   * Make the iframe visible only when we get the initial resize message.
   */
  _visibleAfter: 'resize',

  /**
   * Do initial attribute processing.
   */
  setupAndValidate: function() {
    // query parameters to the comments iframe
    this._attr = {
      channel_url : this.getChannelUrl(),
      fbml        : this.getAttribute('fbml'),
      width       : this._getPxAttribute('width')
    };

    // fbml may also be specified as a child script tag
    if (!this._attr.fbml) {
      var child = this.dom.getElementsByTagName('script')[0];
      if (child && child.type === 'text/fbml') {
        this._attr.fbml = child.innerHTML;
      }
    }

    // if still no fbml, error
    if (!this._attr.fbml) {
      FB.log('<fb:serverfbml> requires the "fbml" attribute.');
      return false;
    }

    return true;
  },

  /**
   * Get the initial size.
   *
   * @return {Object} the size
   */
  getSize: function() {
    return { width: this._attr.width, height: this._attr.height };
  },

  /**
   * Get the URL bits for the iframe.
   *
   * @return {Object} the iframe URL bits
   */
  getUrlBits: function() {
    return { name: 'serverfbml', params: this._attr };
  }
});

/**
 * @provides fb.xfbml.sharebutton
 * @requires fb.data
 *           fb.dom
 *           fb.helper
 *           fb.intl
 *           fb.string
 *           fb.type
 *           fb.ui
 *           fb.xfbml
 *           fb.xfbml.element
 * @css fb.css.sharebutton
 * @layer xfbml
 */

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Implementation for fb:share-button tag.
 * @class FB.XFBML.ShareButton
 * @extends  FB.XFBML.Element
 * @private
 */
FB.subclass('XFBML.ShareButton', 'XFBML.Element', null, {
  /**
   * Processes this tag.
   */
  process: function() {
    this._href = this.getAttribute('href', window.location.href);

    //TODO: When we turn sharepro on, replace icon_link with button_count
    this._type = this.getAttribute('type', 'icon_link');

    FB.Dom.addCss(this.dom, 'fb_share_count_hidden'); // start off assuming 0
    this._renderButton(true);
  },

  /**
   * Render's the button.
   *
   * @access private
   * @param skipRenderEvent {Boolean} indicate if firing of the render event
   * should be skipped. This is useful because the _renderButton() function may
   * recursively call itself to do the final render, which is when we want to
   * fire the render event.
   */
  _renderButton: function(skipRenderEvent) {
    if (!this.isValid()) {
      this.fire('render');
      return;
    }

    var
      contentStr = '',
      post = '',
      pre = '',
      classStr = '',
      share = FB.Intl.tx._("Share"),
      wrapperClass = '';

    switch (this._type) {
    case 'icon':
    case 'icon_link':
      classStr = 'fb_button_simple';
      contentStr = (
        '<span class="fb_button_text">' +
          (this._type == 'icon_link' ? share : '&nbsp;') +
        '</span>'
      );
      skipRenderEvent = false;
      break;
    case 'link':
      contentStr = FB.Intl.tx._("Share on Facebook");
      skipRenderEvent = false;
      break;
    case 'button':
      contentStr = '<span class="fb_button_text">' + share +  '</span>';
      classStr = 'fb_button fb_button_small';
      skipRenderEvent = false;
      break;
    case 'button_count':
      contentStr = '<span class="fb_button_text">' + share +  '</span>';
      post = (
        '<span class="fb_share_count_nub_right">&nbsp;</span>' +
        '<span class="fb_share_count fb_share_count_right">'+
          this._getCounterMarkup() +
        '</span>'
      );
      classStr = 'fb_button fb_button_small';
      break;
    default:
      // box count
      contentStr = '<span class="fb_button_text">' + share +  '</span>';
      pre = (
        '<span class="fb_share_count_nub_top">&nbsp;</span>' +
        '<span class="fb_share_count fb_share_count_top">' +
          this._getCounterMarkup() +
        '</span>'
      );
      classStr = 'fb_button fb_button_small';
      wrapperClass = 'fb_share_count_wrapper';
    }

    var a_id = FB.guid();

    this.dom.innerHTML = FB.String.format(
      '<span class="{0}">{4}<a id="{1}" class="{2}" ' +
      'target="_blank">{3}</a>{5}</span>',
      wrapperClass,
      a_id,
      classStr,
      contentStr,
      pre,
      post
    );

    var a = document.getElementById(a_id);
    a.href = this._href;
    a.onclick = function() {
      FB.ui({ method: 'stream.share', u: this.href});
      return false;
    };

    if (!skipRenderEvent) {
      this.fire('render');
    }
  },

  _getCounterMarkup: function() {
    if (!this._count) {
      this._count = FB.Data._selectByIndex(
        ['total_count'],
        'link_stat',
        'url',
        this._href
      );
    }

    var prettyCount = '0';
    if (this._count.value !== undefined) {
      if (this._count.value.length > 0) {
        var c = this._count.value[0].total_count;
        if (c > 3) {
          // now we want it to be visible
          FB.Dom.removeCss(this.dom, 'fb_share_count_hidden');
          prettyCount = c >= 10000000 ? Math.round(c/1000000) + 'M' :
                        (c >= 10000 ? Math.round(c/1000) + 'K' : c);
        }
      }
    } else {
      this._count.wait(FB.bind(this._renderButton, this, false));
    }

    return '<span class="fb_share_count_inner">' + prettyCount + '</span>';
  }
});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.xfbml.socialcontext
 * @layer xfbml
 * @requires fb.type fb.xfbml.iframewidget fb.xfbml.facepile fb.auth
 */

/**
 * Implementation for fb:social-context tag.
 *
 * @class FB.XFBML.SocialContext
 * @extends FB.XFBML.IframeWidget
 * @private
 */
FB.subclass('XFBML.SocialContext', 'XFBML.IframeWidget', null, {
  /**
   * Do initial attribute processing.
   */
  setupAndValidate: function() {
    var size = this.getAttribute('size', 'small');
    this._attr = {
      channel: this.getChannelUrl(),
      width: this._getPxAttribute('width', 400),
      height: this._getPxAttribute('height', 100),
      ref: this.getAttribute('ref'),
      size: this.getAttribute('size'),
      keywords: this.getAttribute('keywords'),
      urls: this.getAttribute('urls')
    };

    return true;
  },

  /**
   * Get the initial size.
   *
   * @return {Object} the size
   */
  getSize: function() {
    return { width: this._attr.width, height: this._attr.height };
  },

  /**
   * Get the URL bits for the iframe.
   *
   * @return {Object} the iframe URL bits
   */
  getUrlBits: function() {
    return { name: 'social_context', params: this._attr };
  }
});

/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.xfbml.subscribe
 * @layer xfbml
 * @requires fb.type
 *           fb.xfbml.edgewidget
 */

/**
 * Implementation for the fb:subscribe tag.
 *
 * @class FB.XFBML.Subscribe
 * @extends FB.XFBML.EdgeWidget
 * @private
 */
FB.subclass('XFBML.Subscribe', 'XFBML.EdgeWidget', null, {
  /**
   * Do initial attribute processing.
   */
  setupAndValidate: function() {
    this._attr = {
      channel                 : this.getChannelUrl(),
      api_key                 : FB._apiKey,
      font                    : this.getAttribute('font'),
      colorscheme             : this.getAttribute('colorscheme', 'light'),
      href                    : this.getAttribute('href'),
      ref                     : this.getAttribute('ref'),
      layout                  : this._getLayout(),
      show_faces              : this._shouldShowFaces(),
      width                   : this._getWidgetWidth()
    };
    return true;
  },

  /**
   * Get the URL bits for the iframe.
   *
   * @return {Object} the iframe URL bits
   */
  getUrlBits: function() {
    return { name: 'subscribe', params: this._attr };
  },

  /**
   * Returns the width of the widget iframe, taking into
   * account the chosen layout, the user supplied width, and
   * the min and max values we'll allow.  There is much more
   * flexibility in how wide the widget is, so a user-supplied
   * width just needs to fall within a certain range.
   *
   * @return {String} the CSS-legitimate width in pixels, as
   *         with '460px'.
   */
  _getWidgetWidth : function() {
    var layout = this._getLayout();
    var layoutToDefaultWidthMap = {
        'standard': 450,
        'box_count': 83,
        'button_count': 115
    };
    var defaultWidth = layoutToDefaultWidthMap[layout];
    var width = this._getPxAttribute('width', defaultWidth);

    var allowedWidths = {
        'standard': {'min': 225, 'max': 900},
        'box_count': {'min': 43, 'max': 900},
        'button_count': {'min': 63, 'max': 900}
    };
    if (width < allowedWidths[layout].min) {
      width = allowedWidths[layout].min;
    } else if (width > allowedWidths[layout].max) {
      width = allowedWidths[layout].max;
    }

    return width;
  }
});

/**
 * A meta component which requires everything.
 *
 * @nolint
 * @provides fb.all
 * @requires
 *   fb.api
 *   fb.auth
 *   fb.canvas
 *   fb.canvas.insights
 *   fb.canvas.prefetcher
 *   fb.compat.ui
 *   fb.compat.xfbml
 *   fb.data
 *   fb.frictionless
 *   fb.init
 *   fb.init.helper
 *   fb.nativecalls
 *   fb.pay
 *   fb.template_data
 *   fb.template_ui
 *   fb.ui.methods
 *   fb.uri
 *   fb.xfbml.activity
 *   fb.xfbml.addprofiletab
 *   fb.xfbml.addtotimeline
 *   fb.xfbml.bookmark
 *   fb.xfbml.comments
 *   fb.xfbml.commentscount
 *   fb.xfbml.connectbar
 *   fb.xfbml.element
 *   fb.xfbml.facepile
 *   fb.xfbml.fan
 *   fb.xfbml.friendpile
 *   fb.xfbml.like
 *   fb.xfbml.likebox
 *   fb.xfbml.livestream
 *   fb.xfbml.login
 *   fb.xfbml.loginbutton
 *   fb.xfbml.name
 *   fb.xfbml.profilepic
 *   fb.xfbml.question
 *   fb.xfbml.recommendations
 *   fb.xfbml.recommendationsbar
 *   fb.xfbml.registration
 *   fb.xfbml.send
 *   fb.xfbml.serverfbml
 *   fb.xfbml.sharebutton
 *   fb.xfbml.socialcontext
 *   fb.xfbml.subscribe
 */

void(0);



//FB.provide("", {"_domain":{"api":"https:\/\/api.facebook.com\/","api_read":"https:\/\/api-read.facebook.com\/","cdn":"https:\/\/s-static.facebook.com\/","cdn_foreign":"https:\/\/s-static.facebook.com\/","graph":"https:\/\/graph.facebook.com\/","https_cdn":"https:\/\/s-static.facebook.com\/","https_staticfb":"https:\/\/www.facebook.com\/","https_www":"https:\/\/www.facebook.com\/","staticfb":"http:\/\/www.facebook.com\/","www":"https:\/\/www.facebook.com\/","m":"https:\/\/m.facebook.com\/","https_m":"https:\/\/m.facebook.com\/"},"_locale":"en_US","_localeIsRtl":false}, true);
//FB.provide("Flash", {"_minVersions":[[10,3,181,34],[11,0,0]],"_swfPath":"rsrc.php\/v1\/yQ\/r\/f3KaqM7xIBg.swf"}, true);
//FB.provide("XD", {"_xdProxyUrl":"connect\/xd_proxy.php?version=3"}, true);
//FB.provide("Arbiter", {"_canvasProxyUrl":"connect\/canvas_proxy.php?version=3"}, true);
//FB.provide('Auth', {"_xdStorePath":"xd_localstorage\/v2"}, true);
//FB.provide("Canvas.Prefetcher", {"_appIdsBlacklist":[144959615576466],"_sampleRate":500}, true);
//FB.initSitevars = {"parseXFBMLBeforeDomReady":false,"computeContentSizeVersion":0,"enableMobile":1,"enableMobileComments":1,"forceSecureXdProxy":1,"iframePermissions":{"read_stream":false,"manage_mailbox":false,"manage_friendlists":false,"read_mailbox":false,"publish_checkins":true,"status_update":true,"photo_upload":true,"video_upload":true,"sms":false,"create_event":true,"rsvp_event":true,"offline_access":true,"email":true,"xmpp_login":false,"create_note":true,"share_item":true,"export_stream":false,"publish_stream":true,"publish_likes":true,"ads_management":false,"contact_email":true,"access_private_data":false,"read_insights":false,"read_requests":false,"read_friendlists":true,"manage_pages":false,"physical_login":false,"manage_groups":false,"read_deals":false}}; FB.forceOAuth = true; FB.widgetPipeEnabledApps = {"111476658864976":1,"cca6477272fc5cb805f85a84f20fca1d":1,"179150165472010":1}; FB.widgetPipeTagCountThreshold = 4;
//FB.provide("TemplateData", {"_enabled":true}, true);
//FB.provide("TemplateUI", {"_version":19}, true);
//FB.provide("XFBML.ConnectBar", {"imgs":{"buttonUrl":"rsrc.php\/v1\/yY\/r\/h_Y6u1wrZPW.png","missingProfileUrl":"rsrc.php\/v1\/yo\/r\/UlIqmHJn-SK.gif"}}, true);
//FB.provide("XFBML.ProfilePic", {"_defPicMap":{"pic":"rsrc.php\/v1\/yh\/r\/C5yt7Cqf3zU.jpg","pic_big":"rsrc.php\/v1\/yL\/r\/HsTZSDw4avx.gif","pic_big_with_logo":"rsrc.php\/v1\/y5\/r\/SRDCaeCL7hM.gif","pic_small":"rsrc.php\/v1\/yi\/r\/odA9sNLrE86.jpg","pic_small_with_logo":"rsrc.php\/v1\/yD\/r\/k1xiRXKnlGd.gif","pic_square":"rsrc.php\/v1\/yo\/r\/UlIqmHJn-SK.gif","pic_square_with_logo":"rsrc.php\/v1\/yX\/r\/9dYJBPDHXwZ.gif","pic_with_logo":"rsrc.php\/v1\/yu\/r\/fPPR9f2FJ3t.gif"}}, true);