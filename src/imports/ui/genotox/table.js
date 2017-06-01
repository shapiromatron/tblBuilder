import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import GenotoxEvidence from '/imports/collections/genotox';

import {
    abstractTblHelpers,
    abstractRowEvents,
} from '/imports/api/client/templates';

import {
    initDraggables,
    toggleRowVisibilty,
} from '/imports/api/client/utilities';

import './table.html';


Template.genotoxTbl.helpers(abstractTblHelpers);
Template.genotoxTbl.onRendered(function() {
    initDraggables(this.find('#sortable'), '.dhOuter', GenotoxEvidence);
    toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'));
});


Template.genotoxRow.events(abstractRowEvents);
