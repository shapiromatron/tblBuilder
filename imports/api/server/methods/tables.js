import {Meteor} from 'meteor/meteor';

import tblBuilderCollections from '/imports/collections';
import Tables from '/imports/collections/tables';

import {
    isStaffOrHigher,
} from '/imports/api/server/utilities';


Meteor.methods({
    cloneTable: function(tbl_id) {
        if (!isStaffOrHigher(this.userId)) {
            throw new Meteor.Error(403, 'Nice try wise-guy.');
        }
        let tbl = Tables.findOne(tbl_id),
            coll = tblBuilderCollections.getCollectionByTableType(tbl.tblType);

        console.log(coll._name, tbl._id);
        return 123;
    },
});
