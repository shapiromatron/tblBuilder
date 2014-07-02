Session.setDefault('adminUserEditingId', null)
Session.set("adminUserShowNew", false)


Template.admin.helpers

    getUsers: ->
        Meteor.users.find({}, {sort: {createdAt: -1}})

    adminUserShowNew: ->
        Session.get("adminUserShowNew")

Template.admin.events

    'click #adminUser-show-create': (evt, tmpl) ->
        Session.set("adminUserShowNew", true)

Template.adminUserRow.helpers

    adminUserIsEditing: ->
        Session.equals('adminUserEditingId', @_id)

    getUserEmail: ->
        return [(v.address for v in @.emails)].join(', ')

    getRoles: ->
        return @.roles.join(', ')

Template.adminUserRow.events
    'click #adminUser-show-edit': (evt, tmpl) ->
        Session.set("adminUserEditingId", @_id)
        Deps.flush() # update DOM before focus
        share.activateInput(tmpl.find("input[name=fullName]"))

Template.adminUserRowForm.helpers
    getEmail: ->
        if @emails? then return @emails[0].address

    hasRole: (v) ->
        if @roles? then return v.hash.role in @roles


getAdminUserValues = (tmpl) ->
    obj =
        profile:
            fullName: tmpl.find('input[name="fullName"]').value
            affiliation: tmpl.find('input[name="affiliation"]').value
        emails: [
            address: tmpl.find('input[name="email"]').value
            verified: false
        ]
        roles: []

    for inp in tmpl.findAll('input[type="checkbox"]')
        if inp.checked then obj.roles.push(inp.name)
    return obj

Template.adminUserRowForm.events

    'click #adminUser-update': (evt, tmpl) ->
        vals = getAdminUserValues(tmpl)
        Meteor.call('adminUserEditProfile', @_id, vals)
        Session.set("adminUserEditingId", null)

    'click #adminUser-update-cancel': (evt, tmpl) ->
        Session.set("adminUserEditingId", null)

    'click #adminUser-create': (evt, tmpl) ->
        vals = getAdminUserValues(tmpl)
        Meteor.call('adminUserCreateProfile', vals)
        Session.set("adminUserShowNew", false)

    'click #adminUser-create-cancel': (evt, tmpl) ->
        Session.set("adminUserShowNew", false)
