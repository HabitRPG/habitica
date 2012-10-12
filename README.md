#[HabitRPG](http://habitrpg.com/)

[HabitRPG](http://habitrpg.com/) is a habit tracker app which treats your goals like a Role Playing Game. Level up as you succeed, lose HP as you fail, earn money to buy weapons and armor.

![Screenshot](https://raw.github.com/lefnire/habitrpg/master/public/img/screenshot.jpeg "Screenshot")

##Roadmap
* Groups: compete with your friends
* Mobile App
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

Good! Your red tasks provide the most incentive. The worse you are at a task, the more valuable it becomes in Exp & GP, which will push you to focus on the harder tasks. However, if you *really* need a bail-out, you can "Re-Roll" from the item store, which resets all your tasks to a clean slate. You have to use your quarters, which will prevent you from re-rolling frequently.

Again, try as hard as you can to avoid using re-roll. The point of red tasks is to push you to try harder.

##API
HabitRPG has a simple API for up-scoring and down-scoring third party Habits: ```POST /users/:userId/tasks/:taskId/:direction```. This API is currently used in the [Chrome extension](https://chrome.google.com/webstore/detail/habitrpg/pidkmpibnnnhneohdgjclfdjpijggmjj), and you can use it wherever (eg, I'm using it in my [Pomodoro scripts](https://www.evernote.com/shard/s17/sh/9cd765e9-9b5e-44ff-a3e1-b46691c3f593/4ab39c1fca3fe6d54c831dfe6550bf5d)). See [the API page](https://github.com/lefnire/habitrpg/wiki/API) for more details.
  
##License
Code is licensed under GNU GPL v3. Content is licensed under CC-BY-SA 3.0.
See the LICENSE file for details.


##Credits
Content comes from Mozilla's [BrowserQuest](http://browserquest.mozilla.org/) 

* [Mozilla](http://mozilla.org)
* [Little Workshop](http://www.littleworkshop.fr)