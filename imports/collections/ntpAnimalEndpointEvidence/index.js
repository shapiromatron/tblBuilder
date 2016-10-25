import {Meteor} from 'meteor/meteor';

import _ from 'underscore';

import { attachTableSchema } from '../schemas';
import schema_extension from './schema';
import endpointGroupSchema from './endpointGroups';

import {
    newValues,
} from '/imports/api/utilities';

import {
    tabularizeHeader,
    tabularize,
} from '/imports/utilities';


let instanceMethods = {
        incidenceText: function(){
            let arr = _.chain(this.endpointGroups)
                .map((d)=>{
                    let inc = d.incidence || 'NR',
                        ip = (d.incidencePercent)?
                            ` (${d.incidencePercent.toFixed(1)}%)`: '',
                        is = d.incidenceSymbol || '';
                    return `${inc}${ip}${is}`;
                })
                .compact()
                .value();
            return (arr.length>0)? arr.join(', '): 'NR';
        },
        tabularRows: function(){

            let res = tabularize(this, schema_extension,
                                  NtpAnimalEndpointEvidence.tabularOmissions,
                                  NtpAnimalEndpointEvidence.tabularOverrides);

            let rows = this.endpointGroups.map((endpointGroup)=>{
                let row = res.slice();  // shallow-copy
                row.push.apply(row,
                    tabularize(endpointGroup, endpointGroupSchema._schema, null, []));
                return row;
            });

            return rows;
        },
    },
    classMethods = {
        preSaveHook: function(tmpl, obj) {
            // save endpoint-groups
            delete obj.dose;
            delete obj.nStart;
            delete obj.incidence;
            delete obj.incidencePercent;
            delete obj.incidenceSymbol;
            delete obj.multiplicity;
            delete obj.tumorOnsetTime;
            delete obj.wgCalculated;
            delete obj.showInPlot;
            let trs = tmpl.findAll('.egs tr');
            obj.endpointGroups = _.map(trs, function(row){
                return newValues(row);
            });
        },
        endpointGroupSchema,
        tabularOmissions: [
            'endpointGroups',
        ],
        tabularOverrides: {
        },
        tabularHeader: function(){
            let header = tabularizeHeader(schema_extension, 'Result ID',
                                          NtpAnimalEndpointEvidence.tabularOmissions);
            header.push.apply(header, tabularizeHeader(endpointGroupSchema._schema, null, []));
            return header;
        },
    },
    NtpAnimalEndpointEvidence = new Meteor.Collection('ntpAnimalEndpointEvidence', {
        transform: function (doc) {
            return  _.extend(Object.create(instanceMethods), doc);
        },
    });


_.extend(NtpAnimalEndpointEvidence, classMethods);
attachTableSchema(NtpAnimalEndpointEvidence, schema_extension);

export default NtpAnimalEndpointEvidence;
