import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import organSiteCategories from '/imports/collections/epiResult/organSiteCategories';
import variableOfConcernSchema from './vocSchema';

import {
    ratings,
    optionalOverrideRatings,
    biasDirection,
    optionalOverrideDirection,
} from './constants';

import {
    biasDirectionPopoverText,
    ratingRationalePopoverText,
} from '/imports/collections/ntpEpiDescriptive/constants';


export default {
    organSiteCategory: {
        label: 'Organ site',
        type: String,
        popoverText: 'Organ site (controlled vocabulary - select one from list)',
        allowedValues: organSiteCategories.options,
        typeaheadMethod: 'searchOrganSiteCategories',
    },
    covariates: {
        label: 'Covariates controlled',
        type: [String],
        minCount: 0,
        popoverText: 'List all covariates which were controlled by matching or adjustment in the analysis reported. Enter each covariate individually, and then press <enter> to add it to the list. If no covariates were specified, add \'not-specified\'',
        typeaheadMethod: 'searchNtpCovariates',
    },
    otherVariables: {
        label: 'Other variables',
        type: String,
        optional: true,
        popoverText: 'Further describe how covariates were controlled, if needed, such as details on matching methodology or adjustments made',
        textAreaRows: 4,
    },
    caseControlMatching: {
        label: 'Matching variables',
        type: [String],
        minCount: 0,
        popoverText: 'List variables on which controls were matched to cases',
        typeaheadMethod: 'searchNtpEpiCaseControlMatching',
    },
    caseControlDiffers: {
        label: 'Variables which differ between cases and controls',
        type: [String],
        minCount: 0,
        popoverText: 'List variables that differ between cases and controls (e.g., age, smoking, gender, etc.)',
        typeaheadMethod: 'searchNtpEpiCaseControlDiffers',
    },
    coexposures: {
        label: 'Coexposures',
        type: [String],
        minCount: 0,
        popoverText: 'Possible co-exposures which may potentially confound results.',
        typeaheadMethod: 'searchNtpCoexposures',
    },
    confoundingRating: {
        label: 'Confounding rating',
        type: String,
        allowedValues: ratings,
        popoverText: ratingRationalePopoverText,
    },
    confoundingDirection:{
        label: 'Bias direction',
        type: String,
        allowedValues: biasDirection,
        popoverText: biasDirectionPopoverText,
    },
    confoundingRatingRationale: {
        label: 'Confounding rating rationale',
        type: String,
        textAreaRows: 4,
        popoverText: ratingRationalePopoverText,
        optional: true,
    },
    outcomeAssessmentRatingOverride: {
        label: 'Outcome assessment rating (override)',
        type: String,
        allowedValues: optionalOverrideRatings,
        popoverText: ratingRationalePopoverText,
    },
    outcomeAssessmentDirectionOverride:{
        label: 'Bias direction',
        type: String,
        allowedValues: optionalOverrideDirection,
        popoverText: biasDirectionPopoverText,
    },
    outcomeAssessmentRationaleOverride: {
        label: 'Outcome assessment rationale (override)',
        type: String,
        optional: true,
        textAreaRows: 3,
        popoverText: ratingRationalePopoverText,
    },

    'variablesOfConcern': {
        type: [variableOfConcernSchema],
        minCount: 0,
    },
    parent_id: {
        type: SimpleSchema.RegEx.Id,
        denyUpdate: true,
    },
};
