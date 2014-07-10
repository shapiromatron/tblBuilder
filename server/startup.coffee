Meteor.startup ->

    # update mail URL based on meter input settings
    process.env.MAIL_URL = Meteor.settings.mail_url

    # define user roles if none exist
    if Meteor.roles.find().count() is 0
        Roles.createRole("superuser")
        Roles.createRole("staff")
        Roles.createRole("default")

    # create a superuser if no users exist
    if Meteor.users.find().count() is 0
        email = Meteor.settings.superuser_email
        if email?
            _id = Accounts.createUser({"email": email})
            Roles.setUserRoles(_id, ["default", "staff", "superuser"])
            console.log("Sending email to superuser #{email} for account creation")
            Accounts.sendEnrollmentEmail(_id)
        else
            console.log("Create an admin user by setting the 'superuser_email' field in meteor settings")

    # create basic report template objects in database
    if ReportTemplate.find().count() is 0
        user = Meteor.users.findOne()._id
        timestamp = (new Date()).getTime()

        templates = [
            {
                filename: "mechanistic-v1.docx"
                tblType: "Mechanistic Evidence Summary"
                timestamp: timestamp
                user_id: user
            },
            {
                filename: "epi-v1.docx"
                tblType: "Epidemiology Evidence"
                timestamp: timestamp
                user_id: user
            }
        ]

        for template in templates
            ReportTemplate.insert(template)
