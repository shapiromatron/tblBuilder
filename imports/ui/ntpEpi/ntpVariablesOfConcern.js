import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';

import _ from 'underscore';

import NtpEpiConfounder from '/imports/collections/ntpEpiConfounder';

import {
    abstractMainHelpers,
    abstractTblHelpers,
    abstractFormEvents,
} from '/imports/api/client/templates';

import {
    toggleQA,
    initPopovers,
    destroyPopovers,
} from '/imports/api/client/utilities';

import './ntpVariablesOfConcern.html';


Template.ntpVariablesOfConcernMain.helpers(abstractMainHelpers);
Template.ntpVariablesOfConcernMain.onCreated(function() {
    Session.set('evidenceType', 'ntpEpiConfounder');
    this.subscribe('ntpEpiConfounder', Session.get('Tbl')._id);
});
Template.ntpVariablesOfConcernMain.onDestroyed(function() {
    Session.set('evidenceType', null);
});


Template.ntpVocTables.events({
    'click #show-create': (evt, tmpl) =>{
        this.showForm = tmpl.showForm.set(!tmpl.showForm.get());
    },
});
Template.ntpVocTables.helpers(abstractTblHelpers);
Template.ntpVocTables.onCreated(function(){
    let results = NtpEpiConfounder.find().fetch(),
        eps = _.chain(results)
                .pluck('organSiteCategory')
                .uniq()
                .sort()
                .value(),
        groups = _.groupBy(results, 'organSiteCategory');

    _.extend(this, {
        eps: eps,
        endpointGroups: groups,
        showForm: new ReactiveVar(true),
    });
});


Template.ntpVocTable.helpers({
    getHeaders: function(){
        return ['Reference: organ-site'].concat(Template.instance().vocVariables);
    },
    getRows: function(){
        return Template.instance().vocRows;
    },
});
Template.ntpVocTable.onRendered(function(){
    this.$('.ntpEpiRatingTd').popover({
        trigger: 'hover',
        placement: 'top',
        delay: {show: 0, hide: 100},
        container: 'body',
    });
});
Template.ntpVocTable.onDestroyed(function(){
    this.$('.ntpEpiRatingTd').popover('destroy');
});


Template.ntpVocForm.helpers({
    allAccordiansShown: function(){
        return Template.instance().allAccordiansShown.get();
    },
});
Template.ntpVocForm.events(_.extend({
    'click #toggleAccordian': function(evt, tmpl){
        tmpl.allAccordiansShown.set(!tmpl.allAccordiansShown.get());
        let action = (tmpl.allAccordiansShown.get()) ? 'show' : 'hide';
        tmpl.$('.collapse').collapse(action);
    },
}, abstractFormEvents));
Template.ntpVocForm.onCreated(function(){
    this.allAccordiansShown = new ReactiveVar(false);
});
Template.ntpVocForm.onRendered(function() {
    toggleQA(this, this.data.isQA);
    initPopovers(this);
});
Template.ntpVocForm.onDestroyed(function() {
    destroyPopovers(this);
});
