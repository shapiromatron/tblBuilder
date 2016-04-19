import {Meteor} from 'meteor/meteor';

import Reference from '/imports/collections/reference';


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
});
