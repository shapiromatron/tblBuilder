import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import {
} from './constants';


export default {
    // #1: General information
    referenceID: {
        label: 'Reference',
        type: SimpleSchema.RegEx.Id,
    },
    additionalReferences: {
        label: 'References',
        type: [SimpleSchema.RegEx.Id],
        minCount: 0,
        popoverText: 'References of earlier updates or related publications',
    },
};
