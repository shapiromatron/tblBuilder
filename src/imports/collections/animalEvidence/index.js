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


let sharedClassMethods = {
    getDoses(e) {
        if (e) {
            let units = e.units || '',
                arr = _.chain(e.endpointGroups)
                    .pluck('dose')
                    .compact()
                    .value();
            return (arr.length>0)?
                `${arr.join(', ')} ${units}`:
                'NR';
        } else {
            return 'NR';
        }
    },
    getNStarts(e) {
        if (e) {
            let arr = _.chain(e.endpointGroups)
                .pluck('nStart')
                .compact()
                .value();
            return (arr.length>0)? arr.join(', '): 'NR';
        } else {
            return 'NR';
        }
    },
    getNSurvivings(e) {
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
    getIncidents(egs) {
        var val;
        if (_.pluck(egs, 'incidence').join('').length > 0) {
            val = egs.map((v)=>v.incidence).join(', ');
            return 'Tumour incidence: ' + val;
        } else {
            return '';
        }
    },
    getMultiplicities(egs) {
        var val;
        if (_.pluck(egs, 'multiplicity').join('').length > 0) {
            val = egs.map((v)=>v.multiplicity || 'NR').join(', ');
            return 'Tumour multiplicity: ' + val;
        } else {
            return '';
        }
    },
};


let instanceMethods = {
        setWordFields: function() {
            let first = (this.results.length > 0)?this.results[0]: null;

            this.results.forEach(function(ep){
                _.extend(ep, {
                    wrd_incidents: AnimalEvidence.getIncidents(ep.endpointGroups),
                    wrd_multiplicities: AnimalEvidence.getMultiplicities(ep.endpointGroups),
                    wrd_total_tumours: AnimalEvidence.getTotalTumours(ep.endpointGroups),
                    wrd_incidence_significance: ep.incidence_significance || '',
                    wrd_multiplicity_significance: ep.multiplicity_significance || '',
                    wrd_total_tumours_significance: ep.total_tumours_significance || '',
                });
            });

            _.extend(this, {
                wrd_strengths: this.strengths.join(', ') || 'None',
                wrd_limitations: this.limitations.join(', ') || 'None',
                wrd_comments: this.comments || 'None',
                wrd_doses: AnimalEvidence.getDoses(first),
                wrd_nStarts: AnimalEvidence.getNStarts(first),
                wrd_nSurvivings: AnimalEvidence.getNSurvivings(first),
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
    classMethods = _.extend({
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
                    'Evidence ID', 'Reference', 'Reference year', 'Pubmed ID', 'Study design',
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
                        ag._id, ag.reference.name, ag.reference.getYear(), ag.reference.pubmedID,
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
                        .map((v)=>v.dose)
                        .join(', ') + ' ' + e.units;
            } else {
                return 'NR';
            }
        },
        getNStarts: function(e) {
            if (e) {
                return e.endpointGroups
                        .map((v)=>v.nStart)
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
                val = egs.map((v)=>v.incidence).join(', ');
                return 'Tumour incidence: ' + val;
            } else {
                return '';
            }
        },
        getMultiplicities: function(egs) {
            var val;
            if (_.pluck(egs, 'multiplicity').join('').length > 0) {
                val = egs.map((v)=>v.multiplicity || 'NR').join(', ');
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
                el.getResults();
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
    }, sharedClassMethods),
    AnimalEvidence = new Meteor.Collection('animalEvidence', {
        transform: function (doc) {
            return  _.extend(Object.create(instanceMethods), doc);
        },
    });

_.extend(AnimalEvidence, classMethods);
attachTableSchema(AnimalEvidence, schema_extension);

export default AnimalEvidence;
export { sharedClassMethods };
