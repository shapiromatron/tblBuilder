import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export default new SimpleSchema({
    vocName: {
        type: String,
        label: 'Variable',
        popoverText: 'Based on review of information, identify variables that may be a potential confounder/endpoint specific.',
        typeaheadMethod: 'searchNtpEpiVariablesOfConcern',
    },
    vocAddressedInStats: {
        type: String,
        label: 'Addressed in stats?',
        popoverText: '<add>',
    },
    vocSimilarAcrossGroups: {
        type: String,
        label: 'Similar across groups?',
        popoverText: '<add>',
    },
    vocCoexposuresAssociated: {
        type: String,
        label: 'Coexposures associated?',
        popoverText: '<add>',
    },
    vocOtherInformation: {
        type: String,
        label: 'Other information',
        popoverText: '<add>',
    },
    vocStrengthOfAssociation: {
        type: String,
        label: 'Strength of association',
        popoverText: '<add>',
    },
    vocRuleOutConfounding: {
        type: String,
        label: 'Rule out confounding?',
        popoverText: '<add>',
    },
});
