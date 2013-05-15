({
    define: (typeof define === "function" ? define : function (F) {
        return F(require, exports, module);
    })
}).define(function (require, exports, module) {
        var dayMapping, moment;
        module.exports = obj = {};
        moment = require('./moment');

        obj.daysBetween = function (yesterday, now, dayStart) {
            if (!((dayStart != null) && (dayStart = parseInt(dayStart)) && dayStart >= 0 && dayStart <= 24)) {
                dayStart = 0;
            }
            return Math.abs(moment(yesterday).startOf('day').add('h', dayStart).diff(moment(now), 'days'));
        };

        obj.dayMapping = dayMapping = {
            0: 'su',
            1: 'm',
            2: 't',
            3: 'w',
            4: 'th',
            5: 'f',
            6: 's',
            7: 'su'
        };


        obj.equipped = function (user, type) {
            var armor, armorSet, gender, head, _ref, _ref1, _ref2;
            _ref = (user != null ? user.preferences : void 0) || {
                'm': 'm',
                'v1': 'v1'
            }, gender = _ref.gender, armorSet = _ref.armorSet;
            if (type === 'armor') {
                armor = (user != null ? (_ref1 = user.items) != null ? _ref1.armor : void 0 : void 0) || 0;
                if (gender === 'f') {
                    if (parseInt(armor) === 0) {
                        return "f_armor_" + armor + "_" + armorSet;
                    } else {
                        return "f_armor_" + armor;
                    }
                } else {
                    return "m_armor_" + armor;
                }
            } else if (type === 'head') {
                head = (user != null ? (_ref2 = user.items) != null ? _ref2.head : void 0 : void 0) || 0;
                if (gender === 'f') {
                    if (parseInt(head) > 1) {
                        return "f_head_" + head + "_" + armorSet;
                    } else {
                        return "f_head_" + head;
                    }
                } else {
                    return "m_head_" + head;
                }
            }
        };
        return obj;
    });






