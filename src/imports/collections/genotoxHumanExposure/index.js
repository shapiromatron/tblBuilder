import {Meteor} from 'meteor/meteor';

import _ from 'underscore';

import Tables from '/imports/collections/tables';
import Reference from '/imports/collections/reference';
import GenotoxHumanExposureResult from '/imports/collections/genotoxHumanExposureResult';

import collSorts from '../sorts';
import { attachTableSchema } from '../schemas';

import schema_extension from './schema';


let instanceMethods = {
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
        wordReportFormats: [
            {
                'type': 'GenotoxHumanHtml',
                'fn': 'genotoxicity',
                'text': 'Download Word',
            },
        ],
        wordContext: function(tbl_id){
            var tbl = Tables.findOne(tbl_id),
                rows = GenotoxHumanExposureEvidence.find(
                    {tbl_id: tbl_id, isHidden: false},
                    {sort: {sortIdx: 1}}
                ).fetch();

            rows.forEach((d) => {
                d.getReference();
                d.getResults();
            });

            return {
                table: tbl,
                objects: rows,
            };
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
