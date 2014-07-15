share.isStaffOrHigher = (userId) ->
    ValidStaff = ['staff', 'superuser']
    UserRoles = Roles.getRolesForUser(userId)
    return _.intersection(ValidStaff, UserRoles).length > 0

share.getWordTemplatePath = (fn) ->
    return "#{Meteor.settings.docx_template_path}/#{fn}"
