import {Meteor} from 'meteor/meteor';

import _ from 'underscore';

import Reference from '/imports/collections/reference';
import EpiDescriptive from '/imports/collections/epiDescriptive';

import collSorts from '../sorts';
import { attachTableSchema } from '../schemas';

import {
    tabularizeHeader,
    tabularize,
} from '/imports/utilities';

import schema_extension from './schema';
import NtpEpiResult from '/imports/collections/ntpEpiResult';
import NtpEpiConfounder from '/imports/collections/ntpEpiConfounder';
import {
    studyDesignOptions,
    exposureAssessmentTypeOptions,
    ratings,
} from './constants';


let instanceMethods = {
        getReference: function(){
            if (_.isUndefined(this.reference)){
                this.reference = Reference.findOne(this.referenceID);
            }
            return this.reference;
        },
        getResults: function(){
            if (_.isUndefined(this.results)){
                this.results = NtpEpiResult
                        .find({parent_id: this._id}, {sort: {sortIdx: 1}})
                        .fetch();
            }
            return this.results;
        },
        getConfounders: function(){
            if (_.isUndefined(this.confounders)){
                this.confounders = NtpEpiConfounder
                        .find({parent_id: this._id}, {sort: {sortIdx: 1}})
                        .fetch();
            }
            return this.confounders;
        },
        isCaseControl: function(){
            return EpiDescriptive.isCaseControl(this.studyDesign);
        },
        tabularRows: function(){
            this.getReference();
            this.getResults();

            let desc = tabularize(this, schema_extension,
                                  NtpEpiDescriptive.tabularOmissions,
                                  NtpEpiDescriptive.tabularOverrides);

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
    classMethods = {
        studyDesignOptions,
        exposureAssessmentTypeOptions,
        ratings,
        sortFields: {
            'Reference':    'sortReference',
        },
        sortReference:  collSorts.sortByReference,
        getTableEvidence: function(tbl_id){
            return NtpEpiDescriptive
                .find({tbl_id: tbl_id}, {sort: {sortIdx: 1}})
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
        worksheetLabels: [
            'studyDesign',
            'location',
            'enrollmentDates',
        ],
        getTabularHeader(){
            let header = tabularizeHeader(
                schema_extension, 'Description ID', NtpEpiDescriptive.tabularOmissions);
            header.push.apply(header, NtpEpiResult.tabularHeader());
            return header;
        },
        tabular: function(tbl_id) {
            let header = NtpEpiDescriptive.getTabularHeader(),
                rows = _.chain(NtpEpiDescriptive.getTableEvidence(tbl_id))
                    .map((d) => d.tabularRows())
                    .flatten(true)
                    .value();

            rows.unshift(header);
            return rows;
        },
    },
    NtpEpiDescriptive = new Meteor.Collection('ntpEpiDescriptive', {
        transform: function (doc) {
            return  _.extend(Object.create(instanceMethods), doc);
        },
    });


_.extend(NtpEpiDescriptive, classMethods);
attachTableSchema(NtpEpiDescriptive, schema_extension);

export default NtpEpiDescriptive;
