import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import organSiteCategories from './organSiteCategories';
import riskEstimateSchema from './riskEstimateSchema';

import { isNumericishString } from '/imports/api/validators';


export default {
    organSiteCategory: {
        label: 'Organ site',
        type: String,
        popoverText: 'Organ site (controlled vocabulary - select one from list)',
        allowedValues: organSiteCategories.options,
        forceRequiredSymbol: true,
        typeaheadMethod: 'searchOrganSiteCategories',
    },
    organSite: {
        label: 'Organ site details',
        type: String,
        optional: true,
        popoverText: 'Optional to further specify details, e.g ICD code, subtype',
        typeaheadMethod: 'searchOrganSite',
    },
    effectMeasure: {
        label: 'Measure of effect',
        type: String,
        min: 1,
        popoverText: 'Risk metric used to display results (SMR, RR, etc.)',
        typeaheadMethod: 'searchEffectMeasure',
    },
    effectUnits: {
        label: 'Units of effect measurement',
        type: String,
        optional: true,
        popoverText: 'Units, if relevant (e.g., risk per 10 μg/m3)',
        typeaheadMethod: 'searchEffectUnits',
    },
    trendTest: {
        label: 'Trend p-value',
        type: String,
        optional: true,
        custom: isNumericishString,
        popoverText: 'Provide p-value for trend-test when reported',
    },
    riskEstimates: {
        type: [riskEstimateSchema],
        minCount: 1,
    },
    covariates: {
        label: 'Covariates controlled',
        type: [String],
        minCount: 1,
        popoverText: 'List all covariates which were controlled by matching or adjustment in the analysis reported. Enter each covariate individually, and then press <enter> to add it to the list. If no covariates were specified, add \'not-specified\'',
        typeaheadMethod: 'searchCovariates',
    },
    covariatesControlledText: {
        label: 'Covariates controlled notes',
        type: String,
        optional: true,
        popoverText: 'Further describe how covariates were controlled, if needed, such as details on matching methodology or adjustments made',
        textAreaRows: 4,
    },
    notes: {
        label: 'General notes',
        type: String,
        optional: true,
        popoverText: 'Note issues related to appropriateness of comparison groups, potential for uncontrolled confounding, etc. (e.g. matching criteria for case-control studies)',
        textAreaRows: 4,
    },
    parent_id: {
        type: SimpleSchema.RegEx.Id,
        denyUpdate: true,
    },
};
