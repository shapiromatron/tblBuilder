var instanceMethods = {
    setWordFields: function() {
        var ext = {
            wrd_comments: this.comments || '',
            wrd_led: this.led || '',
            wrd_significance: this.significance || '',
        };

        switch (this.dataClass) {
        case 'Non-mammalian':
            if (GenotoxEvidence.isGenotoxAcellular(this.dataClass, this.phylogeneticClass)) {
                ext.wrd_testSystem = this.testSystem;
            } else {
                ext.wrd_testSystem = this.speciesNonMamm + ' ' + this.strainNonMamm;
            }
            ext.wrd_experimental = this.setNonMammalianExperimentText(this);
            break;
        case 'Mammalian and human in vitro':
            ext.wrd_colA = (this.testSpeciesMamm === 'Human') ? this.testSpeciesMamm : this.speciesMamm;
        }

        if (this.dualResult) {
            ext.wrd_resultA = this.resultNoMetabolic;
            ext.wrd_resultB = this.resultMetabolic;
        } else {
            ext.wrd_resultA = this.result;
            if (this.dataClass.indexOf('vitro') >= 0 || this.dataClass.indexOf('Non-mammalian') >= 0) {
                ext.wrd_resultB = '';
            } else {
                ext.wrd_resultB = 'NA';
            }
        }

        _.extend(this, ext);
    },
    setNonMammalianExperimentText: function(d) {
        var txt = '' + d.agent;
        if ((d.led != null) && d.led !== '') txt += '\n' + d.led;
        txt += ' ' + d.units;
        if (d.dosingDuration != null) txt += '\n' + d.dosingDuration;
        return txt;
    },
    getReference: function(){
        if (_.isEmpty(this.reference)){
            this.reference = Reference.findOne(this.referenceID);
        }
        return this.reference;
    },
};
GenotoxEvidence = new Meteor.Collection('genotoxEvidence', {
    transform: function (doc) {
        return  _.extend(Object.create(instanceMethods), doc);
    },
});


// collection class methods/attributes
var dataClass = [
        'Non-mammalian',
        'Mammalian and human in vitro',
        'Animal in vivo',
        'Human in vivo',
    ],
    phylogeneticClasses = [
        'Acellular systems',
        'Prokaryote (bacteria)',
        'Lower eukaryote (yeast, mold)',
        'Insect',
        'Plant systems',
        'Other (fish, worm, bird, etc)',
    ],
    mammalianTestSpecies = [
        'Human',
        'Non-human mammalian',
    ],
    sexes = [
        'Male',
        'Female',
        'Male and female',
        'NR',
    ];
_.extend(GenotoxEvidence, {
    dataClass: dataClass,
    phylogeneticClasses: phylogeneticClasses,
    mammalianTestSpecies: mammalianTestSpecies,
    sexes: sexes,
    resultOptions: [
        '+',
        '(+)',
        '+/-',
        '(-)',
        '-',
        'Not tested',
    ],
    tabular: function(tbl_id) {
        var data, header, i, len, ref, row, v, vals;
        vals = GenotoxEvidence.find({tbl_id: tbl_id}, {sort: {sortIdx: 1}}).fetch();
        header = [
            'Genotoxicity ID', 'Reference', 'Pubmed ID', 'Data class',
            'Agent', 'Plylogenetic class', 'Test system',
            'Non-mammalian species', 'Non-mammalian strain', 'Mammalian species',
            'Mammalian strain', 'Tissue/Cell line', 'Species', 'Strain', 'Sex',
            'Tissue, animal', 'Tissue, human', 'Cell type', 'Exposure description',
            'Endpoint', 'Endpoint test', 'Dosing route', 'Dosing duration/regimen',
            'Units', 'Dual results?', 'Result',
            'Result, metabolic activation', 'Result, no metabolic activation',
            'LED/HID', 'Significance', 'Comments',
        ];
        data = [header];
        for (i = 0, len = vals.length; i < len; i++) {
            v = vals[i];
            ref = Reference.findOne({_id: v.referenceID});
            row = [
                v._id, ref.name, ref.pubmedID, v.dataClass,
                v.agent, v.phylogeneticClass, v.testSystem,
                v.speciesNonMamm, v.strainNonMamm, v.testSpeciesMamm,
                v.speciesMamm, v.tissueCellLine, v.species, v.strain, v.sex,
                v.tissueAnimal, v.tissueHuman, v.cellType, v.exposureDescription,
                v.endpoint, v.endpointTest, v.dosingRoute, v.dosingDuration,
                v.units, v.dualResult, v.result,
                v.resultMetabolic, v.resultNoMetabolic,
                v.led, v.significance, v.comments];
            data.push(row);
        }
        return data;
    },
    testCrosswalk: {
        'Non-mammalian': {
            'Acellular systems': {
                'Genotox': {
                    'DNA damage': ['DNA adducts', 'DNA strand breaks', 'DNA cross-links', 'Intercalation', 'Other'],
                },
            },
            'Prokaryote (bacteria)': {
                'Genotox': {
                    'DNA damage': ['DNA strand breaks', 'DNA cross-links', 'Other'],
                    'Mutation': ['Reverse mutation', 'Forward mutation', 'Other'],
                    'DNA repair': ['Other'],
                },
            },
            'Lower eukaryote (yeast, mold)': {
                'Genotox': {
                    'DNA damage': ['DNA strand breaks', 'DNA cross-links', 'Other'],
                    'Mutation': ['Reverse mutation', 'Forward mutation', 'Gene conversion', 'Other'],
                    'Chromosomal damage': ['Chromosomal aberrations', 'Aneuploidy', 'Other'],
                },
            },
            'Insect': {
                'Genotox': {
                    'Mutation': ['Somatic mutation and recombination test (SMART)', 'Sex-linked recessive lethal mutations', 'Heritable translocation test', 'Dominant lethal test', 'Other'],
                    'Chromosomal damage': ['Aneuploidy', 'Other'],
                    'DNA repair': ['Other'],
                },
            },
            'Plant systems': {
                'Genotox': {
                    'DNA damage': ['Unscheduled DNA synthesis', 'Other'],
                    'Chromosomal damage': ['Chromosomal aberrations', 'Micronuclei', 'Sister Chromatid Exchange', 'Aneuploidy', 'Other'],
                    'Mutation': ['Reverse mutation', 'Forward mutation', 'Gene conversion', 'Other'],
                },
            },
            'Other (fish, worm, bird, etc)': {
                'Genotox': {
                    'DNA damage': ['DNA adducts', 'DNA strand breaks', 'DNA cross-links', 'DNA oxidation', 'Unscheduled DNA synthesis', 'Other'],
                    'Mutation': ['Oncogene', 'Tumour suppressor', 'Other'],
                    'Chromosomal damage': ['Chromosomal aberrations', 'Micronuclei', 'Sister Chromatid Exchange', 'Aneuploidy', 'Other'],
                    'DNA repair': ['Other'],
                },
            },
        },
        'Mammalian and human in vitro': {
            'Human': {
                'Genotox': {
                    'DNA damage': ['DNA adducts', 'DNA strand breaks', 'DNA cross-links', 'DNA oxidation', 'Unscheduled DNA synthesis', 'Other'],
                    'Mutation': ['Oncogene', 'Tumour suppressor', 'Other'],
                    'Chromosomal damage': ['Chromosomal aberrations', 'Micronuclei', 'Sister Chromatid Exchange', 'Aneuploidy', 'Other'],
                    'DNA repair': ['Other'],
                    'Cell transformation': ['Other'],
                },
            },
            'Non-human mammalian': {
                'Genotox': {
                    'DNA damage': ['DNA adducts ', 'DNA strand breaks', 'DNA cross-links', 'DNA oxidation', 'Unscheduled DNA synthesis', 'Other'],
                    'Mutation': ['tk', 'hprt ', 'ouabain resistance', 'Other gene', 'Chromosomal damage', 'Chromosomal aberrations', 'Micronuclei', 'Sister Chromatid Exchange', 'Aneuploidy', 'Other'],
                    'Chromosomal damage': ['Chromosomal aberrations', 'Micronuclei', 'Sister Chromatid Exchange', 'Aneuploidy', 'Other'],
                    'DNA repair': ['Other'],
                    'Cell transformation': ['Other'],
                },
            },
        },
        'Animal in vivo': {
            'Genotox': {
                'DNA damage': ['DNA adducts', 'DNA strand breaks', 'DNA cross-links', 'DNA oxidation', 'Unscheduled DNA synthesis', 'Other'],
                'Mutation': ['Mouse spot test', 'Mouse specific locus test', 'Dominant lethal test', 'Transgenic animal tests ', 'Other'],
                'Chromosomal damage': ['Chromosomal aberrations', 'Micronuclei', 'Sister Chromatid Exchange', 'Aneuploidy', 'Other'],
                'DNA repair': ['Other'],
            },
        },
        'Human in vivo': {
            'Genotox': {
                'DNA damage': ['DNA adducts', 'DNA strand breaks', 'DNA cross-links', 'DNA oxidation', 'Unscheduled DNA synthesis', 'Other'],
                'Mutation': ['Oncogene', 'Tumour suppressor', 'Other'],
                'Chromosomal damage': ['Chromosomal aberrations', 'Micronuclei', 'Sister Chromatid Exchange', 'Aneuploidy', 'Other'],
                'DNA repair': ['Other'],
            },
        },
    },
    isGenotoxAcellular: function(dataClass, phylogeneticClass) {
        var dcls = 'Non-mammalian',
            acell = 'Acellular systems';
        return (dataClass === dcls) && (phylogeneticClass === acell);
    },
    getTestSystemDesc: function(d) {
        var txt;
        switch (d.dataClass) {
        case 'Non-mammalian':
            if (GenotoxEvidence.isGenotoxAcellular(d.dataClass, d.phylogeneticClass)) {
                txt = d.phylogeneticClass + '<br>' + d.testSystem;
            } else {
                txt = d.phylogeneticClass + '<br>' + d.speciesNonMamm + '&nbsp;' + d.strainNonMamm;
            }
            break;
        case 'Mammalian and human in vitro':
            txt = d.speciesMamm + '<br>' + d.tissueCellLine;
            break;
        case 'Animal in vivo':
            txt = d.species + '&nbsp;' + d.strain + '&nbsp;' + d.sex + '<br>' + d.tissueAnimal;
            break;
        case 'Human in vivo':
            txt = d.tissueHuman + ', ' + d.cellType + '<br>' + d.exposureDescription;
            break;
        default:
            console.log('unknown data-type: {#d.dataClass}');
        }
        return txt;
    },
    wordReportFormats: [
        {
            'type': 'GenotoxHtmlTables',
            'fn': 'genotoxicity',
            'text': 'Download Word',
        },
    ],
    wordContext: function(tbl_id) {
        var tbl = Tables.findOne(tbl_id),
            vals = GenotoxEvidence.find(
                        {tbl_id: tbl_id}, {sort: {sortIdx: 1}}
                    ).fetch();

        vals.forEach(function(val){
            val.reference = Reference.findOne({_id: val.referenceID});
            val.setWordFields();
        });

        return {
            table: tbl,
            nonMammalianInVitro: _
                .filter(vals, function(v){return v.dataClass === 'Non-mammalian';}),
            mammalianInVitro: _.chain(vals)
                .filter(function(v) {return v.dataClass === 'Mammalian and human in vitro';})
                .sortBy(function(v) {return v.testSpeciesMamm + v.speciesMamm;})
                .value(),
            animalInVivo: _
                .filter(vals, function(v) {return v.dataClass === 'Animal in vivo';}),
            humanInVivo: _
                .filter(vals, function(v) {return v.dataClass === 'Human in vivo';}),
        };
    },
    sortFields: {
        'Data class':    _.partial(libShared.sortByFieldOrder, dataClass, 'dataClass'),
        'Agent':         _.partial(libShared.sortByTextField, 'agent'),

        'Phylogenetic class (non-mammalian)':        _.partial(libShared.sortByFieldOrder, phylogeneticClasses, 'phylogeneticClass'),
        'Test system (non-mammalian: acellular)':    _.partial(libShared.sortByTextField, 'testSystem'),
        'Species (non-mammalian: cellular)':         _.partial(libShared.sortByTextField, 'speciesNonMamm'),
        'Strain (non-mammalian: cellular)':          _.partial(libShared.sortByTextField, 'strainNonMamm'),

        'Test species class (mammalian: cellular)':  _.partial(libShared.sortByFieldOrder, mammalianTestSpecies, 'testSpeciesMamm'),
        'Species (cellular: mammalian)':             _.partial(libShared.sortByTextField, 'speciesMamm'),
        'Tissue (cellular: mammalian)':              _.partial(libShared.sortByTextField, 'tissueCellLine'),

        'Species (animal in-vivo)':   _.partial(libShared.sortByTextField, 'species'),
        'Strain (animal in-vivo)':    _.partial(libShared.sortByTextField, 'strain'),
        'Sex (animal in-vivo)':       _.partial(libShared.sortByFieldOrder, sexes, 'sex'),

        'Tissue (human in-vivo)':     _.partial(libShared.sortByTextField, 'tissueHuman'),
        'Cell type (human in-vivo)':  _.partial(libShared.sortByTextField, 'cellType'),

        'Endpoint':         _.partial(libShared.sortByTextField, 'endpoint'),
        'Endpoint test':    _.partial(libShared.sortByTextField, 'endpointTest'),
        'Reference':        libShared.sortByReference,
    },
});


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

tblBuilderCollections.attachSchema(GenotoxEvidence, _.extend({
    // first row
    referenceID: {
        label: 'Reference',
        type: SimpleSchema.RegEx.Id,
    },
    dataClass: {
        label: 'Data class',
        type: String,
        allowedValues: GenotoxEvidence.dataClass,
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
        allowedValues: GenotoxEvidence.phylogeneticClasses,
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
        allowedValues: GenotoxEvidence.mammalianTestSpecies,
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
        allowedValues: GenotoxEvidence.sexes,
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
        allowedValues: GenotoxEvidence.resultOptions,
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
        allowedValues: GenotoxEvidence.resultOptions,
        popoverText: '<strong>Working Group judgment:</strong><ul><li>+, positive</li><li>–, negative</li><li>+/–, equivocal (variable response in several experiments within an adequate study)</li><li>(+) or (–), positive/negative in a study of limited quality (specify reason in comments, e.g. only a singe dose tested; data or methods not fully reported; confounding exposures, etc.)</li></ul>',
        forceRequiredSymbol: true,
    },
    resultNoMetabolic: {
        label: 'Result (without metabolic activation)',
        type: String,
        allowedValues: GenotoxEvidence.resultOptions,
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
}, tblBuilderCollections.base, tblBuilderCollections.table));
