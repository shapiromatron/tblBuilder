Session.setDefault('adminUserEditingId', null)

Template.admin.helpers

    getUsers: ->
        Meteor.users.find({}, {sort: {createdAt: -1}})

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
        return @emails[0].address

    hasRole: (v) ->
        return v.hash.role in @.roles


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
