import _ from 'underscore';

import {
    ratings,
} from '/imports/collections/ntpEpiDescriptive/constants';


let noOverrideRequired = 'No change from study description',
    outcomeOverriden = function(val){
        return val !== noOverrideRequired;
    },
    getOverrideValues = function(){
        let cloned = _.clone(ratings);
        cloned.unshift(noOverrideRequired);
        return cloned;
    },
    optionalOverrideRatings = getOverrideValues();


export { ratings };
export { outcomeOverriden };
export { optionalOverrideRatings };
