import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import './main.html';


Template.adminMain.helpers({
    getAdminName: function() {
        return Meteor.user().profile.fullName;
    },
});
