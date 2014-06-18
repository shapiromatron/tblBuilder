Template.profileEdit.helpers

    getProfile: ->
        user = Meteor.user()
        if (user)
            return user.profile or {}


Template.profileForm.events

    'click #update': (evt, tmpl) ->
        profile = {'profile': new_values(tmpl)}
        Meteor.users.update(Meteor.user()._id, {$set: profile})
        Router.go('my_lists')

    'click #update-cancel': (evt, tmpl) ->
        Router.go('my_lists')
