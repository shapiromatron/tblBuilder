import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import _ from 'underscore';

import { getPercentOrText } from '/imports/api/utilities';

import NtpEpiDescriptive from '/imports/collections/ntpEpiDescriptive';
import NtpEpiResult from '/imports/collections/ntpEpiResult';

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

import './table.html';


Template.ntpEpiDescTbl.helpers(_.extend(abstractTblHelpers, {
    showPlots() {
        return Session.get('epiRiskShowPlots');
    },
}));
Template.ntpEpiDescTbl.onRendered(function() {
    initDraggables(this.find('#sortable'), '.dhOuter', NtpEpiDescriptive);
    toggleRowVisibilty(Session.get('reorderRows'), this.$('.dragHandle'));
});


Template.ntpEpiDescriptiveRow.helpers(_.extend({
    getCol2: function() {
        let html = '', rrCases, rrCtrls;
        if (this.isCaseControl()) {
            rrCases = getPercentOrText(this.responseRateCase);
            rrCtrls = getPercentOrText(this.responseRateControl);
            if (rrCases.length > 0) rrCases = ` (${rrCases})`;
            if (rrCtrls.length > 0) rrCtrls = ` (${rrCtrls})`;

            html += `<strong>Cases: </strong>${this.populationSizeCases||''}${rrCases}; ${this.selectionDescriptionCases||''}<br>`;
            html += `<strong>Controls: </strong>${this.populationSizeControls||''}${rrCtrls}; ${this.selectionDescriptionControls||''}`;
        } else {
            html += `${this.cohortPopulationSize||''}; ${this.populationEligibility||''}`;
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
Template.ntpEpiDescriptiveRow.events(abstractRowEvents);
Template.ntpEpiDescriptiveRow.onRendered(function() {
    initDraggables(this.find('#sortableInner'), '.dhInner', NtpEpiResult);
    toggleRowVisibilty(Session.get('reorderRows'), this.$('.dragHandle'));
});


Template.ntpEpiResultTbl.helpers(_.extend({
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
Template.ntpEpiResultTbl.events(abstractNestedTableEvents);


