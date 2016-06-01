import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import _ from 'underscore';

import NtpAnimalEvidence from '/imports/collections/ntpAnimalEvidence';
import NtpAnimalEndpointEvidence from '/imports/collections/ntpAnimalEndpointEvidence';

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


Template.ntpAnimalEvidenceTable.helpers(abstractTblHelpers);
Template.ntpAnimalEvidenceTable.onRendered(function() {
    initDraggables(this.find('#sortable'), '.dhOuter', NtpAnimalEvidence);
    toggleRowVisibilty(Session.get('reorderRows'), this.$('.dragHandle'));
});


var getFirstEndpoint = function(parent_id) {
    return NtpAnimalEndpointEvidence.findOne({parent_id: parent_id});
};
Template.ntpAnimalEvidenceRow.helpers(_.extend({
    getDoses: function() {
        return NtpAnimalEvidence.getDoses(getFirstEndpoint(this._id));
    },
    getNStarts: function() {
        return NtpAnimalEvidence.getNStarts(getFirstEndpoint(this._id));
    },
    getNSurvivings: function() {
        return NtpAnimalEvidence.getNSurvivings(getFirstEndpoint(this._id));
    },
}, abstractRowHelpers));
Template.ntpAnimalEvidenceRow.events(abstractRowEvents);
Template.ntpAnimalEvidenceRow.onRendered(function() {
    initDraggables(this.find('#sortableInner'), '.dhInner', NtpAnimalEndpointEvidence);
    toggleRowVisibilty(Session.get('reorderRows'), this.$('.dragHandle'));
});


Template.ntpAnimalEndpointEvidenceTable.helpers(abstractNestedTableHelpers);
Template.ntpAnimalEndpointEvidenceTable.events(abstractNestedTableEvents);

