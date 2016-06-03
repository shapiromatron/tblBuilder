import { SimpleSchema } from 'meteor/aldeed:simple-schema';


export default new SimpleSchema({
    dose: {
        label: 'Dose',
        type: String,
        min: 1,
        popoverText: 'As reported',
    },
    nStart: {
        label: 'N at start',
        type: Number,
        decimal: false,
        optional: true,
        popoverText: 'As reported',
    },
    incidence: {
        label: 'Incidence',
        type: String,
        optional: true,
        popoverText: 'N of tumor-bearing animals/N of animals at risk [use N at start if N at risk is unknown] (e.g.: 4/10, 6/37, 6/50)',
    },
    incidencePercent: {
        label: '% Incidence',
        type: Number,
        optional: true,
        decimal: true,
        popoverText: '% of animal incidence, may be adjusted using poly-3 model (e.g. 0.0, 13.2, 95.0)',
    },
    incidenceSymbol: {
        label: 'Significance symbol',
        type: String,
        optional: true,
        popoverText: 'Add asterisk(s) to identify a pairwise significance, one for each footnote, or none (e.g.: *, **, ***)',
    },
    multiplicity: {
        label: 'Tumor multiplicity',
        type: String,
        optional: true,
        popoverText: 'Mean number of tumors per tumor-bearing animal.',
    },
});
