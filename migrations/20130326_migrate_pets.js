/**
 * Migrate old pets to new system
 */
// mongo habitrpg ./node_modules/underscore/underscore.js ./migrations/20130326_migrate_pets.js

// IMPORTANT NOTE: this migration was written when we were using version 3 of lodash.
// We've now upgraded to lodash v4 but the code used in this migration has not been
// adapted to work with it. Before this migration is used again any lodash method should
// be checked for compatibility against the v4 changelog and changed if necessary.
// https://github.com/lodash/lodash/wiki/Changelog#v400

var mapping = {
    bearcub: {name:'BearCub', modifier: 'Base'},
    cactus: {name:'Cactus', modifier:'Base'},
    dragon: {name:'Dragon', modifier:'Base'},
    flyingpig: {name:'FlyingPig', modifier:'Base'},
    fox: {name:'Fox', modifier:'Base'},
    lioncub: {name:'LionCub', modifier:'Base'},
    pandacub: {name:'PandaCub', modifier:'Base'},
    tigercub: {name:'TigerCub', modifier:'Base'},
    wolfBorder: {name:'Wolf', modifier:'Base'},
    wolfDesert: {name:'Wolf', modifier:'Desert'},
    wolfGolden: {name:'Wolf', modifier:'Golden'},
    wolfRed: {name:'Wolf', modifier:'Red'},
    wolfShade: {name:'Wolf', modifier:'Shade'},
    wolfSkeleton: {name:'Wolf', modifier:'Skeleton'},
    wolfVeteran: {name:'Wolf', modifier:'Veteran'},
    wolfWhite: {name:'Wolf', modifier:'White'},
    wolfZombie: {name:'Wolf', modifier:'Zombie'}
}

/**
  == Old Style ==
    pet: Object
        icon: "Pet-Wolf-White.png"
        index: 14
        name: "wolfWhite"
        text: "White Wolf"
        value: 3
    pets: Object
        bearcub: true
        cactus: true

  == New Style ==
    currentPet: Object
        modifier: "Red"
        name: "Wolf"
        notes: "Find some Hatching Powder to sprinkle on this egg, and one day it will hatch into a loyal pet."
        str: "Wolf-Red"
        text: "Wolf"
        value: 3
    pets: Array
        0: "PandaCub-Base"
        1: "Wolf-Base"
 */


db.users.find().forEach(function(user){
    if (!user.items || (!user.items.pets && !user.items.pet)) return;

    // migrate items.pet to items.currentPet
    if (!!user.items.pet) {
        var mapped = mapping[user.items.pet.name];
        delete user.items.pet;
        user.items.currentPet = {
            modifier: mapped.modifier,
            name: mapped.name,
            str: mapped.name + "-" + mapped.modifier,
            text: '' // FIXME?
        }
    }

    // migrate items.pets
    if (!!user.items.pets) {
        var newPets = [];
        _.each(user.items.pets, function(val, key){
            if (_.isNumber(key)) {
                newPets.push(val)
                //FIXME why is this happening? seems the user gets migrated already...
                //throw "Error: User appears already migrated, this shouldn't be happening!"
            } else {
                newPets.push(mapping[key].name + "-" + mapping[key].modifier);
            }
        });
        user.items.pets = newPets;
    }

    try {
        db.users.update(
            {_id:user._id},
            {$set:
                { 'items' : user.items }
            }
        );
    } catch(e) {
        print(e);
    }
})