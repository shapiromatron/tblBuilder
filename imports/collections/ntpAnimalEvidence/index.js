import {Meteor} from 'meteor/meteor';

import _ from 'underscore';

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
                return '<not implemented>';
            },
        },
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
    }, sharedClassMethods),
    NtpAnimalEvidence = new Meteor.Collection('ntpAnimalEvidence', {
        transform: function (doc) {
            return  _.extend(Object.create(instanceMethods), doc);
        },
    });


_.extend(NtpAnimalEvidence, classMethods);
attachTableSchema(NtpAnimalEvidence, schema_extension);

export default NtpAnimalEvidence;
