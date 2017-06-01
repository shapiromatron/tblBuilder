import {Meteor} from 'meteor/meteor';

import _ from 'underscore';

import tblBuilderCollections from '/imports/collections';

import {
    getMaximumSortIndex,
} from '/imports/api/server/utilities';


Meteor.methods({
    saveSortOrder: function(key, ids) {
        this.unblock();
        // TODO: add once it no longer collides w/ SimpleSchema/Collection2
        // https://atmospherejs.com/babrahams/transactions
        var Collection = tblBuilderCollections.evidenceLookup[key].collection;
        _.each(ids, function(_id, i){
            Collection.update(_id, {$set: {sortIdx: i+1}});
        });
        return true;
    },
    getMaximumTableSortIndex(cls_name, tbl_id){
        let Cls = tblBuilderCollections.evidenceLookup[cls_name].collection;
        return getMaximumSortIndex(Cls, tbl_id);
    },
});
