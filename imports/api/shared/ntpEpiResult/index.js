import {Meteor} from 'meteor/meteor';

import _ from 'underscore';

import NtpEpiDescriptive from '/imports/api/shared/ntpEpiDescriptive';
import { attachTableSchema } from '../schemas';
import schema_extension from './schema';
import {
    newValues,
} from '/imports/utilities';
import {
    variableOfConcernSchema,
} from './vocSchema';


var instanceMethods = {
        riskFormatter: function(obj) {
            if (obj.riskMid == null) return '-';
            var txt = obj.riskMid.toString();
            if (_.isFinite(obj.riskLow) && _.isFinite(obj.riskHigh)) {
                txt += ` (${obj.riskLow}–${obj.riskHigh})`;
            }
            if (obj.riskEstimated) txt = `[${txt}]`;
            return txt;
        },
        getDescription: function(){
            if (_.isEmpty(this.description)){
                this.description = NtpEpiDescriptive.findOne(this.parent_id);
            }
            return this.description;
        },
    },
    classMethods = {
        variableOfConcernSchema,
        preSaveHook: function(tmpl, obj) {
            // save epi-results
            delete obj.exposureCategory;
            delete obj.numberExposed;
            delete obj.riskMid;
            delete obj.riskLow;
            delete obj.riskHigh;
            delete obj.riskEstimated;
            delete obj.inTrendTest;
            var trs = tmpl.findAll('.riskEstimateTbody tr');
            obj.riskEstimates = _.map(trs, function(row){
                return newValues(row);
            });

            // save variables of concern
            delete obj.vocName;
            delete obj.vocAddressedInStats;
            delete obj.vocSimilarAcrossGroups;
            delete obj.vocCoexposuresAssociated;
            delete obj.vocOtherInformation;
            delete obj.vocStrengthOfAssociation;
            delete obj.vocRuleOutConfounding;
            trs = tmpl.findAll('#variablesOfConcern > tbody > tr');
            obj.variablesOfConcern = _.map(trs, function(row){
                return newValues(row);
            });
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
