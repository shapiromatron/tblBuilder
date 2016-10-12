import _ from 'underscore';
import { Roles } from 'meteor/alanning:roles';

let isStaffOrHigher = function(userId) {
        var validStaff = ['staff', 'superuser'],
            userRoles = Roles.getRolesForUser(userId);
        return _.intersection(validStaff, userRoles).length > 0;
    },
    getMaximumSortIndex = function(Cls, tbl_id){
        // get maximum sort-index for table; starting at 1.
        var found = Cls.findOne({tbl_id}, {sort: {sortIdx: -1}}),
            max = (found)? found.sortIdx: 0;
        return Math.ceil(max) + 1;
    };


export {isStaffOrHigher};
export {getMaximumSortIndex};
