// Global email configuration settings
Accounts.emailTemplates.siteName = 'IARC Table Maker';


// sendEnrollmentEmail
Accounts.emailTemplates.from = 'IARC Table Maker Admin <admin@iarcTables.com>';
Accounts.emailTemplates.enrollAccount.subject = function() {
    return 'You\'ve been granted access to IARC Table Maker';
};

Accounts.emailTemplates.enrollAccount.text = function(user, url) {
    var greeting;
    greeting = (user.profile != null) && (user.profile.fullName != null) ? 'Hello ' + user.profile.fullName : 'Hello';
    return greeting + ', \n\nA site administrator has created an account for you to contribute content to the IARC table maker software. This web-application is designed to store key data for decisions in the IARC process.\n\nTo activate your account, click the link below:\n\n' + url + '\n\nThank you, \nThe IARC Table Maker Team';
};

// sendResetPasswordEmail
Accounts.emailTemplates.resetPassword.subject = function() {
    return 'Reset your password at IARC Table Maker';
};
Accounts.emailTemplates.resetPassword.text = function(user, url) {
    var greeting = (user.profile != null) && (user.profile.fullName != null) ? 'Hello ' + user.profile.fullName : 'Hello';
    return greeting + ', \n\nWe\'ve been notified that you\'d like to reset your password. To reset your password, click the link below:\n\n' + url + '\n\nIf you do not want to reset your password, you can safely ignore this email.\n\nThank you, \nThe IARC Table Maker Team';
};
