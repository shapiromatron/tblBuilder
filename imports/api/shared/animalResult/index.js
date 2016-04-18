import {Meteor} from 'meteor/meteor';

import _ from 'underscore';

import { attachTableSchema } from '../schemas';
import schema_extension from './schema';
import {
    newValues,
} from '/imports/utilities';


let instanceMethods = {
    },
    classMethods = {
        preSaveHook: function(tmpl, obj) {
            delete obj.dose;
            delete obj.nStart;
            delete obj.nSurviving;
            delete obj.incidence;
            delete obj.multiplicity;
            delete obj.totalTumours;
            var trs = tmpl.findAll('.endpointGroupTbody tr');
            obj.endpointGroups = _.map(trs, function(row){
                return newValues(row);
            });
        },
    },
    AnimalEndpointEvidence = new Meteor.Collection('animalEndpointEvidence', {
        transform: function (doc) {
            return  _.extend(Object.create(instanceMethods), doc);
        },
    });


_.extend(AnimalEndpointEvidence, classMethods);
attachTableSchema(AnimalEndpointEvidence, schema_extension);

export default AnimalEndpointEvidence;
