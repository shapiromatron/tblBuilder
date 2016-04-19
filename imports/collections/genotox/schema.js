import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import {
    dataClass,
    phylogeneticClasses,
    mammalianTestSpecies,
    sexes,
    resultOptions,
} from './constants';


var reqNonMamm = function() {
        var isRequired = (this.field('dataClass').value === 'Non-mammalian') &&
                (this.value === '');
        if (isRequired) return 'required';
    },
    reqAcellular = function() {
        var isRequired = (this.field('dataClass').value === 'Non-mammalian') &&
                (this.field('phylogeneticClass').value === 'Acellular systems') &&
                (this.value === '');
        if (isRequired) return 'required';
    },
    reqNotAcellular = function() {
        var isRequired = (this.field('dataClass').value === 'Non-mammalian') &&
                (this.field('phylogeneticClass').value !== 'Acellular systems') &&
                (this.value === '');
        if (isRequired) return 'required';
    },
    reqMammVitro = function() {
        var isRequired = (this.field('dataClass').value === 'Mammalian and human in vitro') &&
                (this.value === '');
        if (isRequired) return 'required';
    },
    reqAniVivo = function() {
        var isRequired = (this.field('dataClass').value === 'Animal in vivo') &&
                (this.value === '');
        if (isRequired) return 'required';
    },
    reqHumanVivo = function() {
        var isRequired = (this.field('dataClass').value === 'Human in vivo') &&
                (this.value === '');
        if (isRequired) return 'required';
    },
    reqExpVivo = function() {
        var isRequired = ((this.field('dataClass').value === 'Animal in vivo') ||
                          (this.field('dataClass').value === 'Non-mammalian' &&
                           this.field('phylogeneticClass').value === 'Other (fish, worm, bird, etc)')) &&
                (this.value === '');
        if (isRequired) return 'required';
    };

