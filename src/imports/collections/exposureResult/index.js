import {Meteor} from 'meteor/meteor';

import _ from 'underscore';

import ExposureEvidence from '/imports/collections/exposure';
import { attachTableSchema } from '../schemas';
import schema_extension from './schema';


let instanceMethods = {
        getDescription: function(){
            if (_.isUndefined(this.description)){
                this.description = ExposureEvidence.findOne(this.parent_id);
            }
            return this.description;
        },
        setWordFields: function() {
            this.exposureRangePrint = this.getExposureRangePrint();
        },
        getExposureRangePrint: function(){
            // if range has a number in it, print units, otherwise don't
            return (/\d/.test(this.exposureLevelRange))?
                `${this.exposureLevelRange} ${this.units}`:
                this.exposureLevelRange;
        },
    },
    classMethods = {
        preSaveHook: function(tmpl, obj) {
        },
    },
    ExposureResult = new Meteor.Collection('exposureResult', {
        transform: function (doc) {
            return  _.extend(Object.create(instanceMethods), doc);
        },
    });


_.extend(ExposureResult, classMethods);
attachTableSchema(ExposureResult, schema_extension);

export default ExposureResult;
