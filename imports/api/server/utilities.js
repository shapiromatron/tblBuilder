import {Meteor} from 'meteor/meteor';
import _ from 'underscore';
import { Roles } from 'meteor/alanning:roles';
import PythonShell from 'python-shell';


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
    },
    getPyShell = function(scriptName){
        return new PythonShell(scriptName, {
            mode: 'json',
            scriptPath: Meteor.settings.scripts_path,
            pythonPath: Meteor.settings.python_path,
        });
    };


export {isStaffOrHigher};
export {getMaximumSortIndex};
export {getPyShell};
