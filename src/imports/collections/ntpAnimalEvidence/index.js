import {Meteor} from 'meteor/meteor';

import _ from 'underscore';

import Tables from '/imports/collections/tables';
import Reference from '/imports/collections/reference';
import NtpAnimalEndpointEvidence from '/imports/collections/ntpAnimalEndpointEvidence';

import { attachTableSchema } from '../schemas';

import schema_extension from './schema';

import {
    sharedClassMethods,
} from '/imports/collections/animalEvidence';

import {
    tabularizeHeader,
    tabularize,
} from '/imports/utilities';


let instanceMethods = {
        getReference: function(){
            if (_.isUndefined(this.reference)){
                this.reference = Reference.findOne(this.referenceID);
            }
            return this.reference;
        },
        getAdditionalReferences: function(){
            if (_.isUndefined(this.additionalReferenceObjects)){
                this.additionalReferenceObjects = Reference
                    .find({_id: {$in: this.additionalReferences}})
                    .fetch();
            }
            return this.additionalReferenceObjects;
        },
        getResults: function(){
            if (_.isUndefined(this.results)){
                this.results = NtpAnimalEndpointEvidence
                        .find({parent_id: this._id}, {sort: {sortIdx: 1}})
                        .fetch();
            }
            return this.results;
        },
        tabularRows: function(){
            this.getReference();
            this.getResults();

            let desc = tabularize(
                this,
                schema_extension,
                NtpAnimalEvidence.tabularOmissions,
                NtpAnimalEvidence.tabularOverrides);

            let rows = this.results.map((d)=>{
                return d.tabularRows().map((resRow)=>{
                    let row = desc.slice();  // shallow-copy
                    row.push.apply(row, resRow);
                    return row;
                });
            });

            return _.flatten(rows, true);
        },
    },
    classMethods = _.extend({
        getTableEvidence: function(tbl_id){
            return NtpAnimalEvidence
                .find({tbl_id}, {sort: {sortIdx: 1}})
                .fetch();
        },
        tabularOmissions: [],
        tabularOverrides: {
            referenceID(d){
                return d.reference.name;
            },
            additionalReferences(d){
                return d.getAdditionalReferences().map((d) => d.name).join(', ');
            },
        },
        worksheetLabels: [
            'agent',
            'dosingRoute',
            'species',
            'strain',
            'sex',
            'duration',
        ],
        getTabularHeader(){
            let header = tabularizeHeader(
                schema_extension, 'Evidence ID', NtpAnimalEvidence.tabularOmissions);
            header.push.apply(header, NtpAnimalEndpointEvidence.tabularHeader());
            return header;
        },
        tabular: function(tbl_id) {
            let header = NtpAnimalEvidence.getTabularHeader(),
                rows = _.chain(NtpAnimalEvidence.getTableEvidence(tbl_id))
                    .map((d) => d.tabularRows())
                    .flatten(true)
                    .value();

            rows.unshift(header);
            return rows;
        },
        wordContext: function(tbl_id) {
            var table = Tables.findOne(tbl_id),
                studies = NtpAnimalEvidence.getTableEvidence(tbl_id);

            _.each(studies, (d)=>{
                d.getReference();
                d.getResults();
            });

            return {
                table,
                studies,
            };
        },
        wordReportFormats: [
            {
                type: 'NtpAnimalHtmlTables',
                fn: 'animal-evidence',
                text: 'Download Word (results)',
            },
            {
                type: 'NtpAnimalBias',
                fn: 'animal-potential-bias',
                text: 'Download Word (potential bias)',
            },
        ],
    }, sharedClassMethods),
    NtpAnimalEvidence = new Meteor.Collection('ntpAnimalEvidence', {
        transform: function (doc) {
            return  _.extend(Object.create(instanceMethods), doc);
        },
    });


_.extend(NtpAnimalEvidence, classMethods);
attachTableSchema(NtpAnimalEvidence, schema_extension);

export default NtpAnimalEvidence;
