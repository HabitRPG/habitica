#[HabitRPG](http://habitrpg.com/)

[HabitRPG](http://habitrpg.com/) is a habit tracker app which treats your goals like a Role Playing Game. As you accomplish goals, you level up. If you fail your goals, you lose hit points. Lose all your HP and you die.

![Screenshot](https://www.evernote.com/shard/s17/sh/ca83638e-191f-4648-bc5d-529645b3ec47/32534a827a66d3ee9e4f7c4389ec0f5f/res/2212ac3f-ee49-4075-bdf7-253876f0de5e/habitrpg_screen-20120904-232117.jpg.jpg "Screenshot")

##Roadmap
* [Chrome Extension](https://chrome.google.com/webstore/detail/pidkmpibnnnhneohdgjclfdjpijggmjj) currently being developed [(source code)](https://github.com/lefnire/habitrpg-chrome)
* Authentication (Facebook / Twitter)
* Groups, so you can compete with your friends
* Integration with tools like Astrid, Pivotal Tracker, Pomodoro, RescueTime, and MyFitnessPal
* [See the full list](https://workflowy.com/shared/cd06313a-7c93-ae5f-ae55-e64cae0556e4/)

##FAQ

###What is habit tracking?

See [Trackers vs Lifehackers](http://blog.beeminder.com/trackhack/) for a description and more habit tracking examples.
  
###This is confusing

If you played RPGs (Role Playing Games) growing up, this app will make sense to you; otherwise, it might be overwhelming at first. Be sure to follow the tutorial when you first load the website. If it's still not your cup of tea, checkout [Trackers vs Lifehackers](http://blog.beeminder.com/trackhack/) for alternatives.

###How do I heal?

After you play for a while you unlock the Item Store, from which you can buy health potions. Also, HP resets upon leveling up (everyone knows that!).
  
###All my tasks are red, I'm dying too fast

This is good. The worse you are at a task, the more valuable it becomes - meaning you gain more experience for completing those red tasks. This will incentivise you to try harder and to focus on the more difficult tasks. If you *really* need a bail-out, you can "Re-Roll" from the item store for $1, which resets all your tasks to a clean slate. It costs real money to prevent you from abusing it.
  
###How do I log in / save my data?

HabitRPG is built on [DerbyJS](http://derbyjs.com/), which doesn't yet support authentication. As soon as EveryAuth becomes available to Derby, I'll implement it - that and the other network integration aspects on the roadmap. You can follow the progress [here](https://groups.google.com/forum/?fromgroups#!topic/derbyjs/7U3xvoPWd-g) and [here](https://groups.google.com/forum/?fromgroups#!topic/derbyjs/oyz2JBwo1AQ).

In the meantime, a workaround has been built to use a private url, similar to Workflowy's shared lists, which you can use to access your account from multiple computers. Click the top-right profile button and bookmark the URL it provides.

##License
Code is licensed under GNU GPL v3. Content is licensed under CC-BY-SA 3.0.
See the LICENSE file for details.


##Credits
Content comes from Mozilla's [BrowserQuest](http://browserquest.mozilla.org/) 

* [Mozilla](http://mozilla.org)
* [Little Workshop](http://www.littleworkshop.fr)