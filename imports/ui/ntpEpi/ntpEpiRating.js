import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import _ from 'underscore';

import {
    abstractMainHelpers,
    abstractTblHelpers,
} from '/imports/api/client/templates';
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
            let results = NtpEpiResult.find().fetch();
            results.forEach((d)=>{
                d.getDescription();
                d.description.getReference();
                d.description.getConfounders();
            });
            return results;
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
Template.ntpEpiRatingTable.onDestroyed(function(){
    this.$('.ntpEpiRatingTd').popover('destroy');
});


Template.ntpEpiRatingRow.helpers({
    getOrganSite(){
        return (this.organSite)?
            `${this.organSiteCategory}: ${this.organSite}`:
            this.organSiteCategory;
    },
});
