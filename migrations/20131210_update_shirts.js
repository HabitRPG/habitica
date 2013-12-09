// Partial migration towards Armory
db.users.find().forEach(function(user){
    db.users.update({_id: user._id}, {
        $set: {"purchased.shirts": {}},
        $set: {"items.gear.costume.armor": 'armor_base_0_' + (user.preferences.size == 'broad')? 'pink': 'blue'},
        $set: {"preferences.useCostume": user.preferences.showArmor},
        $unset: {'preferences.showArmor': 1}
    })
})


