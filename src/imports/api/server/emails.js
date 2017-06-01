import { Accounts } from 'meteor/accounts-base';
import {Meteor} from 'meteor/meteor';


let context = Meteor.settings.public.context.toUpperCase(),
    from_email = Meteor.settings.from_email;

// Global email configuration settings
Accounts.emailTemplates.siteName = `${context} Table Builder`;


// sendEnrollmentEmail
Accounts.emailTemplates.from = `${context} Table Builder Admin<${from_email}>`;
Accounts.emailTemplates.enrollAccount.subject = function() {
    return `You've been granted access to the ${context} Table Builder`;
};
Accounts.emailTemplates.enrollAccount.text = function(user, url) {
    var greeting;
    greeting = (user.profile != null) && (user.profile.fullName != null) ?
        'Hello ' + user.profile.fullName : 'Hello';
    return `${greeting},

A site administrator has created an account for you to contribute content to the ${context} table maker.
This web-application is designed to store key data for decisions in the monographs process.

To activate your account, click the link below:
${url}

Thank you,
The ${context} table maker team`;
};

// sendResetPasswordEmail
Accounts.emailTemplates.resetPassword.subject = function() {
    return `Reset your password for the ${context} Table Builder`;
};
Accounts.emailTemplates.resetPassword.text = function(user, url) {
    var greeting = (user.profile != null) && (user.profile.fullName != null) ?
        'Hello ' + user.profile.fullName : 'Hello';
    return `${greeting},

We've been notified that you'd like to reset your password on ${Meteor.absoluteUrl()}.

To reset your password, click the link below:
${url}

If you do not want to reset your password, you can safely ignore this email.

Thank you,
The ${context} Table Builder team`;
};
