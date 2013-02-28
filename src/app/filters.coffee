module.exports.app = (appExports, model) ->
  user = model.at('_user')

  appExports.toggleFilterByTag = (e, el) ->
    tagId = $(el).attr('data-tag-id')
    path = '_tagFilters.' + tagId
    user.set path, !(user.get path)
