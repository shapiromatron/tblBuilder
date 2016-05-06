import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import organSiteCategories from '/imports/collections/epiResult/organSiteCategories';
import riskEstimateSchema from './riskEstimateSchema';


export default {
    organSiteCategory: {
        label: 'Organ site',
        type: String,
        popoverText: 'Organ site (controlled vocabulary - select one from list)',
        allowedValues: organSiteCategories.options,
        typeaheadMethod: 'searchOrganSiteCategories',
    },
    organSite: {
        label: 'Organ site details',
        type: String,
        optional: true,
        popoverText: 'Optional to further specify details, e.g ICD code, subtype',
        typeaheadMethod: 'searchNtpOrganSite',
    },
    effectMeasure: {
        label: 'Measure of effect',
        type: String,
        popoverText: 'Risk metric used to display results (SMR, RR, etc.)',
        typeaheadMethod: 'searchNtpEffectMeasure',
        optional: true,
    },
    effectUnits: {
        label: 'Units of effect measurement',
        type: String,
        optional: true,
        popoverText: 'Units, if relevant (e.g., risk per 10 μg/m3)',
        typeaheadMethod: 'searchNtpEffectUnits',
    },
    trendTest: {
        label: 'p-value for trend',
        type: Number,
        decimal: true,
        optional: true,
        popoverText: 'Provide p-value for trend-test when reported',
    },
    'riskEstimates': {
        type: [riskEstimateSchema],
        minCount: 1,
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
    parent_id: {
        type: SimpleSchema.RegEx.Id,
        denyUpdate: true,
    },
};
