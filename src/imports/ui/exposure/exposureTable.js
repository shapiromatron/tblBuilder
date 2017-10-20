import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import ExposureEvidence from '/imports/collections/exposure';

import {
    abstractTblHelpers,
    abstractRowEvents,
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


Template.exposureRow.events(abstractRowEvents);
