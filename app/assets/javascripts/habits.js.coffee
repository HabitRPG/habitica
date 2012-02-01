# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://jashkenas.github.com/coffee-script/

$(document).ready ->
  $.each ['#habits', '#daily'], (index, list_id) -> 
    $(list_id).sortable
      axis: "y"
      dropOnEmpty: false
      cursor: "move"
      items: "li"
      opacity: 0.4
      scroll: true
      update: ->
        $.ajax
          type: "post"
          url: "/habits/sort"
          data: $(list_id).sortable("serialize")
          dataType: "script"
          complete: (request) ->
            $(list_id).effect "highlight"

(($) ->
  $.fn.highlight = ->
    $(this).css
      color: "red"
      background: "yellow"
      
    $(this).fadeIn()
) jQuery
