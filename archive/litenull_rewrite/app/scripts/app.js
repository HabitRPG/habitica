'use strict';

/**
 * The main HabitRPG app module.
 *
 * @type {angular.Module}
 */

var habitrpg = angular.module('habitrpg', ['userServices', 'sharedServices', 'authServices', 'notificationServices', 'hmTouchEvents'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/home', {templateUrl: 'views/home.html'})
            .when('/login', {templateUrl: 'views/login.html'})
            .when('/settings', {templateUrl: 'views/settings.html'})
            .when('/profile', {templateUrl: 'views/profile.html'})
            .when('/options', {templateUrl: 'views/options.html'})
            .when('/:action', {templateUrl: 'views/list.html'})
            .when('/tasks/:taskId', {templateUrl: 'views/details.html'})
            .when('/todo/active', {templateUrl: 'views/list.html'})
            .when('/todo/completed', {templateUrl: 'views/list.html'})
            .otherwise({redirectTo: '/habit'});
    }])
    .config(['$compileProvider', function ($compileProvider) {
        $compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
    }]);


// Touch directive, binding to touchstart as to not wait for 300ms

habitrpg.directive('gfTap', ["$location", "$parse", function ($location, $parse) {
    return function (scope, element, attrs) {
        var tapping = false;
        element.bind('touchstart', function () {
            tapping = true;
        });

        element.bind('touchmove', function () {
            tapping = false
        });

        element.bind('touchend', function (event) {
            if (tapping) {
                var fn = $parse(attrs['gfTap']);

                if (attrs['href']) {
                    var location = attrs['href'].replace('#', '/');
                    $location.path(location);
                }

                scope.$apply(function () {
                    fn(scope, {$event: event})
                });
            }
        });

    };
}]);

habitrpg.directive('sort', function (User) {
    return function ($scope, element, attrs, ngModel) {
        $(element).sortable({
            axis: "y",
            start: function (event, ui) {
                ui.item.data('startIndex', ui.item.index());
            },
            stop: function (event, ui) {
                var taskType = angular.element(ui.item[0]).scope().task.type + 's'
                var startIndex = ui.item.data('startIndex');
                var task = User.user[taskType][startIndex];
                User.log({op: 'sortTask', task: task, from: startIndex, to: ui.item.index()});
            }
        });
    }
});
