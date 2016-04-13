import {Meteor} from 'meteor/meteor';

import _ from 'underscore';

import serverShared from '/server/shared';


var isCreatorOrProjectManager = function(userId, tbl) {
        if (Meteor.user().roles.indexOf('superuser') >= 0) return true;
        var ids = _.chain(tbl.user_roles)
               .filter(function(d){return d.role === 'projectManagers';})
               .pluck('user_id')
               .value();
        return (tbl.user_id === userId) || (ids.indexOf(userId) >= 0);
    }, isTeamMemberOrHigher = function(userId, tbl) {
        if (Meteor.user().roles.indexOf('superuser') >= 0) return true;
        var ids = _.chain(tbl.user_roles)
           .filter(function(d){return d.role === 'projectManagers' || d.role === 'teamMembers';})
           .pluck('user_id')
           .value();
        return (tbl.user_id === userId) || (ids.indexOf(userId) >= 0);
    },
    tblExistsAndTeamMemberOrHigher = function(userId, doc){
        var tbl = Tables.findOne({_id: doc.tbl_id});
        if (tbl == null) return false;
        return isTeamMemberOrHigher(userId, tbl);
    },
    tblContentAllowRules = {
        insert: tblExistsAndTeamMemberOrHigher,
        update: tblExistsAndTeamMemberOrHigher,
        remove: tblExistsAndTeamMemberOrHigher,
    },
    userAuthenticated = function(userId){
        return userId != null;
    };


Meteor.startup(function() {
    Meteor.users.allow({
        insert: serverShared.isStaffOrHigher,
        update: serverShared.isStaffOrHigher,
        remove: serverShared.isStaffOrHigher,
    });

    Tables.allow({
        insert: serverShared.isStaffOrHigher,
        update: isCreatorOrProjectManager,
        remove: isCreatorOrProjectManager,
    });

    Reference.allow({
        insert: userAuthenticated,
        update: userAuthenticated,
        remove: userAuthenticated,
    });

    tblBuilderCollections.evidenceTypes.forEach(function(Collection){
        Collection.allow(tblContentAllowRules);
    });
});
