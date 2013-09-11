'use strict';

/**
 * Services for each tour step when you unlock features
 */

angular.module('guideServices', []).
  factory('Guide', ['User', function(User) {

    var initTour = function() {
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
        step.content = "<div><div class='NPC-Justin'></div>" + step.content + "</div>"; // add Justin NPC img
      });
      $('.main-herobox').popover('destroy');
      var tour = new Tour({
        onEnd: function(){
          User.log({op:'set',data:{'flags.showTour':false}});
        }
      });
      tourSteps.forEach(function(step) {
        tour.addStep(_.defaults(step, {html: true}));
      });
      tour.restart(); // Tour doesn't quite mesh with our handling of flags.showTour, just restart it on page load
      //tour.start(true);
    };

    return {
      initTour: initTour
    }

  }
]);
