var isCreatorOrProjectManager = function(userId, doc) {
    if (Meteor.user().roles.indexOf("superuser") >= 0) return true;
    var ids = _.chain(doc.user_roles)
           .filter(function(d){return d.role === "projectManagers";})
           .pluck('user_id')
           .value();
    return (doc.user_id === userId) || (ids.indexOf(userId) >= 0);
  }, isTeamMemberOrHigher = function(userId, doc) {
    if (Meteor.user().roles.indexOf("superuser") >= 0) return true;
    var ids = _.chain(doc.user_roles)
       .filter(function(d){return d.role === "projectManagers" || d.role === "teamMembers";})
       .pluck('user_id')
       .value();
    return (doc.user_id === userId) || (ids.indexOf(userId) >= 0);
  },
  tblExistsAndTeamMemberOrHigher = function(userId, doc){
    var tbl = Tables.findOne({_id: doc.tbl_id});
    if (tbl == null) return false;
    return isTeamMemberOrHigher(tbl, userId);
  },
  tblContentAllowRules = {
    insert: tblExistsAndTeamMemberOrHigher,
    update: tblExistsAndTeamMemberOrHigher,
    remove: tblExistsAndTeamMemberOrHigher
  }, userAuthenticated = function(userId){
    return userId != null;
  };


Meteor.startup(function() {

  Meteor.users.allow({
    insert: serverShared.isStaffOrHigher,
    update: serverShared.isStaffOrHigher,
    remove: serverShared.isStaffOrHigher
  });

  Tables.allow({
    insert: serverShared.isStaffOrHigher,
    update: isCreatorOrProjectManager,
    remove: isCreatorOrProjectManager
  });

  Reference.allow({
    insert: userAuthenticated,
    update: userAuthenticated,
    remove: userAuthenticated
  });

  tblBuilderCollections.evidenceTypes.forEach(function(Collection){
    Collection.allow(tblContentAllowRules);
  });

});
