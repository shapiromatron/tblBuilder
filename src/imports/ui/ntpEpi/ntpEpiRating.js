import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import _ from 'underscore';

import {
    abstractMainHelpers,
    abstractTblHelpers,
} from '/imports/api/client/templates';

import {
    returnExcelFile,
} from '/imports/api/client/utilities';

import NtpEpiResult from '/imports/collections/ntpEpiResult';

import './ntpEpiRating.html';


Template.ntpEpiRatingMain.helpers(abstractMainHelpers);
Template.ntpEpiRatingMain.onCreated(function() {
    Session.set('evidenceType', 'ntpEpiDescriptive');
    this.subscribe('ntpEpiDescriptive', Session.get('Tbl')._id);
});
Template.ntpEpiRatingMain.onDestroyed(function() {
    Session.set('evidenceType', null);
});

Template.ntpEpiRatingTable.helpers(_.extend(
    {
        results: function(){
            return NtpEpiResult.getUniqueRatingCollection(
                NtpEpiResult.find().fetch());
        },
    }, abstractTblHelpers));
Template.ntpEpiRatingTable.onRendered(function(){
    this.$('.ntpEpiRatingTd').popover({
        trigger: 'hover',
        placement: 'top',
        delay: {show: 0, hide: 100},
        container: 'body',
    });
});
Template.ntpEpiRatingTable.events({
    'click #downloadExcel': function(evt, tmpl){
        var tblId = Session.get('Tbl')._id,
            fn = 'epi-confounding-matrix.xlsx';
        Meteor.call('ntpEpiRatingsDownload', tblId, function(err, response) {
            returnExcelFile(response, fn);
        });
    },
});
Template.ntpEpiRatingTable.onDestroyed(function(){
    this.$('.ntpEpiRatingTd').popover('destroy');
});
