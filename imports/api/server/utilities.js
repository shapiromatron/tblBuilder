import _ from 'underscore';
import { Roles } from 'meteor/alanning:roles';


export const isStaffOrHigher = function(userId) {
    var validStaff = ['staff', 'superuser'],
        userRoles = Roles.getRolesForUser(userId);
    return _.intersection(validStaff, userRoles).length > 0;
};