export default {
    // first row
    referenceID: {
        label: 'Reference',
        type: SimpleSchema.RegEx.Id,
    },
    dataClass: {
        label: 'Data class',
        type: String,
        allowedValues: dataClass,
        popoverText: 'As reported',
    },
    agent: {
        label: 'Agent',
        type: String,
        min: 1,
        popoverText: 'As reported',
        placeholderText: 'Trichloroethylene',
        typeaheadMethod: 'searchGenotoxAgents',
    },

    // second row
    phylogeneticClass: {
        label: 'Phylogenetic class',
        type: String,
        allowedValues: phylogeneticClasses,
        optional: true,
        custom: reqNonMamm,
        forceRequiredSymbol: true,
        popoverText: 'As reported',
    },
    testSystem: {
        label: 'Test system',
        type: String,
        optional: true,
        custom: reqAcellular,
        forceRequiredSymbol: true,
        popoverText: 'As reported',
        placeholderText: 'Calf thymus DNA',
        typeaheadMethod: 'searchGenotoxTestSystem',
    },
    speciesNonMamm: {
        label: 'Species',
        type: String,
        optional: true,
        custom: reqNotAcellular,
        forceRequiredSymbol: true,
        popoverText: 'As reported',
        placeholderText: 'Salmonella typhimurium',
        typeaheadMethod: 'searchSpeciesNonMamm',
    },
    strainNonMamm: {
        label: 'Strain',
        type: String,
        optional: true,
        custom: reqNotAcellular,
        forceRequiredSymbol: true,
        popoverText: 'As reported',
        placeholderText: 'TA98',
        typeaheadMethod: 'searchStrainNonMamm',
    },
    testSpeciesMamm: {
        label: 'Test species class',
        type: String,
        allowedValues: mammalianTestSpecies,
        optional: true,
        custom: reqMammVitro,
        forceRequiredSymbol: true,
        popoverText: 'As reported',
    },
    speciesMamm: {
        label: 'Species',
        type: String,
        optional: true,
        custom: reqMammVitro,
        forceRequiredSymbol: true,
        popoverText: 'As reported',
        placeholderText: 'Human',
        typeaheadMethod: 'searchSpeciesMamm',
    },
    tissueCellLine: {
        label: 'Tissue, cell-line',
        type: String,
        optional: true,
        custom: reqMammVitro,
        forceRequiredSymbol: true,
        popoverText: 'As reported',
        placeholderText: 'Liver/HepG2',
        typeaheadMethod: 'searchTissueCellLine',
    },
    species: {
        label: 'Species',
        type: String,
        optional: true,
        custom: reqAniVivo,
        forceRequiredSymbol: true,
        popoverText: 'As reported',
        placeholderText: 'Mouse',
        typeaheadMethod: 'searchGenotoxSpecies',
    },
    strain: {
        label: 'Strain',
        type: String,
        optional: true,
        custom: reqAniVivo,
        forceRequiredSymbol: true,
        popoverText: 'If no strain specified, add common name in parentheses',
        placeholderText: 'B6C3F1',
        typeaheadMethod: 'searchGenotoxStrain',
    },
    sex: {
        label: 'Sex',
        type: String,
        allowedValues: sexes,
        optional: true,
        custom: reqAniVivo,
        forceRequiredSymbol: true,
        popoverText: 'As reported',
    },
    tissueAnimal: {
        label: 'Tissue',
        type: String,
        optional: true,
        custom: reqAniVivo,
        forceRequiredSymbol: true,
        popoverText: 'As reported',
        placeholderText: 'bone marrow',
        typeaheadMethod: 'searchGenotoxTissueAnimal',
    },
    tissueHuman: {
        label: 'Tissue',
        type: String,
        optional: true,
        custom: reqHumanVivo,
        forceRequiredSymbol: true,
        popoverText: 'As reported',
        placeholderText: 'skin',
        typeaheadMethod: 'searchGenotoxTissueHuman',
    },
    cellType: {
        label: 'Cell type (if specified)',
        type: String,
        optional: true,
        popoverText: 'As reported',
        placeholderText: 'endothelial',
        typeaheadMethod: 'searchGenotoxCellType',
    },
    exposureDescription: {
        label: 'Description of exposed and controls',
        type: String,
        optional: true,
        custom: reqHumanVivo,
        forceRequiredSymbol: true,
        popoverText: 'As reported',
        placeholderText: 'Farmers; 123,000; Australia',
    },

    // third row
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
    dualResult: {
        label: 'Metabolic activation tested?',
        type: Boolean,
        defaultValue: false,
        popoverText: 'Check if two-results are available: with and without exogenous metabolic activation',
    },
    dosingDuration: {
        label: 'Duration/regimen',
        type: String,
        optional: true,
        custom: reqExpVivo,
        forceRequiredSymbol: true,
        popoverText: '28 day; 2 week; 1x/week, as reported',
        placeholderText: '28 day (5x/week)',
    },
    dosingRoute: {
        label: 'Route',
        type: String,
        optional: true,
        custom: reqAniVivo,
        forceRequiredSymbol: true,
        popoverText: 'As reported',
        placeholderText: 'Drinking water',
        typeaheadMethod: 'searchGenotoxDosingRoute',
    },

    // fourth row
    result: {
        label: 'Result',
        type: String,
        allowedValues: resultOptions,
        popoverText: '<strong>Working Group judgment:</strong><ul><li>+, positive</li><li>–, negative</li><li>+/–, equivocal (variable response in several experiments within an adequate study)</li><li>(+) or (–), positive/negative in a study of limited quality (specify reason in comments, e.g. only a singe dose tested; data or methods not fully reported; confounding exposures, etc.)</li></ul>',
        forceRequiredSymbol: true,
    },
    led: {
        label: 'LED or HID',
        type: String,
        optional: true,
        popoverText: 'Lowest effective dose or highest ineffective dose, as reported',
        placeholderText: '100',
    },
    units: {
        label: 'Dosing units',
        type: String,
        min: 1,
        popoverText: 'As reported',
        placeholderText: 'μM',
        typeaheadMethod: 'searchGenotoxDosingUnits',
    },
    resultMetabolic: {
        label: 'Result (with metabolic activation)',
        type: String,
        allowedValues: resultOptions,
        popoverText: '<strong>Working Group judgment:</strong><ul><li>+, positive</li><li>–, negative</li><li>+/–, equivocal (variable response in several experiments within an adequate study)</li><li>(+) or (–), positive/negative in a study of limited quality (specify reason in comments, e.g. only a singe dose tested; data or methods not fully reported; confounding exposures, etc.)</li></ul>',
        forceRequiredSymbol: true,
    },
    resultNoMetabolic: {
        label: 'Result (without metabolic activation)',
        type: String,
        allowedValues: resultOptions,
        popoverText: '<strong>Working Group judgment:</strong><ul><li>+, positive</li><li>–, negative</li><li>+/–, equivocal (variable response in several experiments within an adequate study)</li><li>(+) or (–), positive/negative in a study of limited quality (specify reason in comments, e.g. only a singe dose tested; data or methods not fully reported; confounding exposures, etc.)</li></ul>',
        forceRequiredSymbol: true,
    },
    significance: {
        label: 'Significance',
        type: String,
        optional: true,
        popoverText: 'As reported',
        placeholderText: 'p<0.05',
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
