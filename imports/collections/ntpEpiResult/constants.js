import _ from 'underscore';

import {
    ratings,
} from '/imports/collections/ntpEpiDescriptive/constants';


let optionalOverrideRatings = _.clone(ratings);
optionalOverrideRatings.unshift('No change from study description');


export { ratings };
export { optionalOverrideRatings };
