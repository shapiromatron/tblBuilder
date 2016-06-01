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
        label: 'Tumor incidence',
        type: String,
        optional: true,
        popoverText: 'N of tumor-bearing animals/N of animals at risk (%)[use N at start if N at risk is unknown]. Add asterisk(s) to identify a pairwise significance (e.g.: 4/10 (40.0)*, 6/37 (16.2), 6/50 (12.0)**)',
    },
    multiplicity: {
        label: 'Tumor multiplicity',
        type: String,
        optional: true,
        popoverText: 'Mean number of tumors per tumor-bearing animal.',
    },
});
