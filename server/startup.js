import {Meteor} from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';


Meteor.startup(function() {
    var _id, email;

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
        email = Meteor.settings.superuser_email;
        if (email != null) {
            _id = Accounts.createUser({'email': email});
            Roles.setUserRoles(_id, ['default', 'staff', 'superuser']);
            console.log(`Sending email to superuser ${email} for account creation`);
            return Accounts.sendEnrollmentEmail(_id);
        } else {
            return console.log('Create an admin user by setting the "superuser_email" field in meteor settings');
        }
    }
});
