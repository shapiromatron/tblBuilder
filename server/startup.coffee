Meteor.startup ->
    process.env.MAIL_URL = Meteor.settings.mail_url

    if Meteor.roles.find().count() is 0
        Roles.createRole("superuser")
        Roles.createRole("staff")
        Roles.createRole("default")

    # example of adding superuser role
    # Roles.addUsersToRoles("oTJjRRMbD2XDFM9cB", ['superuser'])
