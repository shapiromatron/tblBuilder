import {Meteor} from 'meteor/meteor';

import _ from 'underscore';


var instanceMethods = {
    getURL: function() {
        if (Meteor.isServer) return;
        var route = Tables.routePaths[this.tblType];
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
        return Tables.statusOptions[this.status];
    },
};
Tables = new Meteor.Collection('tables', {
    transform: function (doc) {
        return  _.extend(Object.create(instanceMethods), doc);
    },
});


// collection class methods/attributes
_.extend(Tables, {
    typeOptions: [
        'Exposure Evidence',
        'Epidemiology Evidence',
        'Animal Bioassay Evidence',
        'Genetic and Related Effects',
        'Mechanistic Evidence Summary',
    ],
    roleOptions: [
        'projectManagers',
        'teamMembers',
        'reviewers',
    ],
    routePaths: {
        'Mechanistic Evidence Summary': 'mechanisticMain',
        'Epidemiology Evidence': 'epiMain',
        'NTP Epidemiology Evidence': 'ntpEpiMain',
        'Exposure Evidence': 'exposureMain',
        'Animal Bioassay Evidence': 'animalMain',
        'Genetic and Related Effects': 'genotoxMain',
    },
    statusOptions: {
        'unknown':     'statusUnknown',
        'not started': 'statusNotStarted',
        'in progress': 'statusInProgress',
        'complete':    'statusComplete',
        'QA ongoing':  'statusQAOngoing',
        'QA complete': 'statusQAComplete',
    },
});


// change table-options based on NTP context
if (Meteor.settings['public'].context === 'ntp'){
    Tables.typeOptions[
        Tables.typeOptions.indexOf('Epidemiology Evidence')
    ] = 'NTP Epidemiology Evidence';
}


tblBuilderCollections.attachSchema(Tables, _.extend({
    monographAgent: {
        label: 'Monograph Agent Name',
        type: String,
        min: 1,
    },
    volumeNumber: {
        label: 'Volume Number',
        type: Number,
        decimal: false,
    },
    name: {
        label: 'Table Name',
        type: String,
        min: 1,
    },
    tblType: {
        label: 'Table Type',
        type: String,
        allowedValues: Tables.typeOptions,
        denyUpdate: true,
    },
    'user_roles.$.user_id': {
        type: SimpleSchema.RegEx.Id,
    },
    'user_roles.$.role': {
        type: String,
        allowedValues: Tables.roleOptions,
    },
    sortIdx: {
        type: Number,
        decimal: true,
        optional: true,
    },
    status: {
        label: 'Table Status',
        type: String,
        allowedValues: _.keys(Tables.statusOptions),
        popoverText: 'Table status',
    },
}, tblBuilderCollections.base));
