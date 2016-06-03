import {Meteor} from 'meteor/meteor';

import _ from 'underscore';

import { attachTableSchema } from '../schemas';
import schema_extension from './schema';
import riskEstimateSchema from './riskEstimateSchema';
import {
    capitalizeFirst,
    newValues,
} from '/imports/api/utilities';


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
        printOrganSite: function(){
            if (this.organSite)
                return `${this.organSiteCategory}: ${this.organSite}`;
            return this.organSiteCategory;
        },
    },
    classMethods = {
        preSaveHook: function(tmpl, obj) {
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
        },
        riskEstimateSchema,
    },
    EpiResult = new Meteor.Collection('epiResult', {
        transform: function (doc) {
            return  _.extend(Object.create(instanceMethods), doc);
        },
    });


_.extend(EpiResult, classMethods);
attachTableSchema(EpiResult, schema_extension);

export default EpiResult;
