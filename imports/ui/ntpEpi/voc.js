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
    this.subscribe('ntpEpiConfounder', Session.get('Tbl')._id);
});
Template.vocMain.onDestroyed(function() {
    Session.set('evidenceType', null);
});


Template.vocTables.events({
    'click #show-create': (evt, tmpl) =>{
        this.showForm = tmpl.showForm.set(!tmpl.showForm.get());
    },
});
Template.vocTables.helpers({
    organSites(){
        return Template.instance().organSites.get();
    },
});
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
    getRows: function(){
        return Template.instance().objects.get();
    },
}, abstractTblHelpers));
Template.vocTable.onCreated(function(){
    // reactively get confounders w/ this organ site-category
    let objects = new ReactiveVar([]);
    Tracker.autorun(()=>{
        let obj = NtpEpiConfounder
            .find({organSiteCategory: this.data.organSiteCategory})
            .fetch();
        _.each(obj, (d)=>d.getDescription());
        objects.set(obj);
    });
    _.extend(this, {
        objects,
    });
});


Template.vocRow.helpers(abstractRowHelpers);
Template.vocRow.events(abstractRowEvents);
