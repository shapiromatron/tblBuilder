import {Meteor} from 'meteor/meteor';

import { Router } from 'meteor/iron:router';
import _ from 'underscore';

import { attachTableSchema } from '../schemas';

import schema_extension from './schema';
import {
    typeOptions,
    roleOptions,
    routePaths,
    statusOptions,
} from './constants';


let instanceMethods = {
        getURL: function() {
            if (Meteor.isServer) return;
            var route = routePaths[this.tblType];
            if(route){
                return Router.path(route, {_id: this._id});
            } else {
                return Router.path('Http404');
            }
        },
        canEdit: function() {
            var currentUser = Meteor.user(),
                ids = [], id;

            if (currentUser) id = currentUser._id;
            if (id === undefined) return false;
            if (currentUser.roles.indexOf('superuser') >= 0) return true;

            ids = _.chain(this.user_roles)
                    .filter(function(v){return v.role === 'projectManagers';})
                    .pluck('user_id')
                    .value();

            return (id === this.user_id) || _.contains(ids, id);
        },
        getStatusColorClass: function() {
            return statusOptions[this.status];
        },
    },
    classMethods = {
        typeOptions,
        roleOptions,
        routePaths,
        statusOptions,
    },
    Tables = new Meteor.Collection('tables', {
        transform: function (doc) {
            return  _.extend(Object.create(instanceMethods), doc);
        },
    });

_.extend(Tables, classMethods);
attachTableSchema(Tables, schema_extension);

export default Tables;
