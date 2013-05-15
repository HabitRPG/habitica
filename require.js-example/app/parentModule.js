//this module is required to run module.
//again boilerplate here for node.js\require.js compatibility.
({
    define: (typeof define === "function" ? define : function (F) {
        return F(require, exports, module);
    })
}).define(function (require, exports, module) {

        //write regular node.js code here
        return module.exports = {
            parentFoo: function (message) {
                return message.toUpperCase();
            }
        };

    });