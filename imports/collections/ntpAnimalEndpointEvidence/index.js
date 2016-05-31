import {Meteor} from 'meteor/meteor';

import _ from 'underscore';

import { attachTableSchema } from '../schemas';
import schema_extension from './schema';
import endpointGroupSchema from './endpointGroups';

import {
    newValues,
} from '/imports/api/utilities';


let instanceMethods = {
    },
    classMethods = {
        preSaveHook: function(tmpl, obj) {
            // save endpoint-groups
            delete obj.dose;
            delete obj.nStart;
            delete obj.tumorIncidence;
            delete obj.multiplicity;
            let trs = tmpl.findAll('.egs tr');
            obj.endpointGroups = _.map(trs, function(row){
                return newValues(row);
            });
        },
        endpointGroupSchema,
    },
    NtpAnimalEndpointEvidence = new Meteor.Collection('ntpAnimalEndpointEvidence', {
        transform: function (doc) {
            return  _.extend(Object.create(instanceMethods), doc);
        },
    });


_.extend(NtpAnimalEndpointEvidence, classMethods);
attachTableSchema(NtpAnimalEndpointEvidence, schema_extension);

export default NtpAnimalEndpointEvidence;
