import {Meteor} from 'meteor/meteor';

import _ from 'underscore';

import NtpEpiDescriptive from '/imports/collections/ntpEpiDescriptive';
import { attachTableSchema } from '../schemas';
import schema_extension from './schema';
import riskEstimateSchema from './riskEstimateSchema';
import {
    newValues,
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
            if (obj.riskEstimated) txt = `[${txt}]`;
            return txt;
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
    },
    NtpEpiResult = new Meteor.Collection('ntpEpiResult', {
        transform: function (doc) {
            return  _.extend(Object.create(instanceMethods), doc);
        },
    });


_.extend(NtpEpiResult, classMethods);
attachTableSchema(NtpEpiResult, schema_extension);

export default NtpEpiResult;
