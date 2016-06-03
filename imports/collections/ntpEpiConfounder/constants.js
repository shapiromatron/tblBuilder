import _ from 'underscore';

import {
    ratings,
    biasDirection,
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
    getOverrideDirection = function(){
        let cloned = _.clone(biasDirection);
        cloned.unshift(noOverrideRequired);
        return cloned;
    },
    optionalOverrideRatings = getOverrideValues(),
    optionalOverrideDirection = getOverrideDirection();


export { ratings };
export { biasDirection };
export { outcomeOverriden };
export { optionalOverrideRatings };
export { optionalOverrideDirection };
