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

import NtpEpiDescriptive from '/imports/collections/ntpEpiDescriptive';

import './vocForm.html';


Template.vocForm.helpers({
    allAccordiansShown: function(){
        return Template.instance().allAccordiansShown.get();
    },
});
Template.vocForm.events(_.extend({
    'click #toggleAccordian': function(evt, tmpl){
        tmpl.allAccordiansShown.set(!tmpl.allAccordiansShown.get());
        let action = (tmpl.allAccordiansShown.get()) ? 'show' : 'hide';
        tmpl.$('.collapse').collapse(action);
    },
}, abstractFormEvents));
Template.vocForm.onCreated(function(){
    this.allAccordiansShown = new ReactiveVar(false);
});
Template.vocForm.onRendered(function() {
    toggleQA(this, this.data.isQA);
    initPopovers(this);
});
Template.vocForm.onDestroyed(function() {
    destroyPopovers(this);
});



Template.ntpEpiDescSelectList.helpers({
    isSelected: function(current, selected) {
        return current._id === selected;
    },
    getOptions: function(){
        return _.chain(NtpEpiDescriptive.find().fetch())
            .filter((d) => !d.isHidden)
            .each((d) => d.getReference())
            .sortBy((d) => d.reference.name)
            .value();
    },
});
