#This is a boilerplate to make this file both node.js and AMD (require.js) module compatible.
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
  foo: (message)->
    alert message
  }