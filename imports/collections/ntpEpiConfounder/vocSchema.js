import { SimpleSchema } from 'meteor/aldeed:simple-schema';


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
        popoverText: 'Is the variable similar across exposure status or across groups? Add correlation coefficient, if available.',
        optional: true,
    },
    vocCoexposuresAssociated: {
        type: String,
        label: 'Co-exposures associated?',
        textAreaRows: 3,
        popoverText: 'Is co-exposure associated with outcome based on authoritative reviews or other studies? Include EE or E/R estimate for co-exposure.',
        optional: true,
    },
    vocOtherInformation: {
        type: String,
        label: 'Other information',
        textAreaRows: 3,
        popoverText: 'Include other information relevant for assessing if variable is a confounder.',
        optional: true,
    },
    vocStrengthOfAssociation: {
        type: String,
        label: 'Strength of association',
        textAreaRows: 3,
        popoverText: 'Is variable associated with outcome? Include EE or E/R data for variable and endpoint.',
        optional: true,
    },
    vocRuleOutConfounding: {
        type: String,
        label: 'Rule out confounding?',
        textAreaRows: 3,
        popoverText: 'Include scientific judgment and rationale on whether the confounder can be reasonably ruled-out.',
        optional: true,
    },
});
