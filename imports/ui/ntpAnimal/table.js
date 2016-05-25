import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import _ from 'underscore';

import NtpEpiDescriptive from '/imports/collections/ntpEpiDescriptive';
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


Template.ntpAnimalEvidenceTable.helpers(_.extend(abstractTblHelpers, {
    showPlots() {
        return Session.get('epiRiskShowPlots');
    },
}));
Template.ntpAnimalEvidenceTable.onRendered(function() {
    initDraggables(this.find('#sortable'), '.dhOuter', NtpEpiDescriptive);
    toggleRowVisibilty(Session.get('reorderRows'), this.$('.dragHandle'));
});


Template.ntpAnimalEvidenceRow.helpers(abstractRowHelpers);
Template.ntpAnimalEvidenceRow.events(abstractRowEvents);
Template.ntpAnimalEvidenceRow.onRendered(function() {
    initDraggables(this.find('#sortableInner'), '.dhInner', NtpAnimalEndpointEvidence);
    toggleRowVisibilty(Session.get('reorderRows'), this.$('.dragHandle'));
});


Template.ntpAnimalEndpointEvidenceTable.helpers(abstractNestedTableHelpers);
Template.ntpAnimalEndpointEvidenceTable.events(abstractNestedTableEvents);

