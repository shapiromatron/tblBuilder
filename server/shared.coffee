
share.isStaffOrHigher = (userId) ->
    ValidStaff = ['staff', 'superuser']
    UserRoles = Roles.getRolesForUser(userId)
    return _.intersection(ValidStaff, UserRoles).length > 0
