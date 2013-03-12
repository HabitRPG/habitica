(function(exports){
    var dayMapping, moment;

    moment = moment? moment: require('moment');

    exports.daysBetween = function(yesterday, now, dayStart) {
        if (!((dayStart != null) && (dayStart = parseInt(dayStart)) && dayStart >= 0 && dayStart <= 24)) {
            dayStart = 0;
        }
        return Math.abs(moment(yesterday).startOf('day').add('h', dayStart).diff(moment(now), 'days'));
    };

    exports.dayMapping = dayMapping = {
        0: 'su',
        1: 'm',
        2: 't',
        3: 'w',
        4: 'th',
        5: 'f',
        6: 's',
        7: 'su'
    };

})(typeof exports === 'undefined'? this['habitrpgHelpers']={}: exports);