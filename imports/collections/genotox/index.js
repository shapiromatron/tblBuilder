import {Meteor} from 'meteor/meteor';

import _ from 'underscore';

import Tables from '/imports/collections/tables';
import Reference from '/imports/collections/reference';

import collSorts from '../sorts';
import { attachTableSchema } from '../schemas';

import {
    htmlToDocx,
} from '/imports/api/utilities';


import schema_extension from './schema';
import {
    dataClass,
    phylogeneticClasses,
    mammalianTestSpecies,
    sexes,
    resultOptions,
} from './constants';
import testCrosswalk from './testCrosswalk';


var instanceMethods = {
        setWordFields: function() {
            var ext = {
                wrd_comments: this.comments || '',
                wrd_led: this.led || '',
                wrd_significance: this.significance || '',
                col2: htmlToDocx(this.getHtmlCol2()),
                col3: htmlToDocx(this.getHtmlCol3()),
                col4: htmlToDocx(this.getHtmlCol4()),
                col5: htmlToDocx(this.getHtmlCol5()),
                col6: htmlToDocx(this.getHtmlCol6()),
                col7: htmlToDocx(this.getHtmlCol7()),
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
                ext.wrd_colA = (this.testSpeciesMamm === 'Human')?
                    this.testSpeciesMamm:
                    this.speciesMamm;
            }

            if (this.dualResult) {
                ext.wrd_resultA = this.resultNoMetabolic;
                ext.wrd_resultB = this.resultMetabolic;
            } else {
                ext.wrd_resultA = this.result;
                if (this.dataClass.indexOf('vitro') >= 0 ||
                    this.dataClass.indexOf('Non-mammalian') >= 0) {
                    ext.wrd_resultB = '';
                } else {
                    ext.wrd_resultB = 'NA';
                }
            }

            _.extend(this, ext);
        },
        getHtmlCol1: function() {
            return this.dataClass;
        },
        getHtmlCol2: function() {
            var txt,
                d = this;
            switch (d.dataClass) {
            case 'Non-mammalian':
                if (GenotoxEvidence.isGenotoxAcellular(d.dataClass, d.phylogeneticClass)) {
                    txt = `${d.phylogeneticClass}<br>${d.testSystem}`;
                } else {
                    txt = `${d.phylogeneticClass}<br>${d.speciesNonMamm}&nbsp;${d.strainNonMamm}`;
                }
                break;
            case 'Mammalian and human in vitro':
                txt = `${d.speciesMamm}<br>${d.tissueCellLine}`;
                break;
            case 'Animal in vivo':
                txt = `${d.species}&nbsp${d.strain}&nbsp${d.sex}<br>${d.tissueAnimal}`;
                break;
            case 'Human in vivo':
                txt = `${d.tissueHuman}, ${d.cellType}<br>${d.exposureDescription}`;
                break;
            default:
                console.log('unknown data-type: {#d.dataClass}');
            }
            return txt;
        },
        getHtmlCol3: function() {
            return this.endpoint + '/<br>' + this.endpointTest;
        },
        getHtmlCol4: function(){
            var txt;
            if (this.dualResult) {
                txt = this.resultNoMetabolic;
            } else {
                txt = this.result;
            }
            if (this.dataClass === 'Human in vivo' && this.significance) {
                txt += '&nbsp;' + this.significance;
            }
            return txt;
        },
        getHtmlCol5: function() {
            var txt;
            if (this.dualResult) {
                txt = this.resultMetabolic;
            } else {
                if (this.dataClass.indexOf('vitro') >= 0 || this.dataClass.indexOf('Non-mammalian') >= 0) {
                    txt = '';
                } else {
                    txt = 'NA';
                }
            }
            return txt;
        },
        getHtmlCol6: function() {
            var txt = this.agent;
            if (this.led) {
                txt += ',<br>' + this.led + ' ' + this.units;
            }
            if (this.dosingRoute){
                txt += ', ' + this.dosingRoute;
            }
            if (this.dosingDuration) {
                txt += ', ' + this.dosingDuration;
            }
            return txt;
        },
        getHtmlCol7: function() {
            return this.comments || '';
        },
        setNonMammalianExperimentText: function(d) {
            var txt = '' + d.agent;
            if ((d.led != null) && d.led !== '') txt += '\n' + d.led;
            txt += ' ' + d.units;
            if (d.dosingDuration != null) txt += '\n' + d.dosingDuration;
            return txt;
        },
        getReference: function(){
            if (_.isUndefined(this.reference)){
                this.reference = Reference.findOne(this.referenceID);
            }
            return this.reference;
        },
    },
    classMethods = {
        dataClass,
        phylogeneticClasses,
        mammalianTestSpecies,
        sexes,
        resultOptions,
        testCrosswalk,
        getTableEvidence: function(tbl_id){
            return GenotoxEvidence
                .find({tbl_id: tbl_id}, {sort: {sortIdx: 1}})
                .fetch();
        },
        tabular: function(tbl_id) {
            let qs = GenotoxEvidence.getTableEvidence(tbl_id),
                header = [
                    'Genotoxicity ID', 'Reference', 'Pubmed ID',
                    'Data class', 'Agent', 'Plylogenetic class', 'Test system',
                    'Non-mammalian species', 'Non-mammalian strain',
                    'Mammalian species', 'Mammalian strain', 'Tissue/Cell line', 'Species', 'Strain', 'Sex',
                    'Tissue, animal', 'Tissue, human', 'Cell type', 'Exposure description',
                    'Endpoint', 'Endpoint test', 'Dosing route', 'Dosing duration/regimen',
                    'Units', 'Dual results?', 'Result',
                    'Result, metabolic activation', 'Result, no metabolic activation',
                    'LED/HID', 'Significance', 'Comments',
                ],
                data;

            data = _.map(qs, function(d){
                d.getReference();
                return [
                    d._id, d.reference.name, d.reference.pubmedID,
                    d.dataClass, d.agent, d.phylogeneticClass,
                    d.testSystem, d.speciesNonMamm, d.strainNonMamm,
                    d.testSpeciesMamm, d.speciesMamm, d.tissueCellLine,
                    d.species, d.strain, d.sex,
                    d.tissueAnimal, d.tissueHuman, d.cellType,
                    d.exposureDescription, d.endpoint, d.endpointTest,
                    d.dosingRoute, d.dosingDuration,
                    d.units, d.dualResult, d.result,
                    d.resultMetabolic, d.resultNoMetabolic,
                    d.led, d.significance, d.comments,
                ];
            });
            data.unshift(header);
            return data;
        },
        isGenotoxAcellular: function(dataClass, phylogeneticClass) {
            var dcls = 'Non-mammalian',
                acell = 'Acellular systems';
            return (dataClass === dcls) && (phylogeneticClass === acell);
        },
        wordReportFormats: [
            {
                'type': 'GenotoxTables',
                'fn': 'genotoxicity',
                'text': 'Download Word (by data-class)',
            },
            {
                'type': 'GenotoxHtmlTables',
                'fn': 'genotoxicity',
                'text': 'Download Word (HTML re-creation)',
            },
        ],
        wordContext: function(tbl_id) {
            let resp = GenotoxEvidence.wordHtmlContext(tbl_id);
            return {
                table: resp.table,
                nonMammalianInVitro:
                    _.filter(resp.objects, (v) => v.dataClass === 'Non-mammalian'),
                mammalianInVitro: _.chain(resp.objects)
                    .filter((v) => v.dataClass === 'Mammalian and human in vitro')
                    .sortBy((v) => v.testSpeciesMamm + v.speciesMamm)
                    .value(),
                animalInVivo:
                    _.filter(resp.objects, (v) => v.dataClass === 'Animal in vivo'),
                humanInVivo:
                    _.filter(resp.objects, (v) => v.dataClass === 'Human in vivo'),
            };
        },
        wordHtmlContext: function(tbl_id){
            var tbl = Tables.findOne(tbl_id),
                vals = GenotoxEvidence.find(
                            {tbl_id: tbl_id, isHidden: false},
                            {sort: {sortIdx: 1}}
                        ).fetch();

            vals.forEach(function(val){
                val.reference = Reference.findOne({_id: val.referenceID});
                val.setWordFields();
            });

            return {
                table: tbl,
                objects: vals,
            };
        },
        sortFields: {
            'Data class':
                _.partial(collSorts.sortByFieldOrder, dataClass, 'dataClass'),
            'Agent':
                _.partial(collSorts.sortByTextField, 'agent'),

            'Phylogenetic class (non-mammalian)':
                _.partial(collSorts.sortByFieldOrder, phylogeneticClasses, 'phylogeneticClass'),
            'Test system (non-mammalian: acellular)':
                _.partial(collSorts.sortByTextField, 'testSystem'),
            'Species (non-mammalian: cellular)':
                _.partial(collSorts.sortByTextField, 'speciesNonMamm'),
            'Strain (non-mammalian: cellular)':
                _.partial(collSorts.sortByTextField, 'strainNonMamm'),

            'Test species class (mammalian: cellular)':
                _.partial(collSorts.sortByFieldOrder, mammalianTestSpecies, 'testSpeciesMamm'),
            'Species (cellular: mammalian)':
                _.partial(collSorts.sortByTextField, 'speciesMamm'),
            'Tissue (cellular: mammalian)':
                _.partial(collSorts.sortByTextField, 'tissueCellLine'),

            'Species (animal in-vivo)':
                _.partial(collSorts.sortByTextField, 'species'),
            'Strain (animal in-vivo)':
                _.partial(collSorts.sortByTextField, 'strain'),
            'Sex (animal in-vivo)':
                _.partial(collSorts.sortByFieldOrder, sexes, 'sex'),

            'Tissue (human in-vivo)':
                _.partial(collSorts.sortByTextField, 'tissueHuman'),
            'Cell type (human in-vivo)':
                _.partial(collSorts.sortByTextField, 'cellType'),

            'Endpoint':
                _.partial(collSorts.sortByTextField, 'endpoint'),
            'Endpoint test':
                _.partial(collSorts.sortByTextField, 'endpointTest'),
            'Reference':
                collSorts.sortByReference,
        },
    },
    GenotoxEvidence = new Meteor.Collection('genotoxEvidence', {
        transform: function (doc) {
            return  _.extend(Object.create(instanceMethods), doc);
        },
    });


_.extend(GenotoxEvidence, classMethods);
attachTableSchema(GenotoxEvidence, schema_extension);

export default GenotoxEvidence;
