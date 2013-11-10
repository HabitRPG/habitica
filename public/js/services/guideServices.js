'use strict';

/**
 * Services for each tour step when you unlock features
 */

angular.module('guideServices', []).
  factory('Guide', ['$rootScope', 'User', 'Items', 'Helpers', function($rootScope, User, Items, Helpers) {

    /**
     * Init and show the welcome tour. Note we do it listening to a $rootScope broadcasted 'userLoaded' message,
     * this because we need to determine whether to show the tour *after* the user has been pulled from the server,
     * otherwise it's always start off as true, and then get set to false later
     */
    $rootScope.$on('userUpdated', initTour);
    function initTour(){
      if (User.user.flags.showTour === false) return;
      var tourSteps = [
        {
          element: ".main-herobox",
          title: "Welcome to HabitRPG",
          content: "Welcome to HabitRPG, a habit-tracker which treats your goals like a Role Playing Game. I'm <a href='http://www.kickstarter.com/profile/1823740484' target='_blank'>Justin</a>, your guide! "
        }, {
          element: "#bars",
          title: "Achieve goals and level up",
          content: "As you accomplish goals, you level up. If you fail your goals, you lose hit points. Lose all your HP and you die."
        }, {
          element: "ul.habits",
          title: "Habits",
          content: "Habits are goals that you constantly track.",
          placement: "bottom"
        }, {
          element: "ul.dailys",
          title: "Dailies",
          content: "Dailies are goals that you want to complete once a day.",
          placement: "bottom"
        }, {
          element: "ul.todos",
          title: "Todos",
          content: "Todos are one-off goals which need to be completed eventually.",
          placement: "bottom"
        }, {
          element: "ul.rewards",
          title: "Rewards",
          content: "As you complete goals, you earn gold to buy rewards. Buy them liberally - rewards are integral in forming good habits.",
          placement: "bottom"
        }, {
          element: "ul.habits li:first-child",
          title: "Hover over comments",
          content: "Different task-types have special properties. Hover over each task's comment for more information. When you're ready to get started, delete the existing tasks and add your own.",
          placement: "right"
        }
      ];
      _.each(tourSteps, function(step){
        step.content = "<div><div class='NPC-Justin float-left'></div>" + step.content + "</div>"; // add Justin NPC img
      });
      $('.main-herobox').popover('destroy');
      var tour = new Tour({
        onEnd: function(){
          User.set('flags.showTour', false);
        }
      });
      tourSteps.forEach(function(step) {
        tour.addStep(_.defaults(step, {html: true}));
      });
      tour.restart(); // Tour doesn't quite mesh with our handling of flags.showTour, just restart it on page load
      //tour.start(true);
    };

    var alreadyShown = function(before, after) {
      return !(!before && after === true);
    };

    var showPopover = function(selector, title, html, placement) {
      if (!placement) placement = 'bottom';
      $(selector).popover('destroy');
      var button = "<button class='btn btn-sm btn-default' onClick=\"$('" + selector + "').popover('hide');return false;\">Close</button>";
      html = "<div><div class='NPC-Justin float-left'></div>" + html + '<br/>' + button + '</div>';
      $(selector).popover({
        title: title,
        placement: placement,
        trigger: 'manual',
        html: true,
        content: html
      }).popover('show');
    };

    $rootScope.$watch('user.flags.customizationsNotification', function(after, before) {
      if (alreadyShown(before, after)) return;
      showPopover('.main-herobox', 'Customize Your Avatar', "Click your avatar to customize your appearance.", 'bottom');
    });

    $rootScope.$watch('user.flags.itemsEnabled', function(after, before) {
      if (alreadyShown(before, after)) return;
      var html = "Congratulations, you have unlocked the Item Store! You can now buy weapons, armor, potions, etc. Read each item's comment for more information.";
      showPopover('div.rewards', 'Item Store Unlocked', html, 'left');
    });

    $rootScope.$watch('user.flags.partyEnabled', function(after, before) {
      if (alreadyShown(before, after)) return;
      var html = "Be social, join a party and play Habit with your friends! You'll be better at your habits with accountability partners. Click User -> Options -> Party, and follow the instructions. LFG anyone?";
      showPopover('.user-menu', 'Party System', html, 'bottom');
    });

    $rootScope.$watch('user.flags.dropsEnabled', function(after, before) {
      if (alreadyShown(before, after)) return;
      var eggs = User.user.items.eggs || {};
      eggs['Wolf-Base'] = 5; // This is also set on the server
      $rootScope.modals.dropsEnabled = true;
    });

    $rootScope.$watch('user.items.pets', function(after, before) {
      if (User.user.achievements && User.user.achievements.beastMaster) return;
      if (before >= 90) {
        User.set('achievements.beastMaster', true);
        $('#beastmaster-achievement-modal').modal('show'); // FIXME
      }
    });

    return {
      initTour:initTour
    };

  }
]);
