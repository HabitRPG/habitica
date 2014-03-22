expect = require 'expect.js'

module.exports.addCustomMatchers = ->
  Assertion = expect.Assertion

  Assertion.prototype.toHaveGP = (gp)->
    actual = @obj.stats.gp
    @assert(
      actual == gp,
      -> "expected user to have #{gp} gp, but got #{actual}",
      -> "expected user to not have #{gp} gp"
    )

  Assertion.prototype.toHaveHP = (hp)->
    actual = @obj.stats.hp
    @assert(
      actual == hp,
      -> "expected user to have #{hp} hp, but got #{actual}",
      -> "expected user to not have #{hp} hp"
    )

  Assertion.prototype.toHaveExp = (exp)->
    actual = @obj.stats.exp
    @assert(
      actual == exp,
      -> "expected user to have #{exp} experience points, but got #{actual}",
      -> "expected user to not have #{exp} experience points"
    )

  Assertion.prototype.toHaveLevel = (lvl)->
    actual = @obj.stats.lvl
    @assert(
      actual == lvl,
      -> "expected user to be level #{lvl}, but got #{actual}",
      -> "expected user to not be level #{lvl}"
    )

  Assertion.prototype.toHaveMaxMP = (mp)->
    actual = @obj._statsComputed.maxMP
    @assert(
      actual == mp,
      -> "expected user to have #{mp} max mp, but got #{actual}",
      -> "expected user to not have #{mp} max mp"
    )