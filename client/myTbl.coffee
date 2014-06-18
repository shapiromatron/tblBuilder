Users = new Meteor.Collection('userLookup');

getMyTblsHandle = ->
    userId = Meteor.userId()
    if userId
        myTblsHandle = Meteor.subscribe('myTbls', userId)
    else
        myTblsHandle = null

myTblsHandle = getMyTblsHandle()
Deps.autorun(getMyTblsHandle)

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
        activateInput(tmpl.find("input[name=name]"))

    'click #myTbl-show-edit': (evt, tmpl) ->
        Session.set("myTblEditingId", this._id)
        Deps.flush()  # update DOM before focus
        activateInput(tmpl.find("input[name=name]"))


Template.myTblForm.helpers
    TblTypeSelected: (prev, opt) ->
        prev is opt;

    searchUsers: (query, callback) ->
        Meteor.call 'searchUsers', query, {}, (err, res) ->
            if err
                console.log(err)
                return
            ids = ({_id: v._id, email: [(e.address for e in v.emails)].join(', ')} for v in res)
            callback(ids)

    getUsers: (userType) ->
        ids = (v.user_id for v in @user_roles when v.role is userType)
        ul = $(".#{userType}")

    getRoledUsers: (userType) ->
        ids = (v.user_id for v in @.user_roles when v.role is userType)
        Meteor.users.find({_id: {$in: ids}})

Template.myTblForm.events
    'click #myTbl-create': (evt, tmpl) ->
        obj = new_values(tmpl)
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
        vals = update_values(tmpl.find("#myTblForm"), this);
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
        if ul.find("li[data-user_id='#{v._id}']").length is 0
            ul.append("<li class='userListItem' data-user_id='#{v._id}'>#{v.email}
                        <a href='#' class='pull-right removeUser btn btn-default btn-xs' title='Remove from list'>
                        <span class='glyphicon glyphicon-remove'></span></a></li>")


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

Template.UserLI.helpers
    getEmail: ->
        [(v.address for v in @.emails)].join(', ')
