#This is a boilerplate to make this file both node.js and AMD (require.js) module compatible.
({ define: (
  if typeof define == "function"
    define
  else
    (F)->
      F(require, exports, module)
)}).define (require, exports, module)->
  #Write your code here as usual

  #I.e. require parent module
  #NOTE: I did not figure out how to require coffee-script here. As this has to be both Node.js and require.js compatible syntax. And they disagree on how to do that. Anyway we can stick with .js parent modules for a while.
  parent = require('cs!./parentModule');

  module.exports =
  {
  foo: (message)->
    #use parent module
    console.log parent.parentFoo message
  }