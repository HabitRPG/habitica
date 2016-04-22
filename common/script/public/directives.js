'use strict';

/**
 * Markdown
 * See http://www.heikura.me/#!/angularjs-markdown-directive
 */
(function(){
  var md = function () {
    var mdown = window.habiticaMarkdown;

    emoji.img_path = 'common/img/emoji/unicode/';

    var toHtml = function (markdown) {
      if (markdown == undefined)
        return '';

      markdown = mdown.render(markdown);
      markdown = emoji.replace_colons(markdown);
      markdown = emoji.replace_unified(markdown);

      return markdown;
    };

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
