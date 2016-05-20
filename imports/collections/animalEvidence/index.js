import {Meteor} from 'meteor/meteor';

import _ from 'underscore';

import Tables from '/imports/collections/tables';
import AnimalEndpointEvidence from '/imports/collections/animalResult';
import Reference from '/imports/collections/reference';

import collSorts from '../sorts';
import { attachTableSchema } from '../schemas';

import schema_extension from './schema';
import {
    studyDesigns,
    sexes,
} from './constants';



let instanceMethods = {
        setWordFields: function() {
            var endpoints = AnimalEndpointEvidence
                    .find({parent_id: this._id, isHidden: false}).fetch(),
                firstE = (endpoints.length > 0) ? endpoints[0] : null;

            endpoints.forEach(function(eps){
                _.extend(eps, {
                    wrd_incidents: AnimalEvidence.getIncidents(eps.endpointGroups),
                    wrd_multiplicities: AnimalEvidence.getMultiplicities(eps.endpointGroups),
                    wrd_total_tumours: AnimalEvidence.getTotalTumours(eps.endpointGroups),
                    wrd_incidence_significance: eps.incidence_significance || '',
                    wrd_multiplicity_significance: eps.multiplicity_significance || '',
                    wrd_total_tumours_significance: eps.total_tumours_significance || '',
                });
            });

            _.extend(this, {
                endpoints: endpoints,
                wrd_strengths: this.strengths.join(', ') || 'None',
                wrd_limitations: this.limitations.join(', ') || 'None',
                wrd_comments: this.comments || 'None',
                wrd_doses: AnimalEvidence.getDoses(firstE),
                wrd_nStarts: AnimalEvidence.getNStarts(firstE),
                wrd_nSurvivings: AnimalEvidence.getNSurvivings(firstE),
            });
        },
        getReference: function(){
            if (_.isUndefined(this.reference)){
                this.reference = Reference.findOne(this.referenceID);
            }
            return this.reference;
        },
        getResults: function(){
            if (_.isUndefined(this.results)){
                this.results = AnimalEndpointEvidence
                        .find({parent_id: this._id}, {sort: {sortIdx: 1}})
                        .fetch();
            }
            return this.results;
        },
    },
    classMethods = {
        studyDesigns,
        sexes,
        getTableEvidence: function(tbl_id){
            return AnimalEvidence
                .find({tbl_id: tbl_id}, {sort: {sortIdx: 1}})
                .fetch();
        },
        tabular: function(tbl_id) {
            let qs = AnimalEvidence.getTableEvidence(tbl_id),
                getEndpointData = function(results, row) {
                    let rows = [];
                    results.forEach(function(res){
                        let row2 = row.slice();
                        row2.push(
                            res._id, res.tumourSite, res.histology, res.units
                        );
                        res.endpointGroups.forEach(function(eg){
                            let row3 = row2.slice();
                            row3.push(
                                eg.dose, eg.nStart, eg.nSurviving,
                                eg.incidence, eg.multiplicity, eg.totalTumours);
                            row3.push.apply(row3, [
                                res.incidence_significance,
                                res.multiplicity_significance,
                                res.total_tumours_significance,
                            ]);
                            rows.push(row3);
                        });
                    });
                    return rows;
                },
                header = [
                    'Evidence ID', 'Reference', 'Pubmed ID', 'Study design',
                    'Species', 'Strain', 'Sex', 'Agent', 'Purity', 'Dosing route',
                    'Vehicle', 'Age at start', 'Duration', 'Dosing Regimen',
                    'Strengths', 'Limitations', 'Comments', 'Endpoint ID',
                    'Tumour site', 'Histology', 'Units', 'Dose', 'N at Start',
                    'N Surviving', 'Incidence', 'Multiplicity', 'Total Tumours',
                    'Incidence significance', 'Multiplicity significance',
                    'Total tumours significance',
                ],
                data = [header];

            _.each(qs, function(ag){
                ag.getReference();
                ag.getResults();
                let row = [
                        ag._id, ag.reference.name, ag.reference.pubmedID,
                        ag.studyDesign, ag.species, ag.strain,
                        ag.sex, ag.agent, ag.purity, ag.dosingRoute,
                        ag.vehicle, ag.ageAtStart, ag.duration,
                        ag.dosingRegimen,
                        ag.strengths.join(', '),
                        ag.limitations.join(', '),
                        ag.comments,
                    ],
                    rows = getEndpointData(ag.results, row);

                data.push.apply(data, rows);
            });
            return data;
        },
        getDoses: function(e) {
            if (e) {
                return e.endpointGroups
                        .map(function(v) {return v.dose;})
                        .join(', ') + ' ' + e.units;
            } else {
                return 'NR';
            }
        },
        getNStarts: function(e) {
            if (e) {
                return e.endpointGroups
                        .map(function(v) {return v.nStart;})
                        .join(', ');
            } else {
                return 'NR';
            }
        },
        getNSurvivings: function(e) {
            var numeric, survivings;
            if ((e == null) || (e.endpointGroups == null)) return 'NR';
            numeric = false;
            survivings = e.endpointGroups
                .map(function(eg) {
                    if ((eg.nSurviving != null) && eg.nSurviving !== '') {
                        numeric = true;
                        return eg.nSurviving;
                    } else {
                        return 'NR';
                    }
                });
            if (numeric) {
                return survivings.join(', ');
            } else {
                return 'NR';
            }
        },
        getIncidents: function(egs) {
            var val;
            if (_.pluck(egs, 'incidence').join('').length > 0) {
                val = egs.map(function(v) {return v.incidence;}).join(', ');
                return 'Tumour incidence: ' + val;
            } else {
                return '';
            }
        },
        getMultiplicities: function(egs) {
            var val;
            if (_.pluck(egs, 'multiplicity').join('').length > 0) {
                val = egs.map(function(v) {return v.multiplicity || 'NR';}).join(', ');
                return 'Tumour multiplicity: ' + val;
            } else {
                return '';
            }
        },
        getTotalTumours: function(egs) {
            var val;
            if (_.pluck(egs, 'totalTumours').join('').length > 0) {
                val = egs.map(function(v) {return v.totalTumours || 'NR';}).join(', ');
                return 'Total tumours: ' + val;
            } else {
                return '';
            }
        },
        wordReportFormats: [
            {
                'type': 'AnimalHtmlTables',
                'fn': 'animal',
                'text': 'Download Word',
            },
        ],
        wordContext: function(tbl_id) {
            var tbl = Tables.findOne(tbl_id),
                evidences = AnimalEvidence
                    .find({tbl_id: tbl_id, isHidden: false}, {sort: {sortIdx: 1}})
                    .fetch();

            evidences.forEach(function(el){
                el.reference = Reference.findOne({_id: el.referenceID});
                el.setWordFields();
            });

            return {
                'table': tbl,
                'studies': evidences,
            };
        },
        sortFields: {
            'Study design': _.partial(collSorts.sortByFieldOrder, studyDesigns, 'studyDesign'),
            'Species':      _.partial(collSorts.sortByTextField, 'species'),
            'Strain':       _.partial(collSorts.sortByTextField, 'strain'),
            'Sex':          _.partial(collSorts.sortByFieldOrder, sexes, 'sex'),
            'Reference':    collSorts.sortByReference,
            'Agent':        _.partial(collSorts.sortByTextField, 'agent'),
        },
    },
    AnimalEvidence = new Meteor.Collection('animalEvidence', {
        transform: function (doc) {
            return  _.extend(Object.create(instanceMethods), doc);
        },
    });

_.extend(AnimalEvidence, classMethods);
attachTableSchema(AnimalEvidence, schema_extension);

export default AnimalEvidence;
