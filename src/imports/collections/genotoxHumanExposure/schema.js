import { SimpleSchema } from 'meteor/aldeed:simple-schema';


export default {
    // first row
    referenceID: {
        label: 'Reference',
        type: SimpleSchema.RegEx.Id,
    },
    additionalReferences: {
        label: 'References',
        type: [SimpleSchema.RegEx.Id],
        minCount: 0,
        popoverText: 'References of earlier updates or related publications',
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

    // second row
    agent: {
        label: 'Agent',
        type: String,
        min: 1,
        popoverText: 'As reported',
        placeholderText: 'e.g., Trichloroethylene',
        typeaheadMethod: 'searchHumanExposureAgents',
    },
    comments: {
        label: 'Comments',
        type: String,
        optional: true,
        popoverText: 'Other relevant information or working-group comments. For human in-vivo data, this may include any co-exposures, strengths, limitations, or extent to which chance, bias, or confounding could explain the results.',
        textAreaRows: 3,
    },
};
