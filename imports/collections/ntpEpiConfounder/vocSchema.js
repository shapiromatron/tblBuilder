import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import {
    ratingRationalePopoverText,
} from '/imports/collections/ntpEpiDescriptive/constants';


export default new SimpleSchema({
    vocName: {
        type: String,
        label: 'Potential confounder',
        popoverText: 'Identify variables that may be a potential confounder for a specific endpoint.',
        typeaheadMethod: 'searchNtpEpiVariablesOfConcern',
    },
    vocAddressedInStats: {
        type: String,
        label: 'Addressed in stats?',
        textAreaRows: 3,
        popoverText: 'Was potential confounder addressed statistically or as part of matched design?',
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
        popoverText: 'Is co-exposure associated with the outcome based on evidence from authoritative reviews or studies finding a positive association?',
        optional: true,
    },
    vocOtherInformation: {
        type: String,
        label: 'Other information',
        textAreaRows: 3,
        popoverText: 'Include other information relevant for assessing if variable is a confounder',
        optional: true,
    },
    vocStrengthOfAssociation: {
        type: String,
        label: 'Strength of association',
        textAreaRows: 3,
        popoverText: 'Include EE or E/R data for candidate substance and endpoint found in the study',
        optional: true,
    },
    vocRuleOutConfounding: {
        type: String,
        label: 'Rule out confounding?',
        textAreaRows: 3,
        popoverText: 'Include scientific judgment and rationale on whether the confounder can be reasonably ruled-out',
        optional: true,
    },
});
