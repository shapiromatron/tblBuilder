import _ from 'underscore';
import {Meteor} from 'meteor/meteor';

import tblBuilderCollections from '/imports/collections';
import Tables from '/imports/collections/tables';

import {
    isStaffOrHigher,
} from '/imports/api/server/utilities';


let cloneTable = function(oldTbl){
        let newTbl, newTblId;

        newTbl = _.extend(
            {},
            oldTbl,
            {
                _id: undefined,
                name: oldTbl.name + ' (clone)',
            }
        );

        newTblId = Tables.insert(newTbl);
        return newTblId;
    },
    cloneContent = function(newTblId, oldTbl){
        let evidenceType = tblBuilderCollections.getEvidenceByTableType(oldTbl.tblType),
            Collection = evidenceType.collection,
            ChildCollections = [];

        if (evidenceType.nested_collection){
            ChildCollections.push(evidenceType.nested_collection);
        }
        if (evidenceType.other_related_collections){
            ChildCollections.push.apply(
                ChildCollections,
                evidenceType.other_related_collections
            );
        }


        Collection.find(
            {tbl_id: oldTbl._id},
            {sort: {sortIdx: 1}})
        .forEach(function(oldObject){
            let newObject, newObjectId,
                newNested;

            // create and copy new object
            newObject = _.extend({}, oldObject, {
                _id: undefined,
                tbl_id: newTblId,
            });
            newObjectId = Collection.insert(newObject);

            ChildCollections.forEach(function(ChildCollection){
                ChildCollection.find(
                    {parent_id: oldObject._id},
                    {sort: {sortIdx: 1}})
                .forEach(function(oldNested){
                    newNested = _.extend({}, oldNested, {
                        _id: undefined,
                        tbl_id: newTblId,
                        parent_id: newObjectId,
                    });
                    ChildCollection.insert(newNested);
                });
            });
        });
    };


Meteor.methods({
    cloneTable: function(tbl_id) {
        if (!isStaffOrHigher(this.userId)) {
            throw new Meteor.Error(403, 'Nice try wise-guy.');
        }
        let oldTbl = Tables.findOne(tbl_id),
            newTbl = cloneTable(oldTbl);
        cloneContent(newTbl, oldTbl);
    },
});
