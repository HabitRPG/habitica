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
          content: "Welcome to HabitRPG, a habit-tracker which treats your goals like a Role Playing Game. I'm <a href='http://www.kickstarter.com/profile/1823740484' target='_blank'>Justin</a>, your guide!",
        }, {
          element: ".main-herobox",
          title: "Your Avatar",
          content: "This is your avatar. He represents you in the world of Habitica. As you accomplish goals, this little guy will gain levels, earn gold, and equip himself for further challenges ahead.",
        }, {
          element: ".main-herobox",
          title: "Avatar Customization",
          content: "You can customize your avatar by clicking on him when the tour is complete. Change your sex, hair color, skin color, and more from this menu. You can also find a number of HabitRPG's exciting social features by clicking through tabs on the customization page.",
        }, {
          element: "#bars",
          title: "Hit Points",
          content: "The red bar tracks your avatar's hit points. Whenever you fail to meet a goal, you take damage and lose HP. If your HP bar reaches zero, you die. Dying results in the loss of one level, all your gold, and a piece of equipment.",
        }, {
          element: "#bars",
          title: "Experience Points",
          content: "The yellow bar tracks your avatar's experience points. Whenever you succeed in achieving a goal, you gain both gold and EXP. When your EXP bar maxes out, you gain a level. Gaining levels is how you unlock new and exciting features on HabitRPG.",
        }, {
          element: "ul.habits",
          title: "Types of Goals",
          content: "HabitRPG allows you to track your goals in three different ways. These goals are categorized in columns as Habits, Dailies, or To-Dos.",
          placement: "bottom"
        }, {
          element: "ul.habits",
          title: "Habits",
          content: "Habits are goals that you constantly track. They can be given plus or minus values, allowing you to gain EXP and gold for good habits or lose HP for bad ones.",
          placement: "bottom"
        }, {
          element: "ul.dailys",
          title: "Dailies",
          content: "Dailies are goals that you want to complete once a day. Checking off a daily reaps EXP and gold. Failing to check off your daily by midnight results in a loss of HP.",
          placement: "bottom"
        }, {
          element: "ul.todos",
          title: "Todos",
          content: "Todos are one-off goals which have no set deadline. They make for a quick and easy way to gain experience.",
          placement: "bottom"
        }, {
          element: "ul.rewards",
          title: "Rewards",
          content: "All that gold you earned will allow you to reward yourself with either custom or in-game prizes. Buy them liberally – rewarding yourself is integral in forming good habits.",
          placement: "bottom"
        }, {
          element: "ul.habits li:first-child",
          title: "Hover over comments",
          content: "You can add comments to your tasks by clicking the edit icon. Hover over each task's comment for more details about how HabitRPG works. When you're ready to get started, you can delete the existing tasks and add your own.",
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
      eggs['Wolf'] = 1; // This is also set on the server
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
