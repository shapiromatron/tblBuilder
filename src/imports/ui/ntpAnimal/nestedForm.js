import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';

import _ from 'underscore';

import NtpAnimalEvidence from '/imports/collections/ntpAnimalEvidence';

import {
    abstractNestedFormHelpers,
    abstractNestedFormEvents,
} from '/imports/api/client/templates';

import {
    toggleQA,
    initPopovers,
    destroyPopovers,
} from '/imports/api/client/utilities';

import './nestedForm.html';


Template.ntpAnimalEndpointEvidenceForm.helpers(
    _.extend({
        allAccordiansShown: function(){
            return Template.instance().allAccordiansShown.get();
        },
    }, abstractNestedFormHelpers)
);
Template.ntpAnimalEndpointEvidenceForm.events(_.extend({
    'click #toggleAccordian': function(evt, tmpl){
        evt.preventDefault();
        evt.stopPropagation();
        tmpl.allAccordiansShown.set(!tmpl.allAccordiansShown.get());
        let action = (tmpl.allAccordiansShown.get()) ? 'show' : 'hide';
        tmpl.$('.collapse').collapse(action);
    },
}, abstractNestedFormEvents));
Template.ntpAnimalEndpointEvidenceForm.onCreated(function(){
    this.allAccordiansShown = new ReactiveVar(false);
});
Template.ntpAnimalEndpointEvidenceForm.onRendered(function() {
    let object = NtpAnimalEvidence.findOne({_id: Session.get('nestedEvidenceEditingId')});
    if (object != null) toggleQA(this, object.isQA);
    this.$('#modalDiv').modal('toggle');
    initPopovers(this);
});
Template.ntpAnimalEndpointEvidenceForm.onDestroyed(function() {
    destroyPopovers(this);
});
