# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://jashkenas.github.com/coffee-script/

$(document).ready ->
  $("#habits").sortable
    axis: "y"
    dropOnEmpty: false
    cursor: "move"
    items: "li"
    opacity: 0.4
    scroll: true
    update: ->
      $.ajax
        type: "post"
        data: $("#habits").sortable("serialize")
        dataType: "script"
        complete: (request) ->
          $("#habits").effect "highlight"

        url: "/habits/sort"
        
$(document).ready ->
  $("#daily").sortable
    axis: "y"
    dropOnEmpty: false
    cursor: "move"
    items: "li"
    opacity: 0.4
    scroll: true
    update: ->
      $.ajax
        type: "post"
        data: $("#daily").sortable("serialize")
        dataType: "script"
        complete: (request) ->
          $("#daily").effect "highlight"

        url: "/habits/sort"

(($) ->
  $.fn.highlight = ->
    $(this).css
      color: "red"
      background: "yellow"
      
    $(this).fadeIn()
) jQuery