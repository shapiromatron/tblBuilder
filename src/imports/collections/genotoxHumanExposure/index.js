import {Meteor} from 'meteor/meteor';

import _ from 'underscore';

import Tables from '/imports/collections/tables';
import Reference from '/imports/collections/reference';

import collSorts from '../sorts';
import { attachTableSchema } from '../schemas';

import {
    htmlToDocx,
} from '/imports/api/utilities';


import schema_extension from './schema';
import {
    resultOptions,
} from './constants';


var instanceMethods = {
        setWordFields: function() {
            var ext = {
                wrd_comments: this.comments || '',
                col2: htmlToDocx(this.getHtmlCol2()),
                col3: htmlToDocx(this.getHtmlCol3()),
                col4: htmlToDocx(this.getHtmlCol4()),
                col5: htmlToDocx(this.getHtmlCol5()),
                col6: htmlToDocx(this.getHtmlCol6()),
                col7: htmlToDocx(this.getHtmlCol7()),
                wrd_resultA: this.result,
                wrd_resultB: 'NA',
            };

            _.extend(this, ext);
        },
        getHtmlCol1: function() {
            return this.dataClass;
        },
        getHtmlCol2: function() {
            return `${this.cellType}<br>${this.exposureDescription}`;
        },
        getHtmlCol3: function() {
            return `${this.endpoint}/<br>${this.endpointTest}`;
        },
        getHtmlCol4: function(){
            return this.result;
        },
        getHtmlCol5: function() {
            return 'NA';
        },
        getHtmlCol6: function() {
            return this.agent;
        },
        getHtmlCol7: function() {
            return this.comments || '';
        },
        getReference: function(){
            if (_.isUndefined(this.reference)){
                this.reference = Reference.findOne(this.referenceID);
            }
            return this.reference;
        },
    },
    classMethods = {
        resultOptions,
        getTableEvidence: function(tbl_id){
            return GenotoxHumanExposureEvidence
                .find({tbl_id: tbl_id}, {sort: {sortIdx: 1}})
                .fetch();
        },
        tabular: function(tbl_id) {
            let qs = GenotoxHumanExposureEvidence.getTableEvidence(tbl_id),
                header = [
                    'Genotoxicity ID', 'Reference', 'Reference year', 'Pubmed ID',
                    'Agent', 'Cell type', 'Endpoint', 'Endpoint test',
                    'Result', 'Comments',
                ],
                data;

            data = _.map(qs, function(d){
                d.getReference();
                return [
                    d._id, d.reference.name, d.reference.getYear(), d.reference.pubmedID,
                    d.agent,d.cellType, d.endpoint, d.endpointTest,
                    d.result, d.comments,
                ];
            });
            data.unshift(header);
            return data;
        },
        wordReportFormats: [
            {
                'type': 'GenotoxHumanExposureTables',
                'fn': 'genotoxicity',
                'text': 'Download Word (by data-class)',
            },
            {
                'type': 'GenotoxHumanExposureHtmlTables',
                'fn': 'genotoxicity',
                'text': 'Download Word (HTML re-creation)',
            },
        ],
        wordContext: function(tbl_id) {
            let resp = GenotoxHumanExposureEvidence.wordHtmlContext(tbl_id);
            return {
                table: resp.table,
            };
        },
        wordHtmlContext: function(tbl_id){
            var tbl = Tables.findOne(tbl_id),
                vals = GenotoxHumanExposureEvidence.find(
                            {tbl_id: tbl_id, isHidden: false},
                            {sort: {sortIdx: 1}}
                        ).fetch();

            vals.forEach(function(val){
                val.reference = Reference.findOne({_id: val.referenceID});
                val.setWordFields();
            });

            return {
                table: tbl,
                objects: vals,
            };
        },
        sortFields: {
            'Exposure scenario':
                _.partial(collSorts.sortByTextField, 'exposureScenario'),
            'Agent':
                _.partial(collSorts.sortByTextField, 'agent'),
            'Cell type (human in-vivo)':
                _.partial(collSorts.sortByTextField, 'cellType'),
            'Location':
                _.partial(collSorts.sortByTextField, 'location'),
            'Collection date':
                _.partial(collSorts.sortByTextField, 'collectionDate'),
            'Exposure setting':
                _.partial(collSorts.sortByTextField, 'setting'),
            'Endpoint':
                _.partial(collSorts.sortByTextField, 'endpoint'),
            'Endpoint test':
                _.partial(collSorts.sortByTextField, 'endpointTest'),
            'Reference':
                collSorts.sortByReference,
        },
    },
    GenotoxHumanExposureEvidence = new Meteor.Collection('genotoxHumanExposureEvidence', {
        transform: function (doc) {
            return  _.extend(Object.create(instanceMethods), doc);
        },
    });


_.extend(GenotoxHumanExposureEvidence, classMethods);
attachTableSchema(GenotoxHumanExposureEvidence, schema_extension);

export default GenotoxHumanExposureEvidence;
