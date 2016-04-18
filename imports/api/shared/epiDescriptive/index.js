import {Meteor} from 'meteor/meteor';

import _ from 'underscore';

import Tables from '/imports/api/shared/tables';
import Reference from '/imports/api/shared/reference';
import EpiResult from '/imports/api/shared/epiResult';

import { attachTableSchema } from '../schemas';
import schema_extension from './schema';
import { getPercentOrText } from '/imports/utilities';
import collSorts from '/imports/collSorts';

import {
    studyDesignOptions,
    exposureAssessmentTypeOptions,
    isCaseControl,
} from './constants';


let instanceMethods = {
        isCaseControl: function(){
            return EpiDescriptive.isCaseControl(this.studyDesign);
        },
        setWordFields: function() {
            _.extend(this, {
                reference: Reference.findOne({_id: this.referenceID}),
                isCaseControl: this.isCaseControl(),
                wrd_coexposuresList: this.coexposures.join(', '),
                wrd_notes: this.notes || '',
                wrd_responseRateCase: getPercentOrText(this.responseRateCase),
                wrd_responseRateControl: getPercentOrText(this.responseRateControl),
            });

            if (_.isUndefined(this.reference)){
                console.error(`missing reference: ${this._id} (${this.referenceID})`);
            }
        },
        getReference: function(){
            if (_.isEmpty(this.reference)){
                this.reference = Reference.findOne(this.referenceID);
            }
            return this.reference;
        },
    },
    classMethods = {
        studyDesignOptions,
        exposureAssessmentTypeOptions,
        isCaseControl: function(val){
            return isCaseControl(val);
        },
        tabular: function(tbl_id) {
            var coexposures, data, getResultData, header, i, len, reference, row, rows, v, vals;
            getResultData = function(parent_id, row) {
                var covariates, i, j, len, len1, re, ref, row2, row3, rows, v, vals;
                vals = EpiResult.find({parent_id: parent_id}, {sort: {sortIdx: 1}}).fetch();
                rows = [];
                for (i = 0, len = vals.length; i < len; i++) {
                    v = vals[i];
                    covariates = v.covariates.join(', ');
                    row2 = row.slice();
                    row2.push(
                        v._id, v.organSite, v.effectMeasure,
                        v.effectUnits, v.trendTest, covariates,
                        v.covariatesControlledText, v.notes);
                    ref = v.riskEstimates;
                    for (j = 0, len1 = ref.length; j < len1; j++) {
                        re = ref[j];
                        row3 = row2.slice();
                        row3.push(
                            re.exposureCategory, re.numberExposed, re.riskEstimated,
                            re.riskMid, re.riskLow, re.riskHigh,
                            re.inTrendTest, v.riskFormatter(re));
                        rows.push(row3);
                    }
                }
                // set undefined to blank text-string
                return _.map(rows, function(row){
                    return _.map(row, function(d){return (d===undefined)? '' : d;});
                });
            };
            vals = EpiDescriptive.find({tbl_id: tbl_id}, {sort: {sortIdx: 1}}).fetch();
            header = [
                'Descriptive ID', 'Reference', 'Pubmed ID', 'Study design',
                'Location', 'Enrollment or follow-up dates', 'Population/eligibility characteristics',
                'Other population descriptors', 'Outcome Data Source', 'Population size',
                'Loss to follow-up (%)', 'Type of referent group', 'Population cases',
                'Response rate cases', 'Source cases', 'Population controls',
                'Response rate controls', 'Source controls', 'Exposure assessment type',
                'Quantitative exposure level', 'Exposure assessment notes', 'Possible co-exposures',
                'Principal strengths', 'Principal limitations', 'General notes',

                'Result ID', 'Organ site', 'Effect measure',
                'Effect measure units', 'Trend test', 'Covariates',
                'Covariates notes', 'General notes',

                'Exposure category', 'Number exposed', 'Risks estimated?',
                'Risk Mid', 'Risk 5% CI', 'Risk 95% CI',
                'In trend-test', 'Risk',
            ];
            data = [header];
            for (i = 0, len = vals.length; i < len; i++) {
                v = vals[i];
                reference = Reference.findOne({_id: v.referenceID});
                coexposures = v.coexposures.join(', ');
                row = [
                    v._id, reference.name, reference.pubmedID, v.studyDesign,
                    v.location, v.enrollmentDates, v.eligibilityCriteria,
                    v.populationDescription, v.outcomeDataSource, v.populationSize,
                    v.lossToFollowUp, v.referentGroup, v.populationSizeCase,
                    v.responseRateCase, v.sourceCase, v.populationSizeControl,
                    v.responseRateControl, v.sourceControl, v.exposureAssessmentType,
                    v.exposureLevel, v.exposureAssessmentNotes, coexposures,
                    v.strengths, v.limitations, v.notes,
                ];
                rows = getResultData(v._id, row);
                data.push.apply(data, rows);
            }
            return data;
        },
        tabularMetaAnalysis: function(rows){
            rows.unshift([
                'Reference', 'Pubmed ID', 'Study design', 'Location', 'Enrollment or follow-up dates',

                'Organ site', 'Effect measure',

                'Exposure category', 'Number exposed',
                'Risk Mid', 'Risk 5% CI', 'Risk 95% CI',
            ]);
            return rows;
        },
        tablularMetaAnalysisRow: function(d){
            var ref = Reference.findOne(d.desc.referenceID);
            return [
                ref.name, ref.pubmedID, d.desc.studyDesign,
                d.desc.location, d.desc.enrollmentDates,
                d.res.organSite, d.res.effectMeasure,
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
                        .find({tbl_id: {$in: tbl_ids}}, {sort: {sortIdx: 1}})
                        .fetch(),
                allResults = EpiResult
                        .find({tbl_id: {$in: tbl_ids}}, {sort: {sortIdx: 1}})
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
                allDescs = EpiDescriptive.find({tbl_id: {$in: tbl_ids}}).fetch(),
                allResults = EpiResult.find({tbl_id: {$in: tbl_ids}}).fetch(),
                sites = _.uniq(_.pluck(allResults, 'organSiteCategory'), false),
                organSites;

            allDescs.forEach(function(d){
                d.setWordFields();
            });

            allResults.forEach(function(d){
                d.setWordFields();
                d.descriptive = _.findWhere(allDescs, {_id: d.parent_id});
            });

            organSites = _.map(sites, function(site){
                return {
                    'organSite': site,
                    'results': _.chain(allResults).where({organSiteCategory: site}).value(),
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
            'Exposure assessment method': _.partial(collSorts.sortByTextField, 'exposureAssessmentType'),
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
