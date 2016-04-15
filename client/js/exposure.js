import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import _ from 'underscore';

import {
    abstractMainHelpers,
    abstractTblHelpers,
    abstractRowEvents,
    abstractFormEvents,
} from '/imports/api/client/templates';


Template.exposureMain.helpers(abstractMainHelpers);
Template.exposureMain.onCreated(function() {
    Session.set('evidenceType', 'exposureEvidence');
    Session.set('evidenceShowNew', false);
    Session.set('evidenceShowAll', false);
    Session.set('evidenceEditingId', null);
    this.subscribe('exposureEvidence', Session.get('Tbl')._id);
});
Template.exposureMain.onDestroyed(function() {
    Session.set('evidenceType', null);
    Session.set('evidenceShowNew', false);
    Session.set('evidenceShowAll', false);
    Session.set('evidenceEditingId', null);
    Session.set('sortsAndFilters', null);
});


Template.exposureTbl.helpers(abstractTblHelpers);
Template.exposureTbl.onRendered(function() {
    clientShared.initDraggables(this.find('#sortable'), '.dhOuter', ExposureEvidence);
    clientShared.toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'));
});


Template.exposureRow.events(abstractRowEvents);


var toggleOccFields = function(tmpl) {
    var selector = tmpl.find('select[name="exposureScenario"]'),
        scen = $(selector).find('option:selected')[0].value;
    if (ExposureEvidence.isOccupational(scen)) {
        $(tmpl.findAll('.isOcc')).show();
        $(tmpl.findAll('.isNotOcc')).hide();
    } else {
        $(tmpl.findAll('.isOcc')).hide();
        $(tmpl.findAll('.isNotOcc')).show();
    }
};


Template.exposureForm.events(_.extend({
    'change select[name="exposureScenario"]': function(evt, tmpl) {
        return toggleOccFields(tmpl);
    },
}, abstractFormEvents));
Template.exposureForm.onRendered(function() {
    toggleOccFields(this);
    clientShared.toggleQA(this, this.data.isQA);
    clientShared.initPopovers(this);
});
Template.exposureForm.onDestroyed(function() {
    clientShared.destroyPopovers(this);
});
