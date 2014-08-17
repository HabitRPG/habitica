var itemsOfInterest = [
    'headAccessory_special_wondercon_red',
    'headAccessory_special_wondercon_black',
    'back_special_wondercon_black',
    'back_special_wondercon_red',
    'body_special_wondercon_red',
    'body_special_wondercon_black',
    'body_special_wondercon_gold'
];

var itemsFound = {};  // each key is one item from itemsOfInterest, and
        // the value for that key is the number of users who own it
        // ('owned' values of both true and false are counted to
        // include items lost on death)

db.users.find().forEach(function(user) {
    var owned = user.items.gear.owned;
    for (var i=0, ic=itemsOfInterest.length; i<ic; i++) {
        var itemKey = itemsOfInterest[i];
        if (itemKey in owned) {
            itemsFound[itemKey] = (itemsFound[itemKey] || 0) + 1;
            // print(user.auth.local.username + ":  " + itemKey); // good for testing, bad for privacy
        }
    }
});


function yyyymmdd(date) {
    var yyyy =  date.getFullYear().toString();
    var mm   = (date.getMonth()+1).toString();
    var dd   =  date.getDate().toString();
    return yyyy + "-" + (mm[1]?mm:"0"+mm[0]) + "-" + (dd[1]?dd:"0"+dd[0]);
}
var today = yyyymmdd(new Date());

var header = '"date"'; // heading row in CSV data
var data   = '"' + today + '"'; // data row in CSV data
for (var i=0, ic=itemsOfInterest.length; i<ic; i++) {
    var itemKey = itemsOfInterest[i];
    header += ',"' + itemKey + '"';
    data += ',"' + (itemsFound[itemKey] || 0) + '"';
}

print("\nCSV DATA:\n");
print(header);
print(data);
print("\nREADABLE DATA:\n");
print(today);
print(JSON.stringify(itemsFound, null, "  "));
print("\n");


/*  SAMPLE OUTPUT:
> load("count_users_who_own_specified_gear.js")

CSV DATA:

"date","headAccessory_special_wondercon_red","headAccessory_special_wondercon_black","back_special_wondercon_black","back_special_wondercon_red","body_special_wondercon_red","body_special_wondercon_black","body_special_wondercon_gold"
"2014-08-17","5","4","3","3","3","3","3"

READABLE DATA:

2014-08-17
{
  "headAccessory_special_wondercon_red": 5,
  "headAccessory_special_wondercon_black": 4,
  "back_special_wondercon_black": 3,
  "back_special_wondercon_red": 3,
  "body_special_wondercon_red": 3,
  "body_special_wondercon_black": 3,
  "body_special_wondercon_gold": 3
}


true
> 
*/
