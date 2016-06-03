import {Meteor} from 'meteor/meteor';

import _ from 'underscore';

import NtpEpiDescriptive from '/imports/collections/ntpEpiDescriptive';
import { attachTableSchema } from '../schemas';
import schema_extension from './schema';
import {
    newValues,
} from '/imports/api/utilities';
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
            obj.variablesOfConcern = _.map(trs, function(row){
                return newValues(row);
            });
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
