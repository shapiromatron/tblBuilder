import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import _ from 'underscore';

import {
    abstractFormEvents,
} from '/imports/api/client/templates';

import {
    toggleQA,
    initPopovers,
    destroyPopovers,
} from '/imports/api/client/utilities';

import './form.html';


Template.ntpAnimalEvidenceForm.helpers({
    allAccordiansShown: function(){
        return Template.instance().allAccordiansShown.get();
    },
});
Template.ntpAnimalEvidenceForm.events(_.extend({
    'click #toggleAccordian': function(evt, tmpl){
        tmpl.allAccordiansShown.set(!tmpl.allAccordiansShown.get());
        let action = (tmpl.allAccordiansShown.get()) ? 'show' : 'hide';
        tmpl.$('.collapse').collapse(action);
    },
}, abstractFormEvents));
Template.ntpAnimalEvidenceForm.onCreated(function(){
    this.allAccordiansShown = new ReactiveVar(false);
});
Template.ntpAnimalEvidenceForm.onRendered(function() {
    toggleQA(this, this.data.isQA);
    initPopovers(this);
});
Template.ntpAnimalEvidenceForm.onDestroyed(function() {
    destroyPopovers(this);
});
