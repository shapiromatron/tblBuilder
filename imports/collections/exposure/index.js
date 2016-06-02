import {Meteor} from 'meteor/meteor';

import _ from 'underscore';

import Tables from '/imports/collections/tables';
import Reference from '/imports/collections/reference';

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
        },
        getReference: function(){
            if (_.isUndefined(this.reference)){
                this.reference = Reference.findOne(this.referenceID);
            }
            return this.reference;
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
            let qs = ExposureEvidence.getTableEvidence(tbl_id),
                header = [
                    'Exposure ID', 'Reference', 'Reference year', 'Pubmed ID', 'Exposure scenario',
                    'Collection date', 'Occupation', 'Occupational information',
                    'Country', 'Location', 'Agent', 'Sampling Matrix', 'Sampling Approach',
                    'Number of measurements', 'Measurement duration', 'Exposure level',
                    'Exposure level description', 'Exposure level range', 'Units',
                    'Comments',
                ],
                rows;

            rows = _.map(qs, function(v){
                v.getReference();
                return [
                    v._id, v.reference.name, v.reference.getYear(), v.reference.pubmedID,
                    v.exposureScenario, v.collectionDate,
                    v.occupation, v.occupationInfo,
                    v.country, v.location,
                    v.agent, v.samplingMatrix,
                    v.samplingApproach, v.numberMeasurements,
                    v.measurementDuration, v.exposureLevel,
                    v.exposureLevelDescription,
                    v.exposureLevelRange, v.units, v.comments,
                ];
            });

            rows.unshift(header);
            return rows;
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
                exposures = ExposureEvidence.find(
                        {tbl_id: tbl_id, isHidden: false}, {sort: {sortIdx: 1}}
                    ).fetch();

            exposures.forEach(function(exp){
                exp.getReference();
                exp.setWordFields();
            });

            return {
                table,
                exposures,
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
            'Agent':                _.partial(collSorts.sortByTextField, 'agent'),
            'Exposure scenario':    _.partial(collSorts.sortByFieldOrder, exposureScenarios, 'exposureScenario'),
            'Industry/occupation':  _.partial(collSorts.sortByTextField, 'occupation'),
            'Country':              _.partial(collSorts.sortByTextField, 'country'),
            'Collection date':      _.partial(collSorts.sortByTextField, 'collectionDate'),
            'Sampling approach':    _.partial(collSorts.sortByFieldOrder, samplingApproaches, 'samplingApproach'),
            'Matrix':               _.partial(collSorts.sortByTextField, 'samplingMatrix'),
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
