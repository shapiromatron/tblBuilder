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
            let existing = {};
            return _.chain(NtpEpiResult.find().fetch())
                .each((d)=>{
                    d.getDescription();
                    d.description.getReference();
                    d.description.setResultConfounder(d);
                    d._unique = `${d.description.reference.name}-${d.organSiteCategory}`;
                })
                .filter((d)=>{
                    // only show first unique reference + organ site category combination
                    if (existing[d._unique] === undefined){
                        existing[d._unique] = true;
                        return true;
                    }
                    return false;
                })
                .sortBy((d)=>d.description.reference.name)
                .sortBy((d)=>d.organSiteCategory)
                .value();
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
