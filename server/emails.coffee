# Global email configuration settings
Accounts.emailTemplates.siteName = "IARC Table Maker"
Accounts.emailTemplates.from = "IARC Table Maker Admin <admin@iarcTables.com>"

# sendEnrollmentEmail
Accounts.emailTemplates.enrollAccount.subject = (user) ->
    return "You've been granted access to IARC Table Maker"

Accounts.emailTemplates.enrollAccount.text = (user, url) ->
    greeting = if user.profile? and user.profile.fullName? then "Hello #{user.profile.fullName}" else "Hello"
    return "#{greeting}, \n\n\
            A site administrator has created an account for you to contribute
            content to the IARC table maker software. This web-application
            is designed to store key data for decisions in the IARC process.\n\n\
            To activate your account, click the link below:\n\n\
            #{url}\n\n\
            Thank you, \n\
            The IARC Table Maker Team"

# sendResetPasswordEmail
Accounts.emailTemplates.resetPassword.subject = (user) ->
    return "Reset your password at IARC Table Maker"

Accounts.emailTemplates.resetPassword.text = (user, url) ->
    greeting = if user.profile? and user.profile.fullName? then "Hello #{user.profile.fullName}" else "Hello"
    return "#{greeting}, \n\n\
            We've been notified that you'd like to reset your password. To reset
            your password, click the link below:\n\n\
            #{url}\n\n\
            If you do not want to reset your password, you can safely ignore
            this email.\n\n\
            Thank you, \n\
            The IARC Table Maker Team"


