import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import {
    exposureScenarios,
    resultOptions,
} from './constants';


export default {
    parent_id: {
        type: SimpleSchema.RegEx.Id,
        denyUpdate: true,
    },

    // first row
    exposureScenario: {
        label: 'Exposure scenario',
        type: String,
        allowedValues: exposureScenarios,
        popoverText: 'Type of exposure-information collected',
    },
    exposureSetting: {
        label: 'Exposure setting',
        type: String,
        min: 1,
        popoverText: 'Industry, occupation, etc.',
        typeaheadMethod: 'searchHumanExposureSettings',
    },
    numberSubjects: {
        label: 'Number of subjects',
        type: String,
        min: 1,
        popoverText: 'Typically the number of samples for environmental sampling, or the number of individuals sampled if personal sampling (if >1 measurement/person, give total measurements and explain in the comment-box)',
        placeholderText: 'e.g. 3',
    },

    // second row
    samplingMatrix: {
        label: 'Sampling matrix',
        type: String,
        min: 1,
        popoverText: 'Blood, urine, etc.',
        typeaheadMethod: 'searchHumanSamplingMatrices',
        placeholderText: 'e.g., blood',
    },
    endpoint: {
        label: 'Endpoint',
        type: String,
        min: 1,
        popoverText: 'Micronuclei, chromosomal aberrations, DNA strand breaks, etc.',
        typeaheadMethod: 'searchHumanExposureEndpoints',
        placeholderText: 'e.g., Micronuclei',
    },
    cellType: {
        label: 'Cell type (if specified)',
        type: String,
        optional: true,
        popoverText: 'As reported',
        placeholderText: 'e.g., Peripheral lymphocytes, buccal cells',
        typeaheadMethod: 'searchHumanExposureCellType',
    },

    // third row
    exposureLevel: {
        label: 'Mean or median exposure-level',
        type: String,
        min: 1,
        popoverText: 'Quantitative level or NR if not reported. Geometric mean preferred if available.',
        placeholderText: 'e.g. 12.35',
    },
    exposureLevelRange: {
        label: 'Range of exposure-level',
        type: String,
        min: 1,
        popoverText: 'Minimum and maximum or NR if not reported. Optionally if range not reported the standard-deviation or other measure of variability relative to the mean. (e.g., 32.3-40.2, NR, 13.2 SD, 14.7 SE)',
        placeholderText: 'e.g. 32.3-40.2',
    },
    units: {
        label: 'Exposure units',
        type: String,
        min: 1,
        popoverText: 'Measurement units (e.g. µg/m³, g/m²)',
        placeholderText: 'e.g. µg/m³',
        typeaheadMethod: 'searchHumanUnits',
    },

    // fourth row
    result: {
        label: 'Result',
        type: String,
        allowedValues: resultOptions,
        popoverText: '<strong>Working Group judgment:</strong><ul><li>+, positive</li><li>–, negative</li><li>+/–, equivocal (variable response in several experiments within an adequate study)</li><li>(+) or (–), positive/negative in a study of limited quality (specify reason in comments, e.g. only a singe dose tested; data or methods not fully reported; confounding exposures, etc.)</li></ul>',
        forceRequiredSymbol: true,
    },
    significance: {
        label: 'Significance',
        type: String,
        min: 1,
        popoverText: 'p-value, if reported, otherwise significance level',
        placeholderText: 'e.g., P=0.03',
    },

    // fifth row
    covariates: {
        label: 'Covariates controlled',
        type: [String],
        optional: true,
        popoverText: 'List all covariates which were controlled by matching or adjustment in the analysis reported. Enter each covariate individually, and then press <enter> to add it to the list. If no covariates were specified, add \'not-specified\'',
        textAreaRows: 3,
        typeaheadMethod: 'searchHumanExposureCovariates',
    },
    notes: {
        label: 'General notes',
        type: String,
        optional: true,
        popoverText: 'Other relevant information. This may include any co-exposures, strengths, limitations, or extent to which chance, bias, or confounding could explain the result.',
        textAreaRows: 3,
    },
};
