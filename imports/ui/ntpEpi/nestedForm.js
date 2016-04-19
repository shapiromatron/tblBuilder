import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';

import _ from 'underscore';

import organSiteCategories from '/imports/collections/epiResult/organSiteCategories';
import NtpEpiDescriptive from '/imports/collections/ntpEpiDescriptive';
import NtpEpiResult from '/imports/collections/ntpEpiResult';

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

import { toggleStudyDesignFields } from './form.js';



let toggleRequiredFields = function(tmpl, duration){
    let result_id = Session.get('nestedEvidenceEditingId'),
        desc_id,
        d,
        studyDesign;
    if (result_id){
        desc_id = NtpEpiResult.findOne(result_id).parent_id;
    } else {
        desc_id = tmpl.data.parent._id;
    }
    d = NtpEpiDescriptive.findOne(desc_id);
    studyDesign = d.studyDesign;
    toggleStudyDesignFields(tmpl, studyDesign, duration);
};


Template.ntpEpiResultForm.helpers(
    _.extend({
        allAccordiansShown: function(){
            return Template.instance().allAccordiansShown.get();
        },
    }, abstractNestedFormHelpers)
);
Template.ntpEpiResultForm.events(_.extend({
    'click #inner-addRiskRow': function(evt, tmpl) {
        let tbody = tmpl.find('.riskEstimateTbody');
        Blaze.renderWithData(Template.riskEstimateForm, {}, tbody);
    },
    'show.bs.modal': function(evt, tmpl){
        let div = tmpl.$('input[name="organSiteCategory"]').closest('div');
        Blaze.renderWithData(Template.epiOrganSiteCategories,
            {options: organSiteCategories.options},
            div[0], div.find('label')[0]);
    },
    'click #toggleAccordian': function(evt, tmpl){
        evt.preventDefault();
        evt.stopPropagation();
        tmpl.allAccordiansShown.set(!tmpl.allAccordiansShown.get());
        let action = (tmpl.allAccordiansShown.get()) ? 'show' : 'hide';
        tmpl.$('.collapse').collapse(action);
    },
}, abstractNestedFormEvents));
Template.ntpEpiResultForm.onCreated(function(){
    this.allAccordiansShown = new ReactiveVar(false);
});
Template.ntpEpiResultForm.onRendered(function() {
    let object = NtpEpiResult.findOne({_id: Session.get('nestedEvidenceEditingId')});
    if (object != null) toggleQA(this, object.isQA);
    this.$('#modalDiv').modal('toggle');
    initPopovers(this);
    toggleRequiredFields(this, 1e-6);
});
Template.ntpEpiResultForm.onDestroyed(function() {
    destroyPopovers(this);
});
