import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import {
    evidenceOptions,
} from './constants';


export default {
    subheading: {
        label: 'Subheading',
        type: String,
        optional: true,
    },
    references: {
        label: 'References',
        type: [SimpleSchema.RegEx.Id],
    },
    text: {
        label: 'Supporting evidence',
        type: String,
        optional: true,
        custom: function() {
            var isRequired = (!this.field('subheading').isSet) && (this.value === '');
            if (isRequired) return 'required';
        },
    },
    animalInVitro: {
        label: 'Animal in vitro',
        type: String,
        allowedValues: evidenceOptions,
    },
    animalInVivo: {
        label: 'Animal in vivo',
        type: String,
        allowedValues: evidenceOptions,
    },
    humanInVitro: {
        label: 'Human in vitro',
        type: String,
        allowedValues: evidenceOptions,
    },
    humanInVivo: {
        label: 'Human in vivo',
        type: String,
        allowedValues: evidenceOptions,
    },
    section: {
        type: String,
        optional: true,
    },
    parent: {
        type: SimpleSchema.RegEx.Id,
        optional: true,
    },
};
