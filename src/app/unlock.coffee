_ = require 'lodash'
{ randomVal } = require 'habitrpg-shared/script/helpers'
{ pets, hatchingPotions } = require('habitrpg-shared/script/items').items

###
  Listeners to enabled flags, set notifications to the user when they've unlocked features
###

module.exports.app = (appExports, model) ->
  user = model.at('_user')

  alreadyShown = (before, after) -> !(!before and after is true)

  showPopover = (selector, title, html, placement='bottom') ->
    $(selector).popover('destroy')
    html += " <a href='#' onClick=\"$('#{selector}').popover('hide');return false;\">[Close]</a>"
    $(selector).popover({
      title: title
      placement: placement
      trigger: 'manual'
      html: true
      content: html
    }).popover 'show'


  user.on 'set', 'flags.customizationsNotification', (after, before) ->
    return if alreadyShown(before,after)
    $('.main-herobox').popover('destroy') #remove previous popovers
    html = "Click your avatar to customize your appearance."
    showPopover '.main-herobox', 'Customize Your Avatar', html, 'bottom'

  user.on 'set', 'flags.itemsEnabled', (after, before) ->
    return if alreadyShown(before,after)
    html = """
           <img src='/vendor/BrowserQuest/client/img/1/chest.png' />
           Congratulations, you have unlocked the Item Store! You can now buy weapons, armor, potions, etc. Read each item's comment for more information.
           """
    showPopover 'div.rewards', 'Item Store Unlocked', html, 'left'

  user.on 'set', 'flags.petsEnabled', (after, before) ->
    return if alreadyShown(before,after)
    html = """
           <img src='/img/sprites/wolf_border.png' style='width:30px;height:30px;float:left;padding-right:5px' />
           You have unlocked Pets! You can now buy pets with Gems (note, you replenish Gems with real-life money - so chose your pets wisely!)
           """
    showPopover '#rewardsTabs', 'Pets Unlocked', html, 'left'

  user.on 'set', 'flags.partyEnabled', (after, before) ->
    return if user.get('party.current') or alreadyShown(before,after)
    html = """
           Be social, join a party and play Habit with your friends! You'll be better at your habits with accountability partners. Click User -> Options -> Party, and follow the instructions. LFG anyone?
           """
    showPopover '.user-menu', 'Party System', html, 'bottom'

  user.on 'set', 'flags.dropsEnabled', (after, before) ->
    return if alreadyShown(before,after)

    egg = randomVal pets

    dontPersist =  model._dontPersist

    model._dontPersist = false
    user.push 'items.eggs', egg
    model._dontPersist = dontPersist

    $('#drops-enabled-modal').modal 'show'

  user.on 'push', 'items.pets', (after, before) ->
    return if user.get('achievements.beastMaster')
    if before >= 90 # evidently before is the count?
      dontPersist =  model._dontPersist; model._dontPersist = false
      user.set 'achievements.beastMaster', true, (-> model._dontPersist = dontPersist)
      $('#beastmaster-achievement-modal').modal('show')

  user.on 'set', 'items.*', (after, before) ->
    return if user.get('achievements.ultimateGear')
    items = user.get('items')
    if parseInt(items.weapon) >= 6 and parseInt(items.armor) >= 5 and parseInt(items.head) >= 5 and parseInt(items.shield) >= 5
      [dontPersist, model._dontPersist] =  [model._dontPersist; false]
      user.set 'achievements.ultimateGear', true, ->model._dontPersist = dontPersist
      $('#max-gear-achievement-modal').modal('show')

  user.on 'set', 'tasks.*.streak', (id, after, before) ->
    if after > 0

      # 21-day streak, as per the old philosophy of doign a thing 21-days in a row makes a habit
      if (after % 21) is 0
        dontPersist =  model._dontPersist; model._dontPersist = false
        user.incr 'achievements.streak', 1, (-> model._dontPersist = dontPersist)
        $('#streak-achievement-modal').modal('show')

      # they're undoing a task at the 21 mark, take back their badge
      else if (before - after is 1) and (before % 21 is 0)
        dontPersist =  model._dontPersist; model._dontPersist = false
        user.incr 'achievements.streak', -1, (-> model._dontPersist = dontPersist)
