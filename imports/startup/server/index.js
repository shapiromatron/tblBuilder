import {Meteor} from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

import { Roles } from 'meteor/alanning:roles';

import '/imports/api/server/emails';
import '/imports/api/server/hooks';
import '/imports/api/server/publications';
import '/imports/api/server/permissions';
import '/imports/api/server/methods';

// update mail URL based on meter input settings
process.env.MAIL_URL = Meteor.settings.mail_url;

// define user roles if none exist
if (Meteor.roles.find().count() === 0) {
    Roles.createRole('superuser');
    Roles.createRole('staff');
    Roles.createRole('default');
}

// create a superuser if no users exist
if (Meteor.users.find().count() === 0) {
    var email = Meteor.settings.superuser_email;
    if (email != null) {
        var _id = Accounts.createUser({'email': email});
        Roles.setUserRoles(_id, ['default', 'staff', 'superuser']);
        console.log(`Sending email to superuser ${email} for account creation`);
        Accounts.sendEnrollmentEmail(_id);
    } else {
        console.log('Create an admin user by setting the "superuser_email" field in meteor settings');
    }
}
