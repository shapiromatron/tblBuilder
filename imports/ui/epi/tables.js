import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import _ from 'underscore';

import { getPercentOrText } from '/imports/api/utilities';

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
