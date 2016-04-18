import {Meteor} from 'meteor/meteor';

import _ from 'underscore';

import Tables from '/imports/api/shared/tables';
import Reference from '/imports/api/shared/reference';

import collSorts from '/imports/collSorts';

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
            this.wrd_location = this.location || 'Not-reported';
            this.wrd_occupationInfo = this.occupationInfo || '';
            this.wrd_comments = this.comments || '';
        },
        getReference: function(){
            if (_.isEmpty(this.reference)){
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
        tabular: function(tbl_id) {
            var data, header, i, len, ref, row, v, vals;
            vals = ExposureEvidence.find({tbl_id: tbl_id}, {sort: {sortIdx: 1}}).fetch();
            header = [
                'Exposure ID', 'Reference', 'Pubmed ID', 'Exposure scenario',
                'Collection date', 'Occupation', 'Occupational information',
                'Country', 'Location', 'Agent', 'Sampling Matrix', 'Sampling Approach',
                'Number of measurements', 'Measurement duration', 'Exposure level',
                'Exposure level description', 'Exposure level range', 'Units',
                'Comments',
            ];
            data = [header];
            for (i = 0, len = vals.length; i < len; i++) {
                v = vals[i];
                ref = Reference.findOne({_id: v.referenceID});
                row = [
                    v._id, ref.name, ref.pubmedID, v.exposureScenario,
                    v.collectionDate, v.occupation, v.occupationInfo,
                    v.country, v.location, v.agent, v.samplingMatrix,
                    v.samplingApproach, v.numberMeasurements,
                    v.measurementDuration, v.exposureLevel,
                    v.exposureLevelDescription,
                    v.exposureLevelRange, v.units, v.comments,
                ];
                data.push(row);
            }
            return data;
        },
        wordReportFormats: [
            {
                'type': 'ExposureTables',
                'fn': 'exposure',
                'text': 'Download Word',
            },
        ],
        wordContext: function(tbl_id){
            var tbl = Tables.findOne(tbl_id),
                exposures = ExposureEvidence.find(
                        {tbl_id: tbl_id}, {sort: {sortIdx: 1}}
                    ).fetch();

            exposures.forEach(function(exp){
                exp.reference = Reference.findOne({_id: exp.referenceID});
                exp.setWordFields();
            });

            return {
                'table': tbl,
                'exposures': exposures,
                'occupationals': _.filter(exposures, function(d) {
                    return d.exposureScenario === 'Occupational';
                }),
                'environmentals': _.filter(exposures, function(d) {
                    return d.exposureScenario === 'Environmental';
                }),
                'mixed': _.filter(exposures, function(d) {
                    return d.exposureScenario === 'Integrated/mixed';
                }),
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
