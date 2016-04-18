import {Meteor} from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import { Template } from 'meteor/templating';

import {
    newValues,
} from '/imports/api/client/utilities';


Template.profileEdit.helpers({
    getProfile: function() {
        var user = Meteor.user();
        if (user) return user.profile || {};
        return {};
    },
});
Template.profileForm.events({
    'click #update': function(evt, tmpl) {
        var profile = {'profile': newValues(tmpl.find('form'))};
        Meteor.users.update(Meteor.user()._id, {$set: profile});
        Router.go('home');
    },
    'click #update-cancel': function(evt, tmpl) {
        Router.go('home');
    },
});
