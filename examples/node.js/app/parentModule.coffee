({ define: (
  if typeof define == "function"
    define
  else
    (F)->
      F(require, exports, module)
)}).define (require, exports, module)->
  #Write your code here as usual
  module.exports =
    {
    parentFoo: (message)->
      message.toUpperCase()
    }