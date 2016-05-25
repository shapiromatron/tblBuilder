import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import {
} from './constants';


export default {
    // #1: General
    referenceID: {
        label: 'Reference',
        type: SimpleSchema.RegEx.Id,
    },
    strengths: {
        label: 'Principal strengths',
        type: String,
        optional: true,
        popoverText: 'Note major strengths.',
        textAreaRows: 4,
    },
    limitations: {
        label: 'Principal limitations',
        type: String,
        optional: true,
        popoverText: 'Note major limitations.',
        textAreaRows: 4,
    },
};
