import {Meteor} from 'meteor/meteor';

import _ from 'underscore';

import { attachTableSchema } from '../schemas';
import schema_extension from './schema';
import {
} from '/imports/api/utilities';


let instanceMethods = {
    },
    classMethods = {
        preSaveHook: function(tmpl, obj) {},
    },
    NtpAnimalEndpointEvidence = new Meteor.Collection('ntpAnimalEndpointEvidence', {
        transform: function (doc) {
            return  _.extend(Object.create(instanceMethods), doc);
        },
    });


_.extend(NtpAnimalEndpointEvidence, classMethods);
attachTableSchema(NtpAnimalEndpointEvidence, schema_extension);

export default NtpAnimalEndpointEvidence;
