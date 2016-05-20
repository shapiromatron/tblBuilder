import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';
import { Session } from 'meteor/session';

import _ from 'underscore';

import { getPercentOrText } from '/imports/api/utilities';

import organSiteCategories from '/imports/collections/epiResult/organSiteCategories';
import EpiDescriptive from '/imports/collections/epiDescriptive';
import EpiResult from '/imports/collections/epiResult';

import {
    abstractMainHelpers,
    abstractTblHelpers,
    abstractRowHelpers,
    abstractRowEvents,
    abstractFormEvents,
    abstractNestedTableHelpers,
    abstractNestedTableEvents,
    abstractNestedFormHelpers,
    abstractNestedFormEvents,
} from '/imports/api/client/templates';

import {
    initDraggables,
    toggleRowVisibilty,
    toggleQA,
    initPopovers,
    destroyPopovers,
} from '/imports/api/client/utilities';

import {
    toggleRiskPlot,
} from '/imports/ui/epi/forestPlot';

import './epi.html';


Template.epiMain.helpers(abstractMainHelpers);
Template.epiMain.onCreated(function() {
    Session.set('evidenceType', 'epiDescriptive');
    Session.set('evidenceShowNew', false);
    Session.set('evidenceShowAll', false);
    Session.set('evidenceEditingId', null);
    Session.set('nestedEvidenceEditingId', null);
    this.subscribe('epiDescriptive', Session.get('Tbl')._id);
});
Template.epiMain.onDestroyed(function() {
    Session.set('evidenceType', null);
    Session.set('evidenceShowNew', false);
    Session.set('evidenceShowAll', false);
    Session.set('evidenceEditingId', null);
    Session.set('nestedEvidenceEditingId', null);
    Session.set('sortsAndFilters', null);
});


Template.epiDescriptiveTbl.helpers(_.extend({
    getReportTypes: function() {
        var reports = [
            {
                type: 'EpiHtmlTblRecreation',
                fn: 'epi-results',
                text: 'Download Word: HTML table recreation',
            },
        ];
        return reports;
    },
}, abstractTblHelpers));
Template.epiDescriptiveTbl.onRendered(function() {
    toggleRiskPlot();
    initDraggables(this.find('#sortable'), '.dhOuter', EpiDescriptive);
    toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'));
});


Template.epiDescriptiveRow.helpers(_.extend({
    getCol2: function() {
        var html = '', rrCase, rrCtrl;
        if (this.isCaseControl()) {
            rrCase = getPercentOrText(this.responseRateCase);
            rrCtrl = getPercentOrText(this.responseRateControl);
            if (rrCase.length > 0) rrCase = ` (${rrCase})`;
            if (rrCtrl.length > 0) rrCtrl = ` (${rrCtrl})`;

            html += `<strong>Cases: </strong>${this.populationSizeCase}${rrCase}; ${this.sourceCase}<br>`;
            html += `<strong>Controls: </strong>${this.populationSizeControl}${rrCtrl}; ${this.sourceControl}`;
        } else {
            html += `${this.populationSize}; ${this.eligibilityCriteria}`;
        }

        html += '<br><strong>Exposure assess. method: </strong>';

        if (this.exposureAssessmentType.toLowerCase().search('other') >= 0) {
            html += 'other';
        } else {
            html += '' + this.exposureAssessmentType;
        }

        if (this.exposureAssessmentNotes != null) html += `; ${this.exposureAssessmentNotes}`;
        if (this.outcomeDataSource != null) html += `<br>${this.outcomeDataSource}`;

        return html;
    },
}, abstractRowHelpers));
Template.epiDescriptiveRow.events(abstractRowEvents);
Template.epiDescriptiveRow.onRendered(function() {
    initDraggables(this.find('#sortableInner'), '.dhInner', EpiResult);
    toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'));
});


var getEligibilityCriteria = function(tmpl, obj, data) {
    // two different fields with this name; one for case and one for cohort
    tmpl.findAll('textarea[name="eligibilityCriteria"]').forEach(function(fld){
        if (fld.value.length > 0) obj.eligibilityCriteria = fld.value;
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
                case 'coexposures':
                    val.forEach((d)=>$el.trigger('addItem', d));
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
};
Template.epiResultTbl.helpers(_.extend({
    showPlots: function() {
        return Session.get('epiRiskShowPlots');
    },
    displayTrendTest: function() {
        return this.trendTest != null;
    },
    displayEffectUnits: function(d) {
        return d.effectUnits != null;
    },
}, abstractNestedTableHelpers));
Template.epiResultTbl.events(abstractNestedTableEvents);


Template.organSiteTd.helpers({
    getRowspan: function() {
        var rows = this.riskEstimates.length;
        if (this.effectUnits != null) rows += 1;
        return rows;
    },
});


Template.epiOrganSiteCategories.onRendered(function() {
    $(this.findAll('li')).click(function(e) {
        e.preventDefault();
        e.stopPropagation();
    });
});


Template.epiResultForm.helpers(abstractNestedFormHelpers);
Template.epiResultForm.events(_.extend({
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
Template.epiResultForm.onRendered(function() {
    var epiResult = EpiResult.findOne({_id: Session.get('nestedEvidenceEditingId')});
    if (epiResult != null) toggleQA(this, epiResult.isQA);
    $('#modalDiv').modal('toggle');
    initPopovers(this);
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
