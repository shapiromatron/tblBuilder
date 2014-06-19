Users = new Meteor.Collection('userLookup');

Session.setDefault("myTblShowNew", false)
Session.setDefault('myTblEditingId', null)

getMyUserHandle = ->
    myTblId = Session.get('myTblEditingId')
    if myTblId
        userHandle = Meteor.subscribe('tblUsers', myTblId)
    else
        userHandle = null

userHandle = getMyUserHandle()
Deps.autorun(getMyUserHandle)

Template.myTbl.helpers

    canEdit: ->
        currentUser = Meteor.user()
        if currentUser then id = currentUser._id else return
        ids = (v.user_id for v in @.user_roles when v.role is "projectManagers")
        return((id is @.user_id) or (id in ids))

    getMyTbls: () ->
        MyTbls.find()

    showNew: () ->
        Session.get("myTblShowNew")

    isEditing: () ->
        Session.equals('myTblEditingId', @_id)

    getURL: () ->
        switch @tblType
            when "Epidemiology - Cohort"
                url = Router.path('epiCohortMain', {_id: @_id})
            when "Epidemiology - Case Control"
                url = Router.path('epiCaseControlMain', {_id: @_id})
            else
                url = Router.path('404')


Template.myTbl.events
    'click #myTbl-show-create': (evt, tmpl) ->
        Session.set("myTblShowNew", true)
        Deps.flush()  # update DOM before focus
        share.activateInput(tmpl.find("input[name=name]"))

    'click #myTbl-show-edit': (evt, tmpl) ->
        Session.set("myTblEditingId", this._id)
        Deps.flush()  # update DOM before focus
        share.activateInput(tmpl.find("input[name=name]"))


Template.myTblForm.helpers
    searchUsers: (query, callback) ->
        Meteor.call 'searchUsers', query, {}, (err, res) ->
            if err
                console.log(err)
                return
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


Template.myTblForm.events
    'click #myTbl-create': (evt, tmpl) ->
        obj = share.newValues(tmpl)
        obj['timestamp'] = (new Date()).getTime()
        obj['user_id'] = Meteor.userId()
        obj['user_roles'] = getUserPermissionsObject(tmpl);
        delete obj['projectManagers']
        delete obj['teamMembers']
        delete obj['reviewers']
        MyTbls.insert(obj)
        Session.set("myTblShowNew", false)

    'click #myTbl-create-cancel': (evt, tmpl) ->
        Session.set("myTblShowNew", false)

    'click #myTbl-update': (evt, tmpl) ->
        vals = share.updateValues(tmpl.find("#myTblForm"), this);
        vals['user_roles'] = getUserPermissionsObject(tmpl);
        delete vals['projectManagers']
        delete vals['teamMembers']
        delete vals['reviewers']
        MyTbls.update(this._id, {$set: vals})
        Session.set("myTblEditingId", null)

    'click #myTbl-update-cancel': (evt, tmpl) ->
        Session.set("myTblEditingId", null)

    'click #myTbl-delete': (evt, tmpl) ->
        MyTbls.remove(this._id)
        Session.set("myTblEditingId", null)

    'click .removeUser': (evt, tmpl) ->
        window.ev= evt;
        $(evt.currentTarget).parent().remove()

Template.myTblForm.rendered = () ->
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
        # lis = tmpl.findAll(".#{role} li")
        # if lis
        ids = ($(li).data('user_id') for li in tmpl.findAll(".#{role} li"))
        permissions[id] = role for id in ids
    # now save as list of objects
    list = ({user_id: key, role: value} for key, value of permissions)
    return list


UI.registerHelper "getUserDescription", ->
    emails = [(v.address for v in @.emails)].join(', ')
    if (@.profile and @.profile.fullName)
        return "#{@.profile.fullName} (#{emails})"
    else
        return emails
