import {Meteor} from 'meteor/meteor';

import _ from 'underscore';

import Tables from '/imports/collections/tables';
import Reference from '/imports/collections/reference';
import ExposureResult from '/imports/collections/exposureResult';

import collSorts from '../sorts';
import { attachTableSchema } from '../schemas';

import schema_extension from './schema';
import {
    exposureScenarios,
    samplingApproaches,
    exposureLevelDescriptions,
    isOccupational,
} from './constants';


let instanceMethods = {
        isOccupational: function(){
            return isOccupational(this.exposureScenario);
        },
        setWordFields: function() {
            this.isOccupational = this.isOccupational();
            this.results.forEach((d) => d.setWordFields());
        },
        getReference: function(){
            if (_.isUndefined(this.reference)){
                this.reference = Reference.findOne(this.referenceID);
            }
            return this.reference;
        },
        getResults: function(){
            if (_.isUndefined(this.results)){
                this.results = ExposureResult
                        .find({parent_id: this._id}, {sort: {sortIdx: 1}})
                        .fetch();
            }
            return this.results;
        },
    },
    classMethods = {
        exposureScenarios,
        samplingApproaches,
        exposureLevelDescriptions,
        isOccupational: function(val){
            return isOccupational(val);
        },
        getTableEvidence: function(tbl_id){
            return ExposureEvidence
                .find({tbl_id: tbl_id}, {sort: {sortIdx: 1}})
                .fetch();
        },
        tabular: function(tbl_id) {

            let getResultData = function(results, row) {
                    return results.map(function(d){
                        let row2 = row.slice();  // shallow-copy
                        row2.push(
                            d._id,
                            d.agent, d.samplingMatrix, d.samplingApproach, d.numberMeasurements, d.measurementDuration,
                            d.exposureLevel, d.exposureLevelDescription, d.exposureLevelRange, d.units
                        );
                        return row2;
                    });
                },
                header = [
                    'Exposure ID', 'Reference', 'Reference year', 'Pubmed ID',
                    'Country', 'Location',
                    'Collection date', 'Exposure scenario', 'Occupation', 'Occupational information',
                    'Comments',

                    'Result ID',
                    'Agent', 'Sampling Matrix', 'Sampling Approach', 'Number of measurements', 'Measurement duration',
                    'Exposure level', 'Exposure level description', 'Exposure level range', 'Units',
                ],
                data = [header],
                qs = ExposureEvidence.getTableEvidence(tbl_id);

            qs.forEach(function(d){
                d.getReference();
                d.getResults();
                let row = [
                        d._id, d.reference.name, d.reference.getYear(), d.reference.pubmedID,
                        d.country, d.location,
                        d.collectionDate, d.exposureScenario, d.occupation, d.occupationInfo,
                        d.comments,
                    ],
                    rows = getResultData(d.results, row);

                data.push.apply(data, rows);
            });
            return data;
        },
        wordReportFormats: [
            {
                'type': 'ExposureTables',
                'fn': 'exposure',
                'text': 'Download Word',
            },
            {
                'type': 'ExposureHtmlTable',
                'fn': 'exposure',
                'text': 'Download Word (HTML re-creation)',
            },
        ],
        wordHtmlContext(tbl_id){
            var table = Tables.findOne(tbl_id),
                qs = ExposureEvidence.getTableEvidence(tbl_id);

            qs.forEach(function(d){
                d.getReference();
                d.getResults();
                d.setWordFields();
            });

            return {
                table,
                exposures: qs,
            };
        },
        wordContext(tbl_id){
            let context = this.wordHtmlContext(tbl_id),
                exposures = context.exposures;

            return {
                'table': context.table,
                'occupationals': exposures.filter((d) => d.exposureScenario === 'Occupational'),
                'environmentals': exposures.filter((d) => d.exposureScenario === 'Environmental'),
                'mixed': exposures.filter((d) => d.exposureScenario === 'Integrated/mixed'),
            };
        },
        sortFields: {
            'Reference':            collSorts.sortByReference,
            'Exposure scenario':    _.partial(collSorts.sortByFieldOrder, exposureScenarios, 'exposureScenario'),
            'Industry/occupation':  _.partial(collSorts.sortByTextField, 'occupation'),
            'Country':              _.partial(collSorts.sortByTextField, 'country'),
            'Collection date':      _.partial(collSorts.sortByTextField, 'collectionDate'),
        },
    },
    ExposureEvidence = new Meteor.Collection('exposureEvidence', {
        transform: function (doc) {
            return  _.extend(Object.create(instanceMethods), doc);
        },
    });

_.extend(ExposureEvidence, classMethods);
attachTableSchema(ExposureEvidence, schema_extension);

export default ExposureEvidence;
