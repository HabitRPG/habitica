_ = require 'lodash'

module.exports.app = (appExports, model) ->
  user = model.at('_user')

  appExports.filtersDeleteTag = (e, el) ->
    tags = user.get('tags')
    tag = e.at "_user.tags." + $(el).attr('data-index')
    tagId = tag.get('id')

    ###something got corrupted, let's clear the corrupt tags###
    unless tagId
      user.set 'tags', _.filter( tags, ((t)-> t?.id) )
      user.set 'filters', {}
      return

    model.del "_user.filters.#{tagId}"
    tag.remove()

    ### remove tag from all tasks###
    _.each user.get("tasks"), (task) -> user.del "tasks.#{task.id}.tags.#{tagId}"; true

