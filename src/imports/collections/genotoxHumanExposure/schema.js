import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import {
    exposureScenarios,
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

    // second row
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
    comments: {
        label: 'Comments',
        type: String,
        optional: true,
        popoverText: 'Other relevant information or working-group comments. For human in-vivo data, this may include any co-exposures, strengths, limitations, or extent to which chance, bias, or confounding could explain the results.',
        textAreaRows: 3,
    },
};
