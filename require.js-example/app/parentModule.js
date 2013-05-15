//this module is required to run module.
({
    define: (typeof define === "function" ? define : function (F) {
        return F(require, exports, module);
    })
}).define(function (require, exports, module) {
        return module.exports = {
            parentFoo: function (message) {
                return message.toUpperCase();
            }
        };
    });