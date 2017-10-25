import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import _ from 'underscore';

import EpiDescriptive from '/imports/collections/epiDescriptive';
import EpiResult from '/imports/collections/epiResult';

import {
    abstractTblHelpers,
    abstractRowHelpers,
    abstractRowEvents,
    abstractNestedTableHelpers,
    abstractNestedTableEvents,
} from '/imports/api/client/templates';

import {
    initDraggables,
    toggleRowVisibilty,
} from '/imports/api/client/utilities';

import './tables.html';


Template.epiDescriptiveTbl.helpers(_.extend({
    showPlots: function() {
        return Session.get('epiRiskShowPlots');
    },
}, abstractTblHelpers));
Template.epiDescriptiveTbl.onRendered(function() {
    initDraggables(this.find('#sortable'), '.dhOuter', EpiDescriptive);
    toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'));
});


Template.epiDescriptiveRow.helpers(_.extend({
    getCol2: function() {
        var html = '';
        if (this.isCaseControl()) {
            html += `<strong>Cases: </strong>${this.populationSizeCase}; ${this.sourceCase}<br>`;
            html += `<strong>Controls: </strong>${this.populationSizeControl}; ${this.sourceControl}`;
        } else {
            html += `${this.populationSize}; ${this.eligibilityCriteria}`;
        }

        html += '<br><strong>Exposure assess. method: </strong>';

        if (this.exposureAssessmentType.toLowerCase().search('other') >= 0) {
            html += 'other';
        } else {
            html += '' + this.exposureAssessmentType;
        }

        if (this.exposureAssessmentNotes != null){
            html += `; ${this.exposureAssessmentNotes}`;
        }

        return html;
    },
}, abstractRowHelpers));
Template.epiDescriptiveRow.events(abstractRowEvents);
Template.epiDescriptiveRow.onRendered(function() {
    initDraggables(this.find('#sortableInner'), '.dhInner', EpiResult);
    toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'));
});


Template.epiResultTbl.helpers(_.extend({
    showPlots: function() {
        return Session.get('epiRiskShowPlots');
    },
    displayTrendTest: function() {
        return (this.trendTest) ? true : false;
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

// override object list method:
let epiExposureAssessmentTblHelpers = _.extend(
    {}, abstractTblHelpers, {
        object_list: function() {
            let tbl_id = Session.get('Tbl')._id;
            return EpiDescriptive.getExposureAssessmentEvidence(tbl_id);
        },
    });

Template.epiExposureAssessmentTbl.helpers(epiExposureAssessmentTblHelpers);
Template.epiExposureAssessmentTbl.events({
    'click #show-edit': function(evt, tmpl) {
        Session.set('evidenceEditingId', this._id);
    },
});
