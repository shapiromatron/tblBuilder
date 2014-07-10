Users = new Meteor.Collection('userLookup');

Session.setDefault("tablesShowNew", false)
Session.setDefault('tablesEditingId', null)

getTablesHandle = ->
    tablesId = Session.get('tablesEditingId')
    if tablesId
        userHandle = Meteor.subscribe('tblUsers', tablesId)
    else
        userHandle = null

userHandle = getTablesHandle()
Deps.autorun(getTablesHandle)


Template.TablesByMonograph.helpers

    getMonographs: ->
        tbls = Tables.find({},{fields: {"volumeNumber": 1}, sort: {"volumeNumber": -1}}).fetch()
        return _.uniq(_.pluck(tbls, "volumeNumber"))

    getMonographAgents: (volumeNumber) ->
        tbls = Tables.find({"volumeNumber": volumeNumber},
                           {fields: {"monographAgent": 1}, sort: {"monographAgent": 1}}).fetch()
        return _.uniq(_.pluck(tbls, "monographAgent"))

    getTables: (volumeNumber, monographAgent) ->
        tbls = Tables.find({"volumeNumber": volumeNumber, "monographAgent": monographAgent}).fetch()
        return tbls

    getURL: () ->
        switch @tblType
            when "Mechanistic Evidence Summary"
                url = Router.path('mechanisticMain', {_id: @_id})
            when "Epidemiology Evidence"
                url = Router.path('epiMain', {_id: @_id})
            else
                url = Router.path('404')

    canEdit: ->
        currentUser = Meteor.user()
        if currentUser then id = currentUser._id else return
        if "superuser" in currentUser.roles then return true
        ids = (v.user_id for v in @.user_roles when v.role is "projectManagers")
        return((id is @.user_id) or (id in ids))

    showNew: () ->
        Session.get("tablesShowNew")

    isEditing: () ->
        Session.equals('tablesEditingId', @_id)


Template.TablesByMonograph.events
    'click #tables-show-create': (evt, tmpl) ->
        Session.set("tablesShowNew", true)
        Deps.flush()  # update DOM before focus
        share.activateInput(tmpl.find("input[name=volumeNumber]"))

    'click #tables-show-edit': (evt, tmpl) ->
        Session.set("tablesEditingId", this._id)
        Deps.flush()  # update DOM before focus
        share.activateInput(tmpl.find("input[name=volumeNumber]"))


Template.tablesForm.helpers
    searchUsers: (query, callback) ->
        Meteor.call 'searchUsers', query, {}, (err, res) ->
            if err then return console.log(err)
            callback(res)

    getUsers: (userType) ->
        ids = (v.user_id for v in @user_roles when v.role is userType)
        ul = $(".#{userType}")

    getRoledUsers: (userType) ->
        if @.user_roles
            ids = (v.user_id for v in @.user_roles when v.role is userType)
            Meteor.users.find({_id: {$in: ids}})

    getTblTypeOptions: ->
        return tblTypeOptions


Template.tablesForm.events
    'click #tables-create': (evt, tmpl) ->
        obj = share.newValues(tmpl.find("#tablesForm"))
        obj['user_roles'] = getUserPermissionsObject(tmpl);
        delete obj['projectManagers']
        delete obj['teamMembers']
        delete obj['reviewers']
        isValid = Tables.simpleSchema().namedContext().validate(obj)
        if isValid
            Tables.insert(obj)
            Session.set("tablesShowNew", false)
        else
            errorDiv = share.createErrorDiv(Tables.simpleSchema().namedContext())
            $(tmpl.find("#errors")).html(errorDiv)

    'click #tables-create-cancel': (evt, tmpl) ->
        Session.set("tablesShowNew", false)

    'click #tables-update': (evt, tmpl) ->
        vals = share.updateValues(tmpl.find("#tablesForm"), this);
        vals['user_roles'] = getUserPermissionsObject(tmpl);
        delete vals['projectManagers']
        delete vals['teamMembers']
        delete vals['reviewers']
        modifier = {$set: vals}
        isValid = Tables.simpleSchema().namedContext().validate(modifier, {modifier: true})
        if isValid
            Tables.update(this._id, modifier)
            Session.set("tablesEditingId", null)
        else
            errorDiv = share.createErrorDiv(Tables.simpleSchema().namedContext())
            $(tmpl.find("#errors")).html(errorDiv)

    'click #tables-update-cancel': (evt, tmpl) ->
        Session.set("tablesEditingId", null)

    'click #tables-delete': (evt, tmpl) ->
        Tables.remove(this._id)
        Session.set("tablesEditingId", null)

    'click .removeUser': (evt, tmpl) ->
        $(evt.currentTarget).parent().remove()


Template.tablesForm.rendered = () ->
    tmpl = @
    Meteor.typeahead.inject('.userTypeahead');
    $('.userTypeahead').on 'typeahead:selected', (e, v) ->
        ul = $(tmpl.find(".#{e.target.name}"))
        rendered = UI.renderWithData(Template.UserLI, v)
        UI.insert(rendered, ul[0])

getUserPermissionsObject = (tmpl)->
    # first filter objects so that each user has the higher permission
    permissions = {}
    for role in ['reviewers', 'teamMembers', 'projectManagers']
        ids = ($(li).data('user_id') for li in tmpl.findAll(".#{role} li"))
        permissions[id] = role for id in ids
    # now save as list of objects
    list = ({user_id: key, role: value} for key, value of permissions)
    return list
