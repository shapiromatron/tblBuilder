Template.profileEdit.helpers({
    getProfile: function() {
        var user = Meteor.user();
        if (user) return user.profile || {};
        return {};
    },
});
Template.profileForm.events({
    'click #update': function(evt, tmpl) {
        var profile = {'profile': clientShared.newValues(tmpl.find('form'))};
        Meteor.users.update(Meteor.user()._id, {$set: profile});
        Router.go('home');
    },
    'click #update-cancel': function(evt, tmpl) {
        Router.go('home');
    },
});
