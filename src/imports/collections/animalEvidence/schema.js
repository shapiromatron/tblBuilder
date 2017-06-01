import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import {
    studyDesigns,
    sexes,
} from './constants';


export default {
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
    studyDesign: {
        label: 'Data class',
        type: String,
        allowedValues: studyDesigns,
        popoverText: 'As reported',
    },
    species: {
        label: 'Species',
        type: String,
        min: 1,
        popoverText: 'As reported',
        typeaheadMethod: 'searchAnimalSpecies',
        placeholderText: 'Mouse, Rat, Hamster',
    },
    strain: {
        label: 'Strain',
        type: String,
        min: 1,
        popoverText: 'As reported',
        typeaheadMethod: 'searchAnimalStrain',
        placeholderText: 'B6C3F1, F344',
    },
    sex: {
        label: 'Sex',
        type: String,
        allowedValues: sexes,
        popoverText: 'As reported',
    },
    agent: {
        label: 'Agent',
        type: String,
        min: 1,
        popoverText: 'As reported',
        typeaheadMethod: 'searchAnimalAgent',
        placeholderText: 'Trichloroethylene, Asbestos',
    },
    purity: {
        label: 'Purity',
        type: String,
        min: 1,
        popoverText: 'As reported; for mixtures use NR (not reported)',
        typeaheadMethod: 'searchAnimalPurity',
        placeholderText: '>99.9%, technical grade',
    },
    dosingRoute: {
        label: 'Dosing route',
        type: String,
        min: 1,
        popoverText: 'As reported',
        typeaheadMethod: 'searchAnimalDosingRoute',
        placeholderText: 'Gavage, feed, i.p.',
    },
    vehicle: {
        label: 'Vehicle',
        type: String,
        min: 1,
        popoverText: 'As reported',
        typeaheadMethod: 'searchAnimalVehicle',
        placeholderText: 'distilled water, PBS, saline, air',
    },
    ageAtStart: {
        label: 'Age at start',
        type: String,
        min: 1,
        popoverText: 'Age at start of exposure',
        placeholderText: '6-8 wk old, 2 mo old, newborn',
    },
    duration: {
        label: 'Duration',
        type: String,
        min: 1,
        popoverText: 'Exposure duration including additional observation time (if any)',
        placeholderText: '110 wk, 24 mo, lifetime',
    },
    dosingRegimen: {
        label: 'Dosing regimen',
        type: String,
        min: 1,
        popoverText: 'Dosing regimen of the agent tested (i.e., duration and frequency <b style="color: red;">[Do not enter the concentrations of the agent tested here]</b>), and (if any) information on any co-exposure or modifying factors (e.g., NDEA, TPA, Aflatoxin B1, UV) including route, concentration and dosing regimen',
        placeholderText: '2x/d for 103 wk; 2x/wk for 20 mo',
    },
    strengths: {
        label: 'Principal strengths',
        type: [String],
        minCount: 0,
        popoverText: 'e.g., GLP study, multiple doses tested, high number of animals per group',
        typeaheadMethod: 'searchAnimalStrengths',
    },
    limitations: {
        label: 'Principal limitations',
        type: [String],
        minCount: 0,
        popoverText: 'e.g., inadequate duration, no controls, small number of animals per group, inadequate reporting of exposure or results, high mortality, MTD not reached',
        typeaheadMethod: 'searchAnimalLimitations',
    },
    comments: {
        label: 'Other comments',
        type: String,
        optional: true,
        popoverText: 'Other relevant information or Working Group comments',
        textAreaRows: 3,
    },
};
