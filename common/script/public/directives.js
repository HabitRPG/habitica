'use strict';

/**
 * Markdown
 * See http://www.heikura.me/#!/angularjs-markdown-directive
 */
(function(){
  var md = function () {
    var remarkable = new Remarkable({
      // TODO: Add in code highlighting?
      // highlight: function (#<{(|str, lang|)}>#) { return ''; }
      linkify: true
    });

    emoji.img_path = 'common/img/emoji/unicode/';

    var toHtml = function (markdown) {
      if (markdown == undefined)
        return '';

      markdown = remarkable.render(markdown);
      markdown = emoji.replace_colons(markdown);
      markdown = emoji.replace_unified(markdown);

      return markdown;
    };

    // This was applie to marked, the old markdown library which has an xss exploit.
    // If we want this behavior again, we'll need to rewrite it.
    // ---
    // [nickgordon20131123] this hacky override wraps images with a link to the image in a new window, and also adds some classes in case we want to style
    // marked.InlineLexer.prototype.outputLink = function(cap, link) {
    //   var escape = function(html, encode) {
    //     return html
    //       .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    //       .replace(/</g, '&lt;')
    //       .replace(/>/g, '&gt;')
    //       .replace(/"/g, '&quot;')
    //       .replace(/'/g, '&#39;');
    //   };
    //   if (cap[0].charAt(0) !== '!') {
    //     return '<a class="markdown-link" target="_blank" href="'
    //       + escape(link.href)
    //       + '"'
    //       + (link.title
    //       ? ' title="'
    //       + escape(link.title)
    //       + '"'
    //       : '')
    //       + '>'
    //       + this.output(cap[1])
    //       + '</a>';
    //   } else {
    //     return '<a class="markdown-img-link" target="_blank" href="'
    //       + escape(link.href)
    //       + '"'
    //       + (link.title
    //       ? ' title="'
    //       + escape(link.title)
    //       + '"'
    //       : '')
    //       + '><img class="markdown-img" src="'
    //       + escape(link.href)
    //       + '" alt="'
    //       + escape(cap[1])
    //       + '"'
    //       + (link.title
    //       ? ' title="'
    //       + escape(link.title)
    //       + '"'
    //       : '')
    //       + '></a>';
    //   }
    // }

    //hljs.tabReplace = '    ';

    return {
      toHtml:toHtml
    };
  }();

  habitrpg.directive('markdown', ['$timeout','MOBILE_APP', function($timeout, MOBILE_APP) {
    return {
      restrict: 'E',
      link: function(scope, element, attrs) {
        var removeWatch = !!scope.$eval(attrs.removeWatch);
        var useTimeout = !!scope.$eval(attrs.useTimeout);
        var timeoutTime = scope.$eval(attrs.timeoutTime) || 0;

        var doRemoveWatch = scope.$watch(attrs.text, function(value, oldValue) {
          var replaceMarkdown = function(){

            var markdown = value;
            var linktarget = attrs.target || '_self';
            var userName = scope.User.user.profile.name;
            var userHighlight = "@"+userName;
            var html = md.toHtml(markdown);

            html = html.replace(userHighlight, "<u>@"+userName+"</u>");

            html = html.replace(' href',' target="'+linktarget+'" href');
            element.html(html);

            if(MOBILE_APP) {
              var elements = element.find("a");
              _.forEach(elements, function(link){
                if(link.href) {

                  link.onclick = function (e) {
                    scope.externalLink(this.href);

                    e.preventDefault();
                    e.stopPropagation();
                  };
                }
              });
            }

            if(removeWatch)
            {
              doRemoveWatch();
            }
          };

          if(useTimeout)
          {
            $timeout(replaceMarkdown, timeoutTime);
          }
          else
          {
            replaceMarkdown();
          }
        });
      }
    };
  }]);

  habitrpg.filter('markdown', function() {
    return function(input){
      var html = md.toHtml(input);

      html = html.replace(' href',' target="_blank" href');

      return html;
    };
  });
})()

habitrpg.directive('questRewards', ['$rootScope', function($rootScope){
  return {
    restrict: 'AE',
    templateUrl: 'partials/options.social.party.quest-rewards.html',
    link: function(scope, element, attrs){
      scope.header = attrs.header || 'Rewards';
      scope.quest = $rootScope.Content.quests[attrs.key];
    }
  }
}]);
