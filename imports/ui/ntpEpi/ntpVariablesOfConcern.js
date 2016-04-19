import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import _ from 'underscore';

import NtpEpiResult from '/imports/collections/ntpEpiResult';

import {
    abstractMainHelpers,
} from '/imports/api/client/templates';


Template.ntpVariablesOfConcernMain.helpers(abstractMainHelpers);
Template.ntpVariablesOfConcernMain.onCreated(function() {
    Session.set('evidenceType', 'ntpEpiDescriptive');
    this.subscribe('ntpEpiDescriptive', Session.get('Tbl')._id);
});
Template.ntpVariablesOfConcernMain.onDestroyed(function() {
    Session.set('evidenceType', null);
});


Template.ntpVariablesOfConcernTable.helpers({
    getHeaders: function(){
        return ['Reference: organ-site'].concat(Template.instance().vocVariables);
    },
    getRows: function(){
        return Template.instance().vocRows;
    },
});
Template.ntpVariablesOfConcernTable.onCreated(function(){
    var results = NtpEpiResult.find().fetch(),
        variables = _.chain(results)
            .pluck('variablesOfConcern')
            .filter(function(d){return d !== null;})
            .flatten()
            .pluck('vocName')
            .sort()
            .uniq(true)
            .value(),
        rows = [],
        null_variable = 'N/A';

    results.forEach(function(d1){
        var row = {
                result: d1,
                referenceID: d1.getDescription().getReference()._id,
                variables: [],
            },
            vocs = _.groupBy(d1.variablesOfConcern, 'vocName');

        _.each(variables, function(d2){
            var match = vocs[d2];
            if (match){
                row.variables.push(match[0].vocRuleOutConfounding);
            } else {
                row.variables.push(null_variable);
            }
        });

        rows.push(row);
    });

    _.extend(this, {
        vocVariables: variables,
        vocRows: rows,
    });
});
Template.ntpVariablesOfConcernTable.onRendered(function(){
    this.$('.ntpEpiRatingTd').popover({
        trigger: 'hover',
        placement: 'top',
        delay: {show: 0, hide: 100},
        container: 'body',
    });
});
Template.ntpVariablesOfConcernTable.onDestroyed(function(){
    this.$('.ntpEpiRatingTd').popover('destroy');
});
