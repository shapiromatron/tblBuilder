import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import {
} from './constants';


export default {
    // #1: General
    referenceID: {
        label: 'Reference',
        type: SimpleSchema.RegEx.Id,
    },
    },
};
