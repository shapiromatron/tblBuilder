import {Meteor} from 'meteor/meteor';

import _ from 'underscore';

import { attachTableSchema } from '../schemas';


import schema_extension from './schema';
import {
    resultOptions,
} from './constants';


var instanceMethods = {
        getSignificancePrint(){
            // print value in parenthesis if 0.0001 type pattern, else nothing
            if (_.isUndefined(this.significancePrint)){
                this.significancePrint = (this.significance && /(0\.\d+)+/.test(this.significance))?
                    `(${this.significance})`: '';
            }
            return this.significancePrint;
        },
    },
    classMethods = {
        preSaveHook: function(){},
        resultOptions,
    },
    GenotoxHumanExposureResult = new Meteor.Collection('genotoxHumanExposureResult', {
        transform: function (doc) {
            return  _.extend(Object.create(instanceMethods), doc);
        },
    });


_.extend(GenotoxHumanExposureResult, classMethods);
attachTableSchema(GenotoxHumanExposureResult, schema_extension);

export default GenotoxHumanExposureResult;
