import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import {
    exposureScenarios,
    isOccupational,
} from './constants';


export default {
    // row #1
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
    exposureScenario: {
        label: 'Exposure scenario',
        type: String,
        allowedValues: exposureScenarios,
        popoverText: 'Type of exposure-information collected',
    },
    collectionDate: {
        label: 'Collection date',
        type: String,
        min: 1,
        popoverText: 'Year(s) of data collection',
        placeholderText: 'e.g. 2009-2011',
    },
    occupation: {
        label: 'Industry or occupation',
        type: String,
        optional: true,
        custom: function() {
            var isRequired = (
                    isOccupational(this.field('exposureScenario').value)) &&
                    (this.value === '');
            if (isRequired) return 'required';
        },
        popoverText: 'Industry/occupation for occupational exposure',
        placeholderText: 'e.g. Bitumen production',
        forceRequiredSymbol: true,
    },
    occupationInfo: {
        label: 'Other occupational information',
        type: String,
        optional: true,
        popoverText: 'Other information (e.g., job task, etc.) if important',
        placeholderText: 'e.g. Tar distillation',
    },
    country: {
        label: 'Country',
        type: String,
        min: 1,
        popoverText: 'Country of exposure measurement',
        placeholderText: 'e.g. France',
        typeaheadMethod: 'searchCountries',
    },
    location: {
        label: 'Other location information',
        type: String,
        optional: true,
        popoverText: 'Other information (e.g., region, state, province, city) if important',
        placeholderText: 'e.g. Montpellier',
    },

    // row #2
    comments: {
        label: 'Additional information/comments',
        type: String,
        optional: true,
        popoverText: 'Other relevant information or Working Group comments',
        textAreaRows: 2,
    },
};
