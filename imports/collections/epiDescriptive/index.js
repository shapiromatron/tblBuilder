import {Meteor} from 'meteor/meteor';

import _ from 'underscore';

import Tables from '/imports/collections/tables';
import Reference from '/imports/collections/reference';
import EpiResult from '/imports/collections/epiResult';

import collSorts from '../sorts';
import { attachTableSchema } from '../schemas';

import schema_extension from './schema';
import { getPercentOrText } from '/imports/api/utilities';

import {
    studyDesignOptions,
    exposureAssessmentTypeOptions,
    isCaseControl,
    hasCohort,
} from './constants';


let instanceMethods = {
        isCaseControl: function(){
            return EpiDescriptive.isCaseControl(this.studyDesign);
        },
        setWordFields: function() {
            _.extend(this, {
                reference: Reference.findOne({_id: this.referenceID}),
                isCaseControl: this.isCaseControl(),
                wrd_notes: this.notes || '',
                wrd_responseRateCase: getPercentOrText(this.responseRateCase),
                wrd_responseRateControl: getPercentOrText(this.responseRateControl),
            });

            if (_.isUndefined(this.reference)){
                console.error(`missing reference: ${this._id} (${this.referenceID})`);
            }
        },
        getReference: function(){
            if (_.isUndefined(this.reference)){
                this.reference = Reference.findOne(this.referenceID);
            }
            return this.reference;
        },
        getResults: function(){
            if (_.isUndefined(this.results)){
                this.results = EpiResult
                        .find({parent_id: this._id}, {sort: {sortIdx: 1}})
                        .fetch();
            }
            return this.results;
        },
    },
    classMethods = {
        studyDesignOptions,
        exposureAssessmentTypeOptions,
        isCaseControl: function(val){
            return isCaseControl(val);
        },
        hasCohort: function(val){
            return hasCohort(val);
        },
        getTableEvidence: function(tbl_id){
            return EpiDescriptive
                .find({tbl_id: tbl_id}, {sort: {sortIdx: 1}})
                .fetch();
        },
        tabular: function(tbl_id) {
            let getResultData = function(results, row) {
                    let rows = [];
                    _.each(results, function(res){
                        let covariates = res.covariates.join(', '),
                            row2 = row.slice();

                        row2.push(
                            res._id, res.organSite, res.effectMeasure,
                            res.effectUnits, res.stratum, res.trendTest,
                            covariates, res.covariatesControlledText, res.notes
                        );

                        _.each(res.riskEstimates, function(re){
                            let row3 = row2.slice();
                            row3.push(
                                re.exposureCategory, re.numberExposed, re.riskEstimated,
                                re.riskLow, re.riskMid, re.riskHigh,
                                re.inTrendTest, res.riskFormatter(re)
                            );
                            rows.push(row3);
                        });
                    });
                    return rows;
                },
                header = [
                    'Descriptive ID', 'Reference', 'Reference year', 'Pubmed ID', 'Study design',
                    'Location', 'Enrollment or follow-up dates', 'Population/eligibility characteristics',
                    'Other population descriptors', 'Outcome Data Source', 'Population size',
                    'Loss to follow-up (%)', 'Type of referent group', 'Population cases',
                    'Response rate cases', 'Source cases', 'Population controls',
                    'Response rate controls', 'Source controls', 'Exposure assessment type',
                    'Exposure assessment notes',
                    'Principal strengths', 'Principal limitations', 'General notes',

                    'Result ID', 'Organ site', 'Effect measure',
                    'Effect measure units', 'Stratum', 'Trend test',
                    'Covariates', 'Covariates notes', 'General notes',

                    'Exposure category', 'Number exposed', 'Risks estimated?',
                    'Risk 5% CI', 'Risk Mid', 'Risk 95% CI',
                    'In trend-test', 'Risk',
                ],
                data = [header],
                eds = EpiDescriptive.getTableEvidence(tbl_id);

            _.each(eds, function(v, i){
                v.getReference();
                v.getResults();
                let row = [
                        v._id, v.reference.name, v.reference.getYear(), v.reference.pubmedID,
                        v.studyDesign, v.location, v.enrollmentDates,
                        v.eligibilityCriteria, v.populationDescription,
                        v.outcomeDataSource, v.populationSize,
                        v.lossToFollowUp, v.referentGroup,
                        v.populationSizeCase, v.responseRateCase,
                        v.sourceCase, v.populationSizeControl,
                        v.responseRateControl, v.sourceControl,
                        v.exposureAssessmentType,
                        v.exposureAssessmentNotes,
                        v.strengths, v.limitations, v.notes,
                    ],
                    rows = getResultData(v.results, row);

                data.push.apply(data, rows);
            });
            return data;
        },
        tabularMetaAnalysis: function(rows){
            rows.unshift([
                'Reference', 'Reference year', 'Pubmed ID',
                'Study design', 'Location', 'Enrollment or follow-up dates',

                'Organ site', 'Effect measure',
                'Units of effect measurement', 'Stratum',

                'Exposure category', 'Number exposed',
                'Risk 5% CI', 'Risk Mid', 'Risk 95% CI',
            ]);
            return rows;
        },
        tablularMetaAnalysisRow: function(d){
            d.desc.getReference();
            return [
                d.desc.reference.name, d.desc.reference.getYear(), d.desc.reference.pubmedID,
                d.desc.studyDesign, d.desc.location,  d.desc.enrollmentDates,
                d.res.organSite, d.res.effectMeasure,
                d.res.effectUnits, d.res.stratum,
                d.exposureCategory, d.numberExposed,
                d.riskLow, d.riskMid, d.riskHigh,
            ];

        },
        wordReportFormats: [
            {
                'type': 'EpiDescriptiveTables',
                'fn': 'epi-descriptive',
                'text': 'Download Word (population description)',
            },
            {
                'type': 'EpiResultTables',
                'fn': 'epi-results',
                'text': 'Download Word (results description)',
            },
            {
                'type': 'EpiHtmlTables',
                'fn': 'epi',
                'text': 'Download Word (HTML re-creation)',
            },
        ],
        wordContextByDescription: function(tbl_ids){
            var tables = Tables.find({_id: {$in: tbl_ids}}).fetch(),
                allDescs = EpiDescriptive
                        .find({tbl_id: {$in: tbl_ids}, isHidden: false}, {sort: {sortIdx: 1}})
                        .fetch(),
                allResults = EpiResult
                        .find({tbl_id: {$in: tbl_ids}, isHidden: false}, {sort: {sortIdx: 1}})
                        .fetch();

            allDescs.forEach(function(d){
                d.setWordFields();
                d.results = _.where(allResults, {parent_id: d._id});
            });

            allResults.forEach(function(d){
                d.setWordFields();
            });

            return {
                'tables': tables,
                'descriptions': allDescs,
            };
        },
        wordContextByResult: function(tbl_ids){
            var tbls = Tables.find({_id: {$in: tbl_ids}}).fetch(),
                allDescs = EpiDescriptive.find({tbl_id: {$in: tbl_ids}, isHidden: false}).fetch(),
                allResults = EpiResult.find({tbl_id: {$in: tbl_ids}, isHidden: false}).fetch(),
                sites = _.uniq(_.pluck(allResults, 'organSiteCategory'), false),
                organSites;

            allDescs.forEach((d)=> d.setWordFields() );

            allResults = _.chain(allResults)
                .each((d)=>{
                    d.setWordFields();
                    d.descriptive = _.findWhere(allDescs, {_id: d.parent_id});
                })
                .reject((d) => d.descriptive === undefined)
                .value();

            organSites = _.map(sites, function(site){
                return {
                    'organSite': site,
                    'results': _.chain(allResults)
                                .where({organSiteCategory: site})
                                .value(),
                };
            });

            return {
                'tables': tbls,
                'organSites': organSites,
            };
        },
        sortFields: {
            'Reference':    collSorts.sortByReference,
            'Study design': _.partial(collSorts.sortByTextField, 'studyDesign'),
            'Location':     _.partial(collSorts.sortByTextField, 'location'),
            'Exposure assessment method': _.partial(
                collSorts.sortByTextField, 'exposureAssessmentType'),
        },
    },
    EpiDescriptive = new Meteor.Collection('epiDescriptive', {
        transform: function (doc) {
            return  _.extend(Object.create(instanceMethods), doc);
        },
    });


_.extend(EpiDescriptive, classMethods);
attachTableSchema(EpiDescriptive, schema_extension);

export default EpiDescriptive;
