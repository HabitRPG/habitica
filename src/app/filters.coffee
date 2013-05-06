_ = require 'underscore'
browser = require './browser'

module.exports.app = (appExports, model) ->
  user = model.at('_user')

  appExports.toggleFilterByTag = (e, el) ->
    tagId = $(el).attr('data-tag-id')
    path = 'filters.' + tagId
    user.set path, !(user.get path)

  appExports.filtersNewTag = ->
    user.push 'tags', {id: model.id(), name: model.get("_newTag")} #, (-> browser.resetDom(model))
    model.set '_newTag', ''

  appExports.toggleEditingTags = ->
    before = model.get('_editingTags')
    model.set '_editingTags', !before, ->
      location.reload() if before is true #when they're done, refresh the page

  appExports.filtersDeleteTag = (e, el) ->
    tags = user.get('tags')
    tagId = $(el).attr('data-tag-id')
    model.del "_user.filters.#{tagId}"
    #TODO remove tag from each task
    _.each tags, (tag, i) ->
      if tag.id is tagId
        tags.splice(i,1)
        model.del "_user.filters.#{tag.id}"
    model.set "_user.tags", tags , -> browser.resetDom(model)

