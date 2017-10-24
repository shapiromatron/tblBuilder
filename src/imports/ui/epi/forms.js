import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';
import { Session } from 'meteor/session';

import _ from 'underscore';

import organSiteCategories from '/imports/collections/epiResult/organSiteCategories';
import EpiDescriptive from '/imports/collections/epiDescriptive';
import EpiResult from '/imports/collections/epiResult';

import {
    abstractFormEvents,
    abstractNestedFormHelpers,
    abstractNestedFormEvents,
} from '/imports/api/client/templates';

import {
    toggleQA,
    initPopovers,
    destroyPopovers,
} from '/imports/api/client/utilities';

import './forms.html';



var getEligibilityCriteria = function(tmpl, obj, data) {
    // two different fields with this name; one for case and one for cohort
    tmpl.findAll('textarea[name="eligibilityCriteria"]').forEach(function(fld){
        if ($(fld).is(':visible')) obj.eligibilityCriteria = fld.value;
    });
    return obj;
};
Template.epiDescriptiveForm.helpers({
    createPreValidate: function(tmpl, obj, data) {
        return getEligibilityCriteria(tmpl, obj, data);
    },
    updatePreValidate: function(tmpl, obj, data) {
        return getEligibilityCriteria(tmpl, obj, data);
    },
});
Template.epiDescriptiveForm.events(_.extend({
    'change select[name="studyDesign"]': function(evt, tmpl) {
        return toggleCCfields(tmpl);
    },
    'referenceChanged input[name="referenceID"]': function(evt, tmpl, ref) {
        /*
        If the same reference has already been extracted and QA'd, then copy
        contents of this reference to this field.
        */
        const tblID = Session.get('Tbl')._id;
        const refID = ref._id;

        let copyMatchToForm = function(obj){
            _.each(obj, function(val, key){
                let $el = tmpl.$(`[name="${key}"]`);
                switch (key){
                case 'referenceID':
                    break;
                default:
                    if ($el) $el.val(val);
                    break;
                }
            });
            tmpl.$('[name="studyDesign"]').trigger('change');
        };
        Meteor.call('findMatchingExtractedData', refID, tblID, function(err, response) {
            if (response){
                let res = confirm('This study has already been extracted in other tables - copy content here?');
                if (res) copyMatchToForm(response);
            }
        });
    },
}, abstractFormEvents));
Template.epiDescriptiveForm.onRendered(function() {
    toggleCCfields(this);
    toggleQA(this, this.data.isQA);
    initPopovers(this);
});
Template.epiDescriptiveForm.onDestroyed(function() {
    destroyPopovers(this);
});


var toggleCCfields = function(tmpl) {
    var selector = tmpl.find('select[name="studyDesign"]'),
        studyD = $(selector).find('option:selected')[0].value;
    if (EpiDescriptive.isCaseControl(studyD)) {
        $(tmpl.findAll('.isNotCCinput')).hide();
        $(tmpl.findAll('.isCCinput')).show();
    } else {
        $(tmpl.findAll('.isCCinput')).hide();
        $(tmpl.findAll('.isNotCCinput')).show();
    }
    if (EpiDescriptive.hasCohort(studyD)) {
        $(tmpl.findAll('.cohortOnly')).show();
    } else {
        $(tmpl.findAll('.cohortOnly')).hide();
    }
};


Template.epiOrganSiteCategories.onRendered(function() {
    $(this.findAll('li')).click(function(e) {
        e.preventDefault();
        e.stopPropagation();
    });
});


Template.epiResultForm.helpers(_.extend({
    getRiskEstimateSchema(){
        return EpiResult.riskEstimateSchema.schema();
    },
}, abstractNestedFormHelpers));
Template.epiResultForm.events(_.extend({
    'click #inner-addRiskRow': function(evt, tmpl) {
        var tbody = tmpl.find('.riskEstimateTbody');
        Blaze.renderWithData(Template.riskEstimateForm, {}, tbody);
    },
    'show.bs.modal': function(evt, tmpl){
        let div = tmpl.$('input[name="organSiteCategory"]').closest('div');
        tmpl.epiOrganSiteCategories = Blaze.renderWithData(Template.epiOrganSiteCategories,
            {options: organSiteCategories.options},
            div[0], div.find('label')[0]);
    },
    'hidden.bs.modal': function(evt, tmpl){
        if(tmpl.epiOrganSiteCategories){
            Blaze.remove(tmpl.epiOrganSiteCategories);
            tmpl.epiOrganSiteCategories = undefined;
        }
    },
}, abstractNestedFormEvents));
Template.epiResultForm.onRendered(function() {
    $('#modalDiv').modal('toggle').one('shown.bs.modal', ()=>{
        var epiResult = EpiResult.findOne({_id: Session.get('nestedEvidenceEditingId')});
        if (epiResult != null){
            toggleQA(this, epiResult.isQA);
        }
        initPopovers(this);
    });
});
Template.epiResultForm.onDestroyed(function() {
    destroyPopovers(this);
});


Template.riskEstimateForm.events({
    'click #epiRiskEstimate-delete': function(evt, tmpl) {
        Blaze.remove(tmpl.view);
        $(tmpl.view._domrange.members).remove();
    },
    'click #moveUp': function(evt, tmpl) {
        var tr = $(tmpl.firstNode);
        tr.insertBefore(tr.prev());
    },
    'click #moveDown': function(evt, tmpl) {
        var tr = $(tmpl.firstNode);
        tr.insertAfter(tr.next());
    },
});


Template.epiExposureAssessmentForm.events(abstractFormEvents);
Template.epiExposureAssessmentForm.onRendered(function() {
    toggleQA(this, this.data.isQA);
    initPopovers(this);
});
Template.epiExposureAssessmentForm.onDestroyed(function() {
    destroyPopovers(this);
});
