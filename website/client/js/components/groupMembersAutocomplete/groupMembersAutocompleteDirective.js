'use strict';

(function(){
  angular
    .module('habitrpg')
    .directive('groupMembersAutocomplete', groupMembersAutocomplete);

  groupMembersAutocomplete.$inject = [
    '$parse',
  ];

  function groupMembersAutocomplete($parse) {

    return {
      // scope: true,
      templateUrl: 'partials/groups.members.autocomplete.html',
      compile: function (element, attrs) {
        var modelAccessor = $parse(attrs.ngModel);

        return function (scope, element, attrs, controller) {
          var taggle = new Taggle('taggle');
          var container = taggle.getContainer();
          var input = taggle.getInput();

          var availableTags = _.pluck(scope.obj.members, 'profile.name');

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
