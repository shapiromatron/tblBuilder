import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';

import _ from 'underscore';

import NtpEpiConfounder from '/imports/collections/ntpEpiConfounder';

import {
    abstractMainHelpers,
    abstractTblHelpers,
    abstractRowHelpers,
    abstractRowEvents,
} from '/imports/api/client/templates';

import './voc.html';


Template.vocMain.helpers(abstractMainHelpers);
Template.vocMain.onCreated(function() {
    Session.set('evidenceType', 'ntpEpiConfounder');
    Session.setDefault('vocMatrixView', false);
    this.subscribe('ntpEpiConfounder', Session.get('Tbl')._id);
});
Template.vocMain.onDestroyed(function() {
    Session.set('evidenceType', null);
});


Template.vocActions.helpers({
    showMatrixView(){
        return Session.get('vocMatrixView');
    },
});
Template.vocActions.events({
    'click #matrixToggle': function(){
        Session.set('vocMatrixView', !Session.get('vocMatrixView'));
    },
});


Template.vocTables.events({
    'click #show-create': (evt, tmpl) =>{
        this.showForm = tmpl.showForm.set(!tmpl.showForm.get());
    },
});
Template.vocTables.helpers(_.extend({
    organSites(){
        return Template.instance().organSites.get();
    },
}, abstractTblHelpers));
Template.vocTables.onCreated(function(){
    // reactively get distinct organ site categories
    let organSites = new ReactiveVar([]);
    Tracker.autorun(()=>{
        let results = NtpEpiConfounder.find().fetch(),
            sites = _.chain(results)
                    .pluck('organSiteCategory')
                    .uniq()
                    .sort()
                    .value();
        organSites.set(sites);
    });

    _.extend(this, {
        organSites,
        showForm: new ReactiveVar(true),
    });
});


Template.vocTable.helpers(_.extend({
    showMatrixView(){
        return Session.get('vocMatrixView');
    },
    getRows: function(){
        return Template.instance().objects.get();
    },
    getMatrixHeaders: function(){
        return Template.instance().vocs.get();
    },
}, abstractTblHelpers));
Template.vocTable.onCreated(function(){
    // reactively get confounders w/ this organ site-category
    let objects = new ReactiveVar([]),
        vocs = new ReactiveVar([]);
    Tracker.autorun(()=>{

        let obj = NtpEpiConfounder
            .find({organSiteCategory: this.data.organSiteCategory})
            .fetch();
        _.each(obj, (d)=>d.getDescription());
        objects.set(obj);

        let vocs_ = _.chain(obj)
            .map((d)=> _.pluck(d.variablesOfConcern, 'vocName'))
            .flatten()
            .uniq()
            .sort()
            .value();
        vocs.set(vocs_);
    });
    _.extend(this, {
        objects,
        vocs,
    });
});


Template.vocMatrixHeader.helpers({
    getThWidth: function(){
        var w = 80 / Math.max(Template.instance().data.headers.length, 1);
        return `width: ${w}%`;
    },
});


Template.vocMatrixRow.helpers(_.extend({
    getText: function(vocName){
        let voc = _.findWhere(Template.instance().data.object.variablesOfConcern, {vocName});
        return (voc)? voc.vocRuleOutConfounding: '-';
    },
}, abstractRowHelpers));
Template.vocMatrixRow.events(abstractRowEvents);


Template.vocRow.helpers(abstractRowHelpers);
Template.vocRow.events(abstractRowEvents);
