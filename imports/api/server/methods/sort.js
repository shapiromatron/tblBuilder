import {Meteor} from 'meteor/meteor';

import _ from 'underscore';


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
});
