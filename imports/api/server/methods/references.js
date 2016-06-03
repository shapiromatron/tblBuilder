import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import Reference from '/imports/collections/reference';
import EpiDescriptive from '/imports/collections/epiDescriptive';


Meteor.methods({
    removeReference: function(ref_id, thisAgent) {
        /*
          Remove-reference if there's only one monograph-agent associated with it;
          otherwise remove selected monographAgent from list.
        */
        var ref = Reference.findOne(ref_id);
        if (ref === undefined) return;
        if (ref.monographAgent.length <= 1){
            Reference.remove(ref._id);
        } else {
            Reference.update(
                {_id: ref._id},
                {$pull: {monographAgent: thisAgent}},
                {multi: false}
            );
        }
    },
    getReference: function(_id){
        return Reference.findOne(_id);
    },
    findMatchingExtractedData: function(ref_id, tbl_id){
        check(ref_id, String);
        check(tbl_id, String);
        let matches = EpiDescriptive.find(
            {
                referenceID: ref_id,
                isQA: true,
                tbl_id: {$ne: tbl_id},
            },
            {
                sort: {timestampQA: -1},
            }
        ).fetch();
        if(matches.length>0) return matches[0];
        return null;
    },
});
