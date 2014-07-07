Template.profileEdit.helpers

    getProfile: ->
        user = Meteor.user()
        if (user)
            return user.profile or {}


Template.profileForm.events

    'click #update': (evt, tmpl) ->
        profile = {'profile': share.newValues(tmpl.find('form'))}
        Meteor.users.update(Meteor.user()._id, {$set: profile})
        Router.go('home')

    'click #update-cancel': (evt, tmpl) ->
        Router.go('home')
