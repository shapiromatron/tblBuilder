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

Template.tablesTbl.helpers

    canEdit: ->
        currentUser = Meteor.user()
        if currentUser then id = currentUser._id else return
        ids = (v.user_id for v in @.user_roles when v.role is "projectManagers")
        return((id is @.user_id) or (id in ids))

    getTables: () ->
        Tables.find()

    showNew: () ->
        Session.get("tablesShowNew")

    isEditing: () ->
        Session.equals('tablesEditingId', @_id)

    getURL: () ->
        switch @tblType
            when "Epidemiology - Cohort"
                url = Router.path('epiCohortMain', {_id: @_id})
            when "Epidemiology - Case Control"
                url = Router.path('epiCaseControlMain', {_id: @_id})
            when "Mechanistic Evidence Summary"
                url = Router.path('mechanisticMain', {_id: @_id})
            else
                url = Router.path('404')


Template.tablesTbl.events
    'click #tables-show-create': (evt, tmpl) ->
        Session.set("tablesShowNew", true)
        Deps.flush()  # update DOM before focus
        share.activateInput(tmpl.find("input[name=name]"))

    'click #tables-show-edit': (evt, tmpl) ->
        Session.set("tablesEditingId", this._id)
        Deps.flush()  # update DOM before focus
        share.activateInput(tmpl.find("input[name=name]"))


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
        obj = share.newValues(tmpl)
        obj['timestamp'] = (new Date()).getTime()
        obj['user_id'] = Meteor.userId()
        obj['user_roles'] = getUserPermissionsObject(tmpl);
        delete obj['projectManagers']
        delete obj['teamMembers']
        delete obj['reviewers']
        Tables.insert(obj)
        Session.set("tablesShowNew", false)

    'click #tables-create-cancel': (evt, tmpl) ->
        Session.set("tablesShowNew", false)

    'click #tables-update': (evt, tmpl) ->
        vals = share.updateValues(tmpl.find("#tablesForm"), this);
        vals['user_roles'] = getUserPermissionsObject(tmpl);
        delete vals['projectManagers']
        delete vals['teamMembers']
        delete vals['reviewers']
        Tables.update(this._id, {$set: vals})
        Session.set("tablesEditingId", null)

    'click #tables-update-cancel': (evt, tmpl) ->
        Session.set("tablesEditingId", null)

    'click #tables-delete': (evt, tmpl) ->
        Tables.remove(this._id)
        Session.set("tablesEditingId", null)

    'click .removeUser': (evt, tmpl) ->
        $(evt.currentTarget).parent().remove()


Template.tablesForm.rendered = () ->
    tmpl = @
    Meteor.typeahead.inject();
    $('.typeahead').on 'typeahead:selected', (e, v) ->
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
