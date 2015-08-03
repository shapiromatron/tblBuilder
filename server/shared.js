serverShared = {
    isStaffOrHigher: function(userId) {
      var UserRoles, ValidStaff;
      ValidStaff = ['staff', 'superuser'];
      UserRoles = Roles.getRolesForUser(userId);
      return _.intersection(ValidStaff, UserRoles).length > 0;
    },
    getWordTemplatePath: function(fn) {
      return Meteor.settings.docx_template_path + "/" + fn;
    }
}
