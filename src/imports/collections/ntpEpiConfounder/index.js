import {Meteor} from 'meteor/meteor';

import _ from 'underscore';

import NtpEpiDescriptive from '/imports/collections/ntpEpiDescriptive';
import { attachTableSchema } from '../schemas';
import schema_extension from './schema';
import {
    newValues,
} from '/imports/api/utilities';
import {
    tabularizeHeader,
    tabularize,
} from '/imports/utilities';
import variableOfConcernSchema from './vocSchema';
import {
    outcomeOverriden,
} from './constants';


let instanceMethods = {
        getDescription: function(){
            if (_.isUndefined(this.description)){
                this.description = NtpEpiDescriptive.findOne(this.parent_id);
            }
            return this.description;
        },
        getOutcomeRating: function(){
            return (outcomeOverriden(this.outcomeAssessmentRatingOverride))?
                (this.outcomeAssessmentRatingOverride) :
                this.getDescription().outcomeAssessmentRating;
        },
        getOutcomeRatingRationale: function(){
            return (outcomeOverriden(this.outcomeAssessmentRatingOverride))?
                (this.outcomeAssessmentRationaleOverride) :
                this.getDescription().outcomeAssessmentRationale;
        },
        getCovariatesList: function(){
            return this.covariates.sort().join(', ') || '-';
        },
        getCoexposuresList: function(){
            return this.coexposures.sort().join(', ') || '-';
        },
        getCaseControlMatchingList(){
            return this.caseControlMatching.sort().join(', ') || '-';
        },
        getCaseControlDiffersList(){
            return this.caseControlDiffers.sort().join(', ') || '-';
        },
        getVocsList: function(){
            let names = _.pluck(this.variablesOfConcern, 'vocName');
            return names.sort().join(', ') || '-';
        },
        tabularRows: function(){
            this.getDescription();
            this.description.getReference();

            let confounders = tabularize(this, schema_extension,
                  NtpEpiConfounder.tabularOmissions,
                  NtpEpiConfounder.tabularOverrides);

            confounders.unshift(
                this.description.reference.name,
                this.description._id);

            let rows = this.variablesOfConcern.map((riskEst)=>{
                let row = confounders.slice();  // shallow-copy
                row.push.apply(row, tabularize(riskEst, variableOfConcernSchema._schema, null, []));
                return row;
            });

            return rows;
        },
    },
    classMethods = {
        variableOfConcernSchema,
        preSaveHook: function(tmpl, obj) {
            delete obj.vocName;
            delete obj.vocAddressedInStats;
            delete obj.vocSimilarAcrossGroups;
            delete obj.vocCoexposuresAssociated;
            delete obj.vocOtherInformation;
            delete obj.vocStrengthOfAssociation;
            delete obj.vocRuleOutConfounding;
            let trs = tmpl.findAll('#variablesOfConcern > tbody > tr');
            obj.variablesOfConcern = _.map(trs, (row) => newValues(row));
        },
        getTableEvidence: function(tbl_id){
            return NtpEpiConfounder
                .find({tbl_id: tbl_id}, {sort: {sortIdx: 1}})
                .fetch();
        },
        tabularOmissions: ['variablesOfConcern'],
        tabularOverrides: {
            covariates(obj){
                return obj.getCovariatesList();
            },
            coexposures(obj){
                return obj.getCoexposuresList();
            },
            caseControlMatching(obj){
                return obj.getCaseControlMatchingList();
            },
            caseControlDiffers(obj){
                return obj.getCaseControlDiffersList();
            },
        },
        getTabularHeader: function(){
            let header = tabularizeHeader(schema_extension, 'VOC ID', NtpEpiConfounder.tabularOmissions);
            header.unshift('Reference', 'Description ID');
            header.push.apply(header, tabularizeHeader(variableOfConcernSchema._schema, null, []));
            return header;
        },
        tabular: function(tbl_id){
            let header = NtpEpiConfounder.getTabularHeader(),
                rows = _.chain(NtpEpiConfounder.getTableEvidence(tbl_id))
                    .map((d) => d.tabularRows())
                    .flatten(true)
                    .value();

            rows.unshift(header);
            return rows;
        },
    },
    NtpEpiConfounder = new Meteor.Collection('ntpEpiConfounder', {
        transform: function (doc) {
            return  _.extend(Object.create(instanceMethods), doc);
        },
    });


_.extend(NtpEpiConfounder, classMethods);
attachTableSchema(NtpEpiConfounder, schema_extension);

export default NtpEpiConfounder;
