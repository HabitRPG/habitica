'use strict';

/**
 * Markdown
 */
(function(){
  var md = function () {
    var mdown = window.habiticaMarkdown;

    var toHtml = function (markdown) {
      if (markdown == undefined)
        return '';

      markdown = mdown.render(markdown);

      return markdown;
    };

    return {
      toHtml:toHtml
    };
  }();

  habitrpg.directive('markdown', ['$timeout', 'User', function($timeout, User) {
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
            var userName = User.user.profile.name;
            var userHighlight = "@"+userName;
            var html = md.toHtml(markdown);

            html = html.replace(userHighlight, "<u>@"+userName+"</u>");

            element.html(html);

            if (removeWatch) {
              doRemoveWatch();
            }
          };

          if(useTimeout) {
            $timeout(replaceMarkdown, timeoutTime);
          } else {
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
      scope.headerParticipant = attrs.headerParticipant || env.t('rewardsAllParticipants');
      scope.headerQuestOwner = attrs.headerQuestOwner || env.t('rewardsQuestOwner');
      scope.quest = $rootScope.Content.quests[attrs.key];
    }
  }
}]);
