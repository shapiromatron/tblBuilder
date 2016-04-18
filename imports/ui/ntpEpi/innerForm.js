import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';
import { Session } from 'meteor/session';

import _ from 'underscore';

import organSiteCategories from '/imports/api/shared/epiResult/organSiteCategories';
import NtpEpiResult from '/imports/api/shared/ntpEpiResult';

import {
    abstractNestedFormHelpers,
    abstractNestedFormEvents,
} from '/imports/api/client/templates';

import {
    toggleQA,
    initPopovers,
    destroyPopovers,
} from '/imports/api/client/utilities';


Template.ntpEpiResultForm.helpers(abstractNestedFormHelpers);
Template.ntpEpiResultForm.events(_.extend({
    'click #inner-addRiskRow': function(evt, tmpl) {
        var tbody = tmpl.find('.riskEstimateTbody');
        Blaze.renderWithData(Template.riskEstimateForm, {}, tbody);
    },
    'show.bs.modal': function(evt, tmpl){
        let div = tmpl.$('input[name="organSiteCategory"]').closest('div');
        Blaze.renderWithData(Template.epiOrganSiteCategories,
            {options: organSiteCategories.options},
            div[0], div.find('label')[0]);
    },
}, abstractNestedFormEvents));
Template.ntpEpiResultForm.onRendered(function() {
    var object = NtpEpiResult.findOne({_id: Session.get('nestedEvidenceEditingId')});
    if (object != null) toggleQA(this, object.isQA);
    this.$('#modalDiv').modal('toggle');
    initPopovers(this);
});
Template.ntpEpiResultForm.onDestroyed(function() {
    destroyPopovers(this);
});
