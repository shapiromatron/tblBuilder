import {Meteor} from 'meteor/meteor';

import _ from 'underscore';

import Reference from '/imports/collections/reference';

import { attachTableSchema } from '../schemas';

import schema_extension from './schema';

import {
    sharedClassMethods,
} from '/imports/collections/animalEvidence';


let instanceMethods = {
        getReference: function(){
            if (_.isUndefined(this.reference)){
                this.reference = Reference.findOne(this.referenceID);
            }
            return this.reference;
        },
    },
    classMethods = _.extend({}, sharedClassMethods),
    NtpAnimalEvidence = new Meteor.Collection('ntpAnimalEvidence', {
        transform: function (doc) {
            return  _.extend(Object.create(instanceMethods), doc);
        },
    });


_.extend(NtpAnimalEvidence, classMethods);
attachTableSchema(NtpAnimalEvidence, schema_extension);

export default NtpAnimalEvidence;
