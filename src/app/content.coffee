module.exports =
  defaultTasks: [
    {type: 'habit', text: '1h Productive Work', notes: '<u>Habits: Constantly Track</u><br/>For some habits, it only makes sense to <b>gain</b> points (like this one).', value: 0, up: true, down: false }
    {type: 'habit', text: 'Eat Junk Food', notes: 'For others, it only makes sense to <b>lose</b> points', value: 0, up: false, down: true}
    {type: 'habit', text: 'Take The Stairs', notes: 'For the rest, both + and - make sense (stairs = gain, elevator = lose)', value: 0, up: true, down: true}
    {type: 'daily', text: '1h Personal Project', notes: '<u>Dailies: Complete Once a Day</u><br/>At the end of each day, non-completed Dailies dock you points.', value: 0, completed: false }
    {type: 'daily', text: 'Exercise', notes: "If you are doing well, they turn green and are less valuable (experience, gold) and less damaging (HP). This means you can ease up on them for a bit.", value: 3, completed: false }
    {type: 'daily', text: '45m Reading', notes: 'But if you are doing poorly, they turn red. The worse you do, the more valuable (exp, gold) and more damaging (HP) these goals become. This encourages you to focus on your shortcomings, the reds.', value: -10, completed: false }
    {type: 'todo', text: 'Call Mom', notes: "<u>Todos: Complete Eventually</u><br/>Non-completed Todos won't hurt you, but they will become more valuable over time. This will encourage you to wrap up stale Todos.", value: -3, completed: false }
    {type: 'reward', text: '1 Episode of Game of Thrones', notes: '<u>Rewards: Treat Yourself!</u><br/>As you complete goals, you earn gold to buy rewards. Buy them liberally - rewards are integral in forming good habits.', value: 20 }
    {type: 'reward', text: 'Cake', notes: 'But only buy if you have enough gold - you lose HP otherwise.', value: 10 }
  ]    
  
  tourSteps: [
      { 
        element: "#avatar"
        title: "Welcome to HabitRPG"
        content: "Welcome to HabitRPG, a habit-tracker which treats your goals like a Role Playing Game."
      }
      {
        element: "#bars"
        title: "Acheive goals and level up"
        content: "As you accomplish goals, you level up. If you fail your goals, you lose hit points. Lose all your HP and you die."
      }
      {
        element: "ul.habits"
        title: "Habits"
        content: "Habits are goals that you constantly track."
        placement: "bottom"
      }
      {
        element: "ul.dailys"
        title: "Dailies"
        content: "Dailies are goals that you want to complete once a day."
        placement: "bottom"
      }
      {
        element: "ul.todos"
        title: "Todos"
        content: "Todos are one-off goals which need to be completed eventually."
        placement: "bottom"
      }
      {
        element: "ul.rewards"
        title: "Rewards"
        content: "As you complete goals, you earn gold to buy rewards. Buy them liberally - rewards are integral in forming good habits."
        placement: "bottom"
      }
      {
        element: "ul.habits li:first-child"
        title: "Hover over comments"
        content: "Different task-types have special properties. Hover over each task's comment for more information. When you're ready to get started, delete the existing tasks and add your own."
        placement: "right"
      }
    ]
    
  items:
    unlockedMessage:
      title: "Item Store Unlocked"
      content: "Congradulations, you have unlocked the Item Store! You can now buy weapons, armor, potions, etc. Read each item's comment for more information."
    #TODO: figure out how to calculate index & type without having to store it in the JSON
    weapon: [
      {type: 'weapon', index: 0, text: "Sword 1", icon: "item-sword1", notes:'Training weapon.', value:0}
      {type: 'weapon', index: 1, text: "Sword 2", icon:'item-sword2', notes:'Increases experience gain by 3%.', value:20}
      {type: 'weapon', index: 2, text: "Axe", icon:'item-axe', notes:'Increases experience gain by 6%.', value:30}
      {type: 'weapon', index: 3, text: "Morningstar", icon:'item-morningstar', notes:'Increases experience gain by 9%.', value:45}
      {type: 'weapon', index: 4, text: "Blue Sword", icon:'item-bluesword', notes:'Increases experience gain by 12%.', value:65}
      {type: 'weapon', index: 5, text: "Red Sword", icon:'item-redsword', notes:'Increases experience gain by 15%.', value:90}
      {type: 'weapon', index: 6, text: "Golden Sword", icon:'item-goldensword', notes:'Increases experience gain by 18%.', value:120}
    ]
    armor: [
      {type: 'armor', index: 0, text: "Cloth Armor", icon: 'item-clotharmor', notes:'Training armor.', value:0}
      {type: 'armor', index: 1, text: "Leather Armor", icon: 'item-leatherarmor', notes:'Decreases HP loss by 3%.', value:30}
      {type: 'armor', index: 2, text: "Chain Mail", icon: 'item-mailarmor', notes:'Decreases HP loss by 6%.', value:45}
      {type: 'armor', index: 3, text: "Plate Mail", icon: 'item-platearmor', notes:'Decreases HP loss by 9%.', value:65}
      {type: 'armor', index: 4, text: "Red Armor", icon: 'item-redarmor', notes:'Decreases HP loss by 12%.', value:90}
      {type: 'armor', index: 5, text: "Golden Armor", icon: 'item-goldenarmor', notes:'Decreases HP loss by 15%.', value:120}
    ]
    potion: {type: 'potion', text: "Potion", notes: "Recover 15 HP", value: 25, icon: 'item-flask'}
    reroll:
      type: 'reroll' 
      text: "Re-Roll"
      icon: 'favicon' 
      notes: "Resets your tasks. When you're struggling and everything's red, use for a clean slate."
      value:0