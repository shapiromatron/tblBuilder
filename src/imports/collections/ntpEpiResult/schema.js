import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import organSiteCategories from '/imports/collections/epiResult/organSiteCategories';
import riskEstimateSchema from './riskEstimateSchema';

import { isNumericishString } from '/imports/api/validators';


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
        label: 'Trend p-value',
        type: String,
        optional: true,
        custom: isNumericishString,
        popoverText: 'Provide p-value for trend-test when reported',
    },
    additionalResults:{
        label: 'Additional results',
        type: String,
        optional: true,
        textAreaRows: 4,
        popoverText: 'Additional results would only be entered once for each organ site, for each study',
    },
    riskEstimates: {
        type: [riskEstimateSchema],
        minCount: 0,
    },
    covariates: {
        label: 'Covariates controlled',
        type: [String],
        minCount: 0,
        popoverText: 'List covariates which were controlled by matching or adjustment in the reported analysis. Enter each covariate individually, and then press <enter> to add it to the list. If no covariates were specified, add \'not-specified\'',
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
