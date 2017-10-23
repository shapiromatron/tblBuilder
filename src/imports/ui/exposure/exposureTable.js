import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import ExposureEvidence from '/imports/collections/exposure';
import ExposureResult from '/imports/collections/exposureResult';

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

import './exposureTable.html';


Template.exposureTbl.helpers(abstractTblHelpers);
Template.exposureTbl.onRendered(function() {
    initDraggables(this.find('#sortable'), '.dhOuter', ExposureEvidence);
    toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'));
});

Template.exposureRow.helpers(abstractRowHelpers);
Template.exposureRow.events(abstractRowEvents);
Template.exposureRow.onRendered(function() {
    initDraggables(this.find('#sortableInner'), '.dhInner', ExposureResult);
    toggleRowVisibilty(Session.get('reorderRows'), this.$('.dragHandle'));
});

Template.exposureEndpointTbl.helpers(abstractNestedTableHelpers);
Template.exposureEndpointTbl.events(abstractNestedTableEvents);
