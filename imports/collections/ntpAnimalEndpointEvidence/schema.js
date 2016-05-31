import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import endpointGroupSchema from './endpointGroups';

import { isNumericishString } from '/imports/api/validators';

export default {
    parent_id: {
        type: SimpleSchema.RegEx.Id,
        denyUpdate: true,
    },
    // Endpoint effects
    tumourSite: {
        label: 'Tumor site',
        type: String,
        min: 1,
        popoverText: 'e.g., Skin, Lung, Bronchiolo alveolar, Thymus, Lymphoid tissue, Soft tissue, Harderian gland, Pleural tissue',
        typeaheadMethod: 'searchNtpAnimalTumourSite',
        placeholderText: 'Skin, lung, bronchio alveolar',
    },
    histology: {
        label: 'Histology',
        type: String,
        optional: true,
        popoverText: 'e.g., squamous cell carcinoma, papilloma, adenoma, lymphoma, fibrosarcoma, mesothelioma, haemangiosarcoma',
        typeaheadMethod: 'searchNtpAnimalHistology',
        placeholderText: 'squamous cell carcinoma, adenoma',
    },
    units: {
        label: 'Dosing units',
        type: String,
        optional: true,
        popoverText: 'e.g., mg/mL, mg/kg, mg/kg bw, µg/m³',
        typeaheadMethod: 'searchNtpAnimalUnits',
        placeholderText: 'mg/kg bw',
    },
    // Dose response
    endpointGroups: {
        type: [endpointGroupSchema],
        minCount: 0,
    },
    // Comments
    trendTest: {
        label: 'Trend p-value',
        type: String,
        optional: true,
        custom: isNumericishString,
        popoverText: 'Provide p-value for trend-test when reported',
    },
    adjustedIncidence: {
        label: 'Adjusted tumor % incidence?',
        type: Boolean,
        popoverText: 'Has % incidence been adjusted for risk or survival?',
    },
    statisticalMethods: {
        label: 'Statistical methods',
        type: String,
        optional: true,
        popoverText: 'Methods use for pairwise and trend tests, e.g. Fisher\'s exact pairwise test, Cochran-Armitage. Note if using adjusted values.',
        textAreaRows: 3,
    },
    historicalControls: {
        label: 'Historical control incidence',
        type: String,
        optional: true,
        popoverText: 'note if of the same sex and strain and ideally same time period as concurrent controls in the study',
        textAreaRows: 3,
    },
    survivalNotes: {
        label: 'Survival notes',
        type: String,
        optional: true,
        popoverText: '<add>',
        textAreaRows: 3,
    },
    bodyWeightNotes: {
        label: 'Body weight notes',
        type: String,
        optional: true,
        popoverText: 'Note if there are major differences in body weights among control and dose groups; if there is potential confounding',
        textAreaRows: 3,
    },
    metastasis: {
        label: 'Metastasis',
        type: String,
        optional: true,
        popoverText: 'Note if metastases are reported for a tumor and note tissue sites',
        textAreaRows: 3,
    },
    comments: {
        label: 'Other comments',
        type: String,
        optional: true,
        popoverText: '<add>',
        textAreaRows: 3,
    },
};
