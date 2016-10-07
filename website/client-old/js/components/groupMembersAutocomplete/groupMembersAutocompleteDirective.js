'use strict';

(function(){
  angular
    .module('habitrpg')
    .directive('groupMembersAutocomplete', groupMembersAutocomplete);

  groupMembersAutocomplete.$inject = [
    '$parse',
    '$rootScope',
  ];

  function groupMembersAutocomplete($parse, $rootScope) {

    return {
      templateUrl: 'partials/groups.members.autocomplete.html',
      compile: function (element, attrs) {
        var modelAccessor = $parse(attrs.ngModel);

        return function (scope, element, attrs, controller) {
          var availableTags = _.pluck(scope.group.members, 'profile.name');
          var memberProfileNameToIdMap = _.object(_.map(scope.group.members, function(item) {
             return [item.profile.name, item.id]
          }));
          var memberIdToProfileNameMap = _.object(_.map(scope.group.members, function(item) {
             return [item.id, item.profile.name]
          }));

          var currentTags = [];
          _.each(scope.task.group.assignedUsers, function(userId) { currentTags.push(memberIdToProfileNameMap[userId]) })

          var taggle = new Taggle('taggle', {
            tags: currentTags,
            allowedTags: currentTags,
            allowDuplicates: false,
            onBeforeTagAdd: function(event, tag) {
              return confirm(window.env.t('confirmAddTag', {tag: tag}));
            },
            onTagAdd: function(event, tag) {
              $rootScope.$broadcast('addedGroupMember', memberProfileNameToIdMap[tag]);
            },
            onBeforeTagRemove: function(event, tag) {
              return confirm(window.env.t('confirmRemoveTag', {tag: tag}))
            },
            onTagRemove: function(event, tag) {
              $rootScope.$broadcast('removedGroupMember', memberProfileNameToIdMap[tag]);
            }
          });
          var container = taggle.getContainer();
          var input = taggle.getInput();

          $(input).autocomplete({
              source: availableTags, // See jQuery UI documentaton for options
              appendTo: container,
              position: { at: "left bottom", of: container },
              select: function(event, data) {
                  event.preventDefault();
                  //Add the tag if user clicks
                  if (event.which === 1) {
                      taggle.add(data.item.value);
                      var taggleTags = taggle.getTags();
                      scope.$apply(function (scope) {
                         // Change bound variable
                         modelAccessor.assign(scope, taggleTags.values);
                      });
                  }
              }
          });
        };
      },
    };
  }
}());
