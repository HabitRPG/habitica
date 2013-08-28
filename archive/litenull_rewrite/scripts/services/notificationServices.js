angular.module('notificationServices', []).
    factory('Notification', function () {
        var data = {message:''};
        var active = false;
        var timer = null;

        return {

            hide: function () {
                $('#notification').fadeOut(function () {
                    $('#notification').css('top', '-60px').css('webkit-transform', 'none').show().css('left', '0px');
                });

                active = false;
                timer = null;
            },

            animate: function () {

                if (timer) {
                    clearTimeout(timer);
                    timer = setTimeout(this.hide, 2000)
                }

                if (active == false) {
                    active = true;

                    $('#notification').transition({ y: 60, x: 0 });
                    timer = setTimeout(this.hide, 2000);
                }

            },

            push: function (message) {
                data.message = ''
                //  TODO implement message growl type notifications instead.
                //  {type:'stats',stats:stats} and {type:"text", text:"text"} 
                //  {hp:1,gp:-2.2} 
                switch(message.type) {
                    case 'stats':
                        var keys = Object.keys(message.stats)
                        _.each(keys, function(el, index) {
                            if (message.stats[el] < 0) {
                                data.message += el + ':' + '<font style="color:red">' + message.stats[el] + '</font>'
                            }else{
                                data.message += el + ':' + message.stats[el]
                            }
                        })
                    break;
                    case 'text':
                        data.message = message.text
                    break;
                }

                this.animate()
            },

            get: function () {
                return data;
            },

            clearTimer: function () {
                clearTimeout(timer);
                timer = null;
                active = false;
            },

            init: function () {
                timer = setTimeout(this.hide, 2000);
            }

        }

    });