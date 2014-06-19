Meteor.startup ->
    process.env.MAIL_URL = Meteor.settings.mail_url
