import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Tracker } from 'meteor/tracker';

import _ from 'underscore';

import {
    activateInput,
    addUserMessage,
} from '/imports/api/client/utilities';

import './user.html';


var getAdminUserValues = function(tmpl) {
    var obj = {
        profile: {
            fullName: tmpl.find('input[name="fullName"]').value,
            affiliation: tmpl.find('input[name="affiliation"]').value,
        },
        emails: [{
            address: tmpl.find('input[name="email"]').value,
            verified: false,
        }],
        roles: [],
    };

    tmpl.findAll('input[type="checkbox"]').forEach(function(inp){
        if (inp.checked) obj.roles.push(inp.name);
    });

    return obj;
};


Template.admin.helpers({
    getUsers: function() {
        return Meteor.users.find({}, {sort: {createdAt: -1}});
    },
    adminUserShowNew: function() {
        return Session.get('adminUserShowNew');
    },
});
Template.admin.events({
    'click #adminUser-show-create': function(evt, tmpl) {
        return Session.set('adminUserShowNew', true);
    },
});


Template.adminUserRow.helpers({
    adminUserIsEditing: function() {
        return Session.equals('adminUserEditingId', this._id);
    },
    getUserEmail: function() {
        return _.pluck(this.emails, 'address').join(', ');
    },
    getRoles: function() {
        return this.roles.join(', ');
    },
});
Template.adminUserRow.events({
    'click #adminUser-show-edit': function(evt, tmpl) {
        Session.set('adminUserEditingId', this._id);
        Tracker.flush();
        activateInput(tmpl.find('input[name=fullName]'));
    },
    'click #adminUser-resetPassword': function(evt, tmpl) {
        var email, message;
        Meteor.call('adminUserResetPassword', this._id);
        email = this.emails[0].address;
        message = 'A password-reset email was just sent to ' + email;
        addUserMessage(message, 'success');
    },
    'click #adminUser-removeUser': function(evt, tmpl) {
        var message = 'User removed';
        Meteor.users.remove(this._id);
        addUserMessage(message, 'success');
    },
    'click #adminUser-setPassword': function(evt, tmpl) {
        var passwd = tmpl.find('input[name="password"]').value;
        if (passwd.length < 6) {
            return addUserMessage('Must be at least six-characters', 'danger');
        }
        Meteor.call('adminSetPassword', this._id, passwd, function(error, result) {
            if ((result !== null) && result.success) {
                addUserMessage('Password successfully changed', 'success');
            } else {
                addUserMessage('An error occurred', 'danger');
            }
        });
    },
});
Template.adminUserRowForm.helpers({
    getEmail: function() {
        if (this.emails != null) return this.emails[0].address;
    },
    hasRole: function(v) {
        if (this.roles != null) {
            return this.roles.indexOf(v.hash.role) >= 0;
        } else {
            return false;
        }
    },
});


Template.adminUserRowForm.events({
    'click #adminUser-update': function(evt, tmpl) {
        var vals = getAdminUserValues(tmpl);
        Meteor.call('adminUserEditProfile', this._id, vals);
        Session.set('adminUserEditingId', null);
    },
    'click #adminUser-update-cancel': function(evt, tmpl) {
        Session.set('adminUserEditingId', null);
    },
    'click #adminUser-create': function(evt, tmpl) {
        var vals = getAdminUserValues(tmpl),
            msg  = 'User created!';
        Meteor.call('adminUserCreateProfile', vals);
        Session.set('adminUserShowNew', false);
        addUserMessage(msg, 'success');
    },
    'click #adminUser-create-cancel': function(evt, tmpl) {
        Session.set('adminUserShowNew', false);
    },
});
