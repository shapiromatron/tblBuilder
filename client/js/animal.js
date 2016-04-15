import {Meteor} from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';
import { Session } from 'meteor/session';

import _ from 'underscore';

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



Template.animalMain.helpers(abstractMainHelpers);
Template.animalMain.onCreated(function() {
    Session.set('evidenceType', 'animalEvidence');
    Session.set('evidenceShowNew', false);
    Session.set('evidenceShowAll', false);
    Session.set('evidenceEditingId', null);
    Session.set('nestedEvidenceEditingId', null);
    this.subscribe('animalEvidence', Session.get('Tbl')._id);
});
Template.animalMain.onDestroyed(function() {
    Session.set('evidenceType', null);
    Session.set('evidenceShowNew', false);
    Session.set('evidenceShowAll', false);
    Session.set('evidenceEditingId', null);
    Session.set('nestedEvidenceEditingId', null);
    Session.set('sortsAndFilters', null);
});


Template.animalTbl.helpers(_.extend({
    getReportTypes: function() {
        return [
            {
                type: 'AnimalHtmlTblRecreation',
                fn: 'ani-results',
                text: 'Download Word: HTML table recreation',
            },
        ];
    },
}, abstractTblHelpers));
Template.animalTbl.onRendered(function() {
    clientShared.initDraggables(this.find('#sortable'), '.dhOuter', AnimalEvidence);
    clientShared.toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'));
});


var getFirstEndpoint = function(parent_id) {
    return AnimalEndpointEvidence.findOne({parent_id: parent_id});
};
Template.animalRow.helpers(_.extend({
    getDoses: function() {
        return AnimalEvidence.getDoses(getFirstEndpoint(this._id));
    },
    getNStarts: function() {
        return AnimalEvidence.getNStarts(getFirstEndpoint(this._id));
    },
    getNSurvivings: function() {
        return AnimalEvidence.getNSurvivings(getFirstEndpoint(this._id));
    },
}, abstractRowHelpers));
Template.animalRow.events(abstractRowEvents);
Template.animalRow.onRendered(function() {
    clientShared.initDraggables(this.find('#sortableInner'), '.dhInner', AnimalEndpointEvidence);
    clientShared.toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'));
});


Template.animalForm.events(abstractFormEvents);
Template.animalForm.onRendered(function() {
    clientShared.toggleQA(this, this.data.isQA);
    clientShared.initPopovers(this);
});
Template.animalForm.onDestroyed(function() {
    clientShared.destroyPopovers(this);
});


var getTrendTestDataTbl = function(data){
        if (!data.inputs) return [];
        return _.map(data.inputs.incs, function(d, i){

            var n = data.inputs.ns[i],
                percent = Math.round((d/n)*100),
                getPvalue = function(val, i){
                    var txt = '-';
                    val = parseFloat(val, 10);

                    if ((i>0) && (_.isFinite(val))){

                        if(val <= 0.05){

                            if(val < 0.001){
                                txt = '<0.001';
                            } else {
                                txt = val.toFixed(3);
                            }
                        } else {
                            txt = 'n.s.';
                        }
                    }
                    return txt;
                };

            return {
                'incidence': d,
                'n': n,
                'percent': percent,
                'pvalue': getPvalue(data.pairwise.pvalues[i], i),
            };
        });
    },
    formatPairwise = function(val){
        var txt = 'error';
        val = parseFloat(val, 10);
        if (_.isFinite(val)){
            if(val < 0.001){
                txt = '<0.001';
            } else {
                txt = val.toFixed(3);
            }
        }
        return txt;
    };

Template.animalTrendTestReport.helpers({
    getFormattedReport: function(){
        var data = JSON.parse(this.trendTestReport || '{}'),
            trs = getTrendTestDataTbl(data),
            txt = '';

        // add pairwise test
        var t = new Table();
        trs.forEach(function(tr) {
            t.cell('Incidence', tr.incidence);
            t.cell('N', tr.n);
            t.cell('%', tr.percent + '%');
            t.cell('p-value', tr.pvalue);
            t.newRow();
        });
        txt = t.toString();

        // add trend-test
        txt += `\n\nTrend-test result: ${formatPairwise(data.trend.pvalue)}`;

        return txt;
    },
});


Template.animalEndpointTbl.helpers(_.extend({
    getIncidents: function() {
        var txt = '',
            val = AnimalEvidence.getIncidents(this.endpointGroups),
            sig;

        if (val !== '') {
            sig = this.incidence_significance || '';
            txt = `<tr><td>${val}</td><td>${sig}</td></tr>`;
        }
        return txt;
    },
    getMultiplicities: function() {
        var txt = '',
            val = AnimalEvidence.getMultiplicities(this.endpointGroups),
            sig;

        if (val !== '') {
            sig = this.multiplicity_significance || '';
            txt = `<tr><td>${val}</td><td>${sig}</td></tr>`;
        }
        return txt;
    },
    getTotalTumours: function() {
        var txt = '',
            val = AnimalEvidence.getTotalTumours(this.endpointGroups),
            sig;

        if (val !== '') {
            sig = this.total_tumours_significance || '';
            txt = `<tr><td>${val}</td><td>${sig}</td></tr>`;
        }
        return txt;
    },
}, abstractNestedTableHelpers));
Template.animalEndpointTbl.events(abstractNestedTableEvents);


Template.animalEndpointForm.helpers(abstractNestedFormHelpers);
Template.animalEndpointForm.events(_.extend({
    'click #inner-addEndpointGroup': function(evt, tmpl) {
        var tbody = tmpl.find('.endpointGroupTbody');
        return Blaze.renderWithData(Template.animalEndpointGroupForm, {}, tbody);
    },
    'click #trendTest': function(evt, tmpl) {
        return Meteor.call('getAnimalBioassayStatistics', this._id, function(err, response) {
            if (err) console.error(err);
        });
    },
}, abstractNestedFormEvents));
Template.animalEndpointForm.onRendered(function() {
    var aniResult = AnimalEndpointEvidence.findOne(
          {_id: Session.get('nestedEvidenceEditingId')});
    if (aniResult != null) {
        clientShared.toggleQA(this, aniResult.isQA);
    }
    $('#modalDiv').modal('toggle');
    clientShared.initPopovers(this);
});
Template.animalEndpointForm.onDestroyed(function() {
    clientShared.destroyPopovers(this);
});


Template.animalEndpointGroupForm.events({
    'click #endpointGroup-delete': function(evt, tmpl) {
        Blaze.remove(tmpl.view);
        return $(tmpl.view._domrange.members).remove();
    },
});
