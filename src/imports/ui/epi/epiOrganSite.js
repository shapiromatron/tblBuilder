import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Tracker } from 'meteor/tracker';
import { ReactiveVar } from 'meteor/reactive-var';

import _ from 'underscore';

import EpiDescriptive from '/imports/collections/epiDescriptive';
import EpiResult from '/imports/collections/epiResult';
import NtpEpiDescriptive from '/imports/collections/ntpEpiDescriptive';
import NtpEpiResult from '/imports/collections/ntpEpiResult';

import {
    abstractMainHelpers,
} from '/imports/api/client/templates';

import {
    appFlavor,
} from '/imports/utilities';

import {
    returnExcelFile,
    getHTMLTitleBase,
} from '/imports/api/client/utilities';

import {
    rerenderAxis,
} from '/imports/ui/epi/forestPlot';

import './epiOrganSite.html';


let getAllDescriptions = function(){
        return NtpEpiDescriptive.find().fetch()
            .concat(EpiDescriptive.find().fetch());
    }, getAllResults = function(){
        return NtpEpiResult.find().fetch()
            .concat(EpiResult.find().fetch());
    };

Template.epiOrganSiteMain.helpers(_.extend({
    showPlots: function() {
        return Session.get('epiRiskShowPlots');
    },
    getOrganSiteOptions: function() {
        return _.chain(getAllResults())
                .pluck('organSiteCategory')
                .uniq()
                .sort()
                .map(function(d) {return `<option>${d}</option>`;})
                .value();
    },
    object_list: function() {
        let tmpl = Template.instance(),
            organSiteCategories = tmpl.organSiteCategories.get(),
            results = _.filter(getAllResults(), (el)=>{
                return _.contains(organSiteCategories, el.organSiteCategory);
            }),
            descriptions = _.indexBy(getAllDescriptions(), '_id'),
            rows = [];


        results.forEach(function(res) {
            let desc = descriptions[res.parent_id];
            res.riskEstimates.forEach(function(d, i){
                _.extend(d, {
                    idx: i,
                    res_id: res._id,
                    res: res,
                    desc: desc,
                    display: true,
                    first: i===0,
                    rows: res.riskEstimates.length,
                });
                rows.push(d);
            });
        });

        tmpl.eosRows = rows;
        Session.set('eosChanged', new Date());
        return rows;
    },
}, abstractMainHelpers));
Template.epiOrganSiteMain.events({
    'change #organSiteSelector': function(evt, tmpl) {
        tmpl.organSiteCategories.set($(evt.target).val() || []);
        rerenderAxis();
    },
    'click #selectVisible': function(evt, tmpl) {
        Session.set('eosEditMode', !Session.get('eosEditMode'));
    },
    'click #metaReport': function(evt, tmpl) {

        let tabularGenerator = (appFlavor() === 'ntp')?
                NtpEpiDescriptive.tablularMetaAnalysisRow:
                EpiDescriptive.tablularMetaAnalysisRow,
            rows = _.chain(tmpl.eosRows)
                    .filter((d) => d.display)
                    .map((d)=> tabularGenerator(d))
                    .value(),
            fn = 'meta-analysis.xlsx';
        Meteor.call('epiMetaAnalysisDownload', rows, function(err, response) {
            returnExcelFile(response, fn);
        });
    },
});
Template.epiOrganSiteMain.onCreated(function() {
    document.title = `${this.data.volumeNumber}: ${this.data.monographAgent} | ${getHTMLTitleBase()}`;
    this.subscribe('epiCollective', this.data.volumeNumber, this.data.monographAgent);
    this.organSiteCategories = new ReactiveVar([]);
    Session.setDefault('eosEditMode', false);
    Session.setDefault('epiRiskShowPlots', false);

  // reactively determine the first row and row-length of displayed values
    this.eosRows = [];
    var self = this;
    Tracker.autorun(function (){
        var matched = {},
            ts = Session.get('eosChanged'); // get for reactivity
        if (Session.get('eosEditMode') === false) {
            self.eosRows.forEach(function(v){
                if (v.display && matched[v.res_id] === undefined){
                    matched[v.res_id] = true;
                    v.firstVisible = true;
                    v.rowsVisible = _.where(self.eosRows,
                      {'display': true, 'res_id': v.res_id}).length;
                } else {
                    v.firstVisible = false;
                    v.rowsVisible = null;
                }
            });
        }
    });
});
Template.epiOrganSiteMain.onDestroyed(function() {
    Session.set('eosEditMode', null);
    Session.get('eosChanged', null);
});


Template.epiOrganSiteTr.helpers({
    isDisplayed: function(){
        return (Session.get('eosEditMode')) ? true : this.display;
    },
    editMode: function(){
        return Session.get('eosEditMode');
    },
    showPlots: function() {
        return Session.get('epiRiskShowPlots');
    },
    getFirstDisplay: function(){
        return (Session.get('eosEditMode')) ? this.first : this.firstVisible;
    },
    getNumRows: function(){
        return (Session.get('eosEditMode')) ? this.rows : this.rowsVisible;
    },
    getDisplayValue: function(){
        return (this.display) ? 'checked' : '';
    },
});
Template.epiOrganSiteTr.events({
    'click .hideRow' : function(evt, tmpl){
        tmpl.data.display = !tmpl.data.display;
    },
});
