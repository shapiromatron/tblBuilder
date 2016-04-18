import {Meteor} from 'meteor/meteor';

import _ from 'underscore';

import Tables from '/imports/api/shared/tables';
import AnimalEndpointEvidence from '/imports/api/shared/animalResult';
import Reference from '/imports/api/shared/reference';

import collSorts from '../sorts';
import { attachTableSchema } from '../schemas';

import schema_extension from './schema';
import {
    studyDesigns,
    sexes,
} from './constants';



let instanceMethods = {
        setWordFields: function() {
            var endpoints = AnimalEndpointEvidence.find({parent_id: this._id}).fetch(),
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
            if (_.isEmpty(this.reference)){
                this.reference = Reference.findOne(this.referenceID);
            }
            return this.reference;
        },
    },
    classMethods = {
        studyDesigns,
        sexes,
        tabular: function(tbl_id) {
            var data, getEndpointData, header, i, len, limitations, reference, row, rows, strengths, v, vals;
            getEndpointData = function(parent_id, row) {
                var eg, i, j, len, len1, ref, row2, row3, rows, signifs, v, vals;
                vals = AnimalEndpointEvidence
                    .find({parent_id: parent_id}, {sort: {sortIdx: 1}}).fetch();
                rows = [];
                for (i = 0, len = vals.length; i < len; i++) {
                    v = vals[i];
                    row2 = row.slice();
                    row2.push(v._id, v.tumourSite, v.histology, v.units);
                    signifs = [
                        v.incidence_significance, v.multiplicity_significance,
                        v.total_tumours_significance
                    ];
                    ref = v.endpointGroups;
                    for (j = 0, len1 = ref.length; j < len1; j++) {
                        eg = ref[j];
                        row3 = row2.slice();
                        row3.push(
                            eg.dose, eg.nStart, eg.nSurviving,
                            eg.incidence, eg.multiplicity, eg.totalTumours);
                        row3.push.apply(row3, signifs);
                        rows.push(row3);
                    }
                }
                return rows;
            };
            vals = AnimalEvidence.find({tbl_id: tbl_id}, {sort: {sortIdx: 1}}).fetch();
            header = [
                'Evidence ID', 'Reference', 'Pubmed ID', 'Study design',
                'Species', 'Strain', 'Sex', 'Agent', 'Purity', 'Dosing route',
                'Vehicle', 'Age at start', 'Duration', 'Dosing Regimen',
                'Strengths', 'Limitations', 'Comments', 'Endpoint ID',
                'Tumour site', 'Histology', 'Units', 'Dose', 'N at Start',
                'N Surviving', 'Incidence', 'Multiplicity', 'Total Tumours',
                'Incidence significance', 'Multiplicity significance',
                'Total tumours significance'
            ];
            data = [header];
            for (i = 0, len = vals.length; i < len; i++) {
                v = vals[i];
                reference = Reference.findOne({_id: v.referenceID});
                strengths = v.strengths.join(', ');
                limitations = v.limitations.join(', ');
                row = [
                    v._id, reference.name, reference.pubmedID, v.studyDesign,
                    v.species, v.strain, v.sex, v.agent, v.purity, v.dosingRoute,
                    v.vehicle, v.ageAtStart, v.duration, v.dosingRegimen,
                    strengths, limitations, v.comments
                ];
                rows = getEndpointData(v._id, row);
                data.push.apply(data, rows);
            }
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
                    .find({tbl_id: tbl_id}, {sort: {sortIdx: 1}})
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
