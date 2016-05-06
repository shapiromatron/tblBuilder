import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import {
    ratingRationalePopoverText,
} from '/imports/collections/ntpEpiDescriptive/constants';


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
        textAreaRows: 3,
        popoverText: 'Was this variable controlled for statistically?',
        optional: true,
    },
    vocSimilarAcrossGroups: {
        type: String,
        label: 'Similar across groups?',
        textAreaRows: 3,
        popoverText: 'Are potential biases constant across case/control groups (if applicable)?',
        optional: true,
    },
    vocCoexposuresAssociated: {
        type: String,
        label: 'Co-exposures associated?',
        textAreaRows: 3,
        popoverText: 'Is there sufficient or limited evidence from authoritative reviews or studies finding a positive association',
        optional: true,
    },
    vocOtherInformation: {
        type: String,
        label: 'Other information',
        textAreaRows: 3,
        popoverText: ratingRationalePopoverText,
        optional: true,
    },
    vocStrengthOfAssociation: {
        type: String,
        label: 'Strength of association',
        textAreaRows: 3,
        popoverText: 'Include EE or E/R data for candidate substance and endpoint found in the study.',
        optional: true,
    },
    vocRuleOutConfounding: {
        type: String,
        label: 'Rule out confounding?',
        textAreaRows: 3,
        popoverText: 'Scientific judgment on whether the confounder can be reasonably ruled-out and provide rationale',
        optional: true,
    },
});
