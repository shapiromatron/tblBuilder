import {Meteor} from 'meteor/meteor';

import _ from 'underscore';

import Tables from '/imports/collections/tables';
import Reference from '/imports/collections/reference';
import GenotoxHumanExposureResult from '/imports/collections/genotoxHumanExposureResult';

import collSorts from '../sorts';
import { attachTableSchema } from '../schemas';

import {
    htmlToDocx,
} from '/imports/api/utilities';

import schema_extension from './schema';


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

        getHtmlCol2: function() {
            return this.cellType;
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
        getResults: function(){
            if (_.isUndefined(this.results)){
                this.results = GenotoxHumanExposureResult
                        .find({parent_id: this._id}, {sort: {sortIdx: 1}})
                        .fetch();
            }
            return this.results;
        },
    },
    classMethods = {
        getTableEvidence: function(tbl_id){
            return GenotoxHumanExposureEvidence
                .find({tbl_id: tbl_id}, {sort: {sortIdx: 1}})
                .fetch();
        },
        getTabularHeader(){
            return [
                // description
                'Genotoxicity ID', 'Reference', 'Reference year', 'Pubmed ID', 'Location', 'Collection date',
                'Agent', 'Comments',

                // results
                'Result ID', 'Exposure scenario', 'Exposure setting', 'Number of measurements',
                'Sampling matrix', 'Endpoint', 'Cell type',
                'Exposure level', 'Exposure level range', 'Exposure units',
                'Result', 'Significance',
                'Covariates', 'Result notes',
            ];
        },
        getTabularRow(d){
            d.getReference();
            d.getResults();
            let row = [
                    d._id, d.reference.name, d.reference.getYear(),
                    d.reference.pubmed, d.location, d.collectionDate,
                    d.agent,  d.comments,
                ],
                rows = GenotoxHumanExposureEvidence.formatResultData(d.results, row);
            return rows;
        },
        formatResultData(results, row){
            let rows = [];
            _.each(results, function(res){
                let covariates = res.covariates.join(', '),
                    row2 = row.slice();
                row2.push(
                    res._id, res.exposureScenario, res.exposureSetting, res.numberSubjects,
                    res.samplingMatrix, res.endpoint, res.cellType,
                    res.exposureLevel, res.exposureLevelRange, res.units,
                    res.result, res.significance,
                    covariates, res.notes
                );
                rows.push(row2);
            });
            return rows;
        },
        tabular: function(tbl_id) {
            let qs = GenotoxHumanExposureEvidence.getTableEvidence(tbl_id),
                header = GenotoxHumanExposureEvidence.getTabularHeader(),
                data;

            data = _.chain(qs)
                    .map(function(d){
                        return GenotoxHumanExposureEvidence.getTabularRow(d);
                    }).flatten(true)
                    .value();
            data.unshift(header);
            return data;
        },
        sortFields: {
            'Reference': collSorts.sortByReference,
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
