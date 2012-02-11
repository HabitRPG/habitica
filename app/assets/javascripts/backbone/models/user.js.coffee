# Basically a singleton global variable, not being synced with the server
# Reason is habit.update() will calculate user stats on server
class HabitTracker.Models.User extends Backbone.Model
  
  updateStats: (habit, delta) ->
    # set exp
    @set({exp: @get('exp')+delta})

    # can't go below 0 exp
    if @get('exp') < 0 then @set({exp: 0})
    
    # level up & carry-over exp 
    if @get('exp') > @tnl()
      @set({ exp: @get('exp') - @tnl() })
      @set({ lvl: @get('lvl') + 1 })
    
    # also add money. Only take away money if it was a mistake (aka, a checkbox) 
    if delta>0 or (habit.isDaily() or habit.isTodo()) 
      @set({money: @get('money')+delta})
    # if buying an item, deduct cost
    if habit.isReward()
      @set({money: @get('money')-habit.get('score')})
      
    @trigger('updatedStats')
      
  tnl: () ->
    # http://tibia.wikia.com/wiki/Formula
    50 * Math.pow(@get('lvl'), 2) - 150 * @get('lvl') + 200
