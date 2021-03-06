import {Meteor} from 'meteor/meteor';

import _ from 'underscore';

import NtpEpiDescriptive from '/imports/collections/ntpEpiDescriptive';
import { attachTableSchema } from '../schemas';
import schema_extension from './schema';
import riskEstimateSchema from './riskEstimateSchema';
import {
    newValues,
    capitalizeFirst,
} from '/imports/api/utilities';
import {
    tabularizeHeader,
    tabularize,
} from '/imports/utilities';


let instanceMethods = {
        riskFormatter: function(obj) {
            if (obj.riskMid == null) return '-';
            let txt = obj.riskMid.toString();
            if (_.isFinite(obj.riskLow) && _.isFinite(obj.riskHigh)) {
                txt += ` (${obj.riskLow}–${obj.riskHigh})`;
            }
            if (obj.numberExposed) {
                txt = `${txt}; ${obj.numberExposed}`;
            }
            if (obj.riskEstimated) txt = `[${txt}]`;
            return txt;
        },
        setWordFields: function() {
            _.extend(this, {
                wrd_covariatesList: capitalizeFirst(this.covariates.join(', ')),
                hasTrendTest: (this.trendTest) ? true : false,
                printOrganSite: this.printOrganSite(),
            });
            _.each(this.riskEstimates, function(riskEst){
                riskEst.riskFormatted = this.riskFormatter(riskEst);
                riskEst.exposureCategory = capitalizeFirst(riskEst.exposureCategory);
            }, this);
        },
        getDescription: function(){
            if (_.isUndefined(this.description)){
                this.description = NtpEpiDescriptive.findOne(this.parent_id);
            }
            return this.description;
        },
        printOrganSite: function(){
            if (this.organSite)
                return `${this.organSiteCategory}: ${this.organSite}`;
            return this.organSiteCategory;
        },
        printCovariates: function(){
            return this.covariates.join(', ');
        },
        tabularRows: function(){

            let res = tabularize(this, schema_extension,
                                  NtpEpiResult.tabularOmissions,
                                  NtpEpiResult.tabularOverrides);

            let rows = this.riskEstimates.map((riskEst)=>{
                let row = res.slice();  // shallow-copy
                row.push.apply(row, tabularize(riskEst, riskEstimateSchema._schema, null, []));
                return row;
            });

            return rows;
        },
        getTabularRatingsRow(){
            let outcomeRating, outcomeRatingRationale,
                confoundingRating, confoundingRatingRationale;

            if (this.confounder){
                outcomeRating = this.confounder.getOutcomeRating();
                outcomeRatingRationale = this.confounder.getOutcomeRatingRationale();
                confoundingRating = this.confounder.confoundingRating;
                confoundingRatingRationale = this.confounder.confoundingRatingRationale;
            }

            return [
                this.description.reference.name,
                this.organSiteCategory,
                this.description.selectionBiasRating,
                this.description.selectionBiasRationale,
                this.description.exposureAssessmentRating,
                this.description.exposureAssessmentRationale,
                outcomeRating,
                outcomeRatingRationale,
                this.description.analysisRating,
                this.description.analysisRationale,
                this.description.selectiveReportingRating,
                this.description.selectiveReportingRationale,
                this.description.sensitivityRating,
                this.description.sensitivityRatingRationale,
                confoundingRating,
                confoundingRatingRationale,
                this.description.overallUtility,
                this.description.strengths,
                this.description.limitations,
            ];
        },
    },
    classMethods = {
        preSaveHook: function(tmpl, obj) {
            // save epi-results
            delete obj.exposureCategory;
            delete obj.numberExposed;
            delete obj.riskMid;
            delete obj.riskLow;
            delete obj.riskHigh;
            delete obj.riskEstimated;
            delete obj.inTrendTest;
            delete obj.showInPlot;
            let trs = tmpl.findAll('.riskEstimateTbody tr');
            obj.riskEstimates = _.map(trs, function(row){
                return newValues(row);
            });
        },
        tabularOmissions: [
            'riskEstimates',
        ],
        tabularOverrides: {
            covariates(obj){
                return obj.printCovariates();
            },
        },
        tabularHeader: function(){
            let header = tabularizeHeader(schema_extension, 'Result ID', NtpEpiResult.tabularOmissions);
            header.push.apply(header, tabularizeHeader(riskEstimateSchema._schema, null, []));
            return header;
        },
        getUniqueRatingCollection(results){
            let existing = {};
            return _.chain(results)
                .each((d)=>{
                    d.getDescription();
                    d.description.getReference();
                    d.description.setResultConfounder(d);
                    d._unique = `${d.description.reference.name}-${d.organSiteCategory}`;
                })
                .filter((d)=>{
                    // only show first unique reference + organ site category combination
                    if (existing[d._unique] === undefined){
                        existing[d._unique] = true;
                        return true;
                    }
                    return false;
                })
                .sortBy((d)=>d.description.reference.name)
                .sortBy((d)=>d.organSiteCategory)
                .value();
        },
        getTabularRatingsHeader(){
            return [
                'Reference',
                'Organ site category',
                'Selection bias',
                'Selection bias rationale',
                'Exposure assessment',
                'Exposure assessment rationale',
                'Outcome assessment  ',
                'Outcome rating rationale',
                'Analysis',
                'Analysis rationale',
                'Selective reporting',
                'Selective reporting rationale',
                'Sensitivity',
                'Sensitivity rating rationale',
                'Confounding',
                'Confounding rating rationale',
                'Overall',
                'Strengths',
                'Limitations',
            ];
        },
        tabularRatingsMatrix(tbl_id){
            let results = NtpEpiResult.find({tbl_id}).fetch(),
                header = NtpEpiResult.getTabularRatingsHeader(),
                rows = _.chain(NtpEpiResult.getUniqueRatingCollection(results))
                    .map((d) => d.getTabularRatingsRow())
                    .value();

            rows.unshift(header);
            return rows;
        },
    },
    NtpEpiResult = new Meteor.Collection('ntpEpiResult', {
        transform: function (doc) {
            return  _.extend(Object.create(instanceMethods), doc);
        },
    });


_.extend(NtpEpiResult, classMethods);
attachTableSchema(NtpEpiResult, schema_extension);

export default NtpEpiResult;
