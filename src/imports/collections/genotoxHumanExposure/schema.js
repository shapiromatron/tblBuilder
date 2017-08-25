import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import {
    exposureScenarios,
    resultOptions,
} from './constants';


export default {
    // first row
    referenceID: {
        label: 'Reference',
        type: SimpleSchema.RegEx.Id,
    },
    exposureScenario: {
        label: 'Exposure scenario',
        type: String,
        allowedValues: exposureScenarios,
        popoverText: 'Type of exposure-information collected',
    },
    agent: {
        label: 'Agent',
        type: String,
        min: 1,
        popoverText: 'As reported',
        placeholderText: 'Trichloroethylene',
        typeaheadMethod: 'searchGenotoxAgents',
    },
    cellType: {
        label: 'Cell type (if specified)',
        type: String,
        optional: true,
        popoverText: 'As reported',
        placeholderText: 'endothelial',
        typeaheadMethod: 'searchGenotoxCellType',
    },
    location: {
        label: 'Location information',
        type: String,
        optional: true,
        popoverText: 'Other information (e.g., region, state, province, city) if important',
        placeholderText: 'e.g. Montpellier',
    },
    collectionDate: {
        label: 'Collection date',
        type: String,
        min: 1,
        popoverText: 'Year(s) of data collection',
        placeholderText: 'e.g. 2009-2011',
    },
    setting: {
        label: 'Exposure setting',
        type: String,
        min: 1,
        popoverText: 'As reported',
        placeholderText: 'e.g. Fuel tanker drivers',
    },
    numberMeasurements: {
        label: 'Number of measurements',
        type: String,
        min: 1,
        popoverText: 'Typically the number of samples for environmental sampling, or the number of individuals sampled if personal sampling (if >1 measurement/person, give total measurements and explain in the comment-box)',
        placeholderText: 'e.g. 3',
    },


    // third row
    samplingMatrix: {
        label: 'Ssampling matrix',
        type: String,
        min: 1,
        popoverText: 'The environmental medium or other matrix (e.g., air, drinking water, food, urine, blood) in which the agent was measured',
        typeaheadMethod: 'searchSamplingMatrices',
        placeholderText: 'e.g. air',
    },
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
    exposureUnits: {
        label: 'Exposure units',
        type: String,
        min: 1,
        popoverText: 'Measurement units (e.g. µg/m³, g/m²)',
        placeholderText: 'e.g. µg/m³',
        typeaheadMethod: 'searchUnits',
    },

    // fourth row
    endpoint: {
        label: 'Endpoint',
        type: String,
        min: 1,
        popoverText: 'As reported',
    },
    endpointTest: {
        label: 'Endpoint test',
        type: String,
        min: 1,
        popoverText: 'As reported',
    },
    result: {
        label: 'Result',
        type: String,
        allowedValues: resultOptions,
        popoverText: '<strong>Working Group judgment:</strong><ul><li>+, positive</li><li>–, negative</li><li>+/–, equivocal (variable response in several experiments within an adequate study)</li><li>(+) or (–), positive/negative in a study of limited quality (specify reason in comments, e.g. only a singe dose tested; data or methods not fully reported; confounding exposures, etc.)</li></ul>',
        forceRequiredSymbol: true,
    },

    // fifth row
    comments: {
        label: 'Comments',
        type: String,
        optional: true,
        popoverText: 'Other relevant information or working-group comments. For human in-vivo data, this may include any co-exposures, strengths, limitations, or extent to which chance, bias, or confounding could explain the results.',
        textAreaRows: 3,
    },
};
