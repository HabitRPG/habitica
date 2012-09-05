#[HabitRPG](http://habitrpg.com/)

[HabitRPG](http://habitrpg.com/) is a habit tracker app which treats your goals like a Role Playing Game. As you accomplish goals, you level up. If you fail your goals, you lose hit points.

![Screenshot](https://s3.amazonaws.com/lefnirePublicFiles/habitrpg_screen.jpeg "Screenshot")

##Roadmap
* [Chrome Extension](https://chrome.google.com/webstore/detail/pidkmpibnnnhneohdgjclfdjpijggmjj) currently being developed ([source code](https://github.com/lefnire/habitrpg-chrome))
* Authentication ([progress](https://github.com/lefnire/habitrpg/issues/3))
* Groups: compete with your friends
* Integration with tools like Astrid, Pivotal Tracker, Pomodoro, RescueTime, and MyFitnessPal
* [See the full list](https://workflowy.com/shared/cd06313a-7c93-ae5f-ae55-e64cae0556e4/)

##FAQ

###What is habit tracking?

See [Trackers vs Lifehackers](http://blog.beeminder.com/trackhack/) for a description and more habit tracking examples.
  
###This is confusing

If you played RPGs (Role Playing Games) growing up, this app will make sense to you; otherwise, it might be overwhelming at first. Be sure to follow the tutorial when you first load the website. If it's still not your cup of tea, checkout [Trackers vs Lifehackers](http://blog.beeminder.com/trackhack/) for alternatives.

###How do I heal?

After you play for a while you unlock the Item Store from which you can buy health potions. Also, HP resets upon leveling up (of course!).
  
###All my tasks are red, I'm dying too fast

Good! Your red tasks provide the most incentive. The worse you are at a task, the more valuable it becomes in Exp & GP, which will push you to focus on the harder tasks. However, if you *really* need a bail-out, you can "Re-Roll" from the item store for $1, which resets all your tasks to a clean slate. It costs real money to prevent you from abusing it.
  
###How do I log in / save my data?

HabitRPG is built on [DerbyJS](http://derbyjs.com/), which doesn't yet support authentication. As soon as EveryAuth becomes available to Derby, I'll implement it - that and the other network integration aspects on the roadmap. You can follow the progress [here](https://github.com/lefnire/habitrpg/issues/3).

In the meantime, a workaround has been built to use a private url, similar to Workflowy's shared lists, which you can use to access your account from multiple computers. Click the top-right profile button and bookmark the URL it provides.

##License
Code is licensed under GNU GPL v3. Content is licensed under CC-BY-SA 3.0.
See the LICENSE file for details.


##Credits
Content comes from Mozilla's [BrowserQuest](http://browserquest.mozilla.org/) 

* [Mozilla](http://mozilla.org)
* [Little Workshop](http://www.littleworkshop.fr)