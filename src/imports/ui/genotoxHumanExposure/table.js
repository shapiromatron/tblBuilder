import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import GenotoxHumanExposure from '/imports/collections/genotoxHumanExposure';
import GenotoxHumanExposureResult from '/imports/collections/genotoxHumanExposureResult';

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


Template.genotoxHumanExposureTbl.helpers(abstractTblHelpers);
Template.genotoxHumanExposureTbl.onRendered(function() {
    initDraggables(this.find('#sortable'), '.dhOuter', GenotoxHumanExposure);
    toggleRowVisibilty(Session.get('reorderRows'), this.$('.dragHandle'));
});


Template.genotoxHumanExposureRow.helpers(abstractRowHelpers);
Template.genotoxHumanExposureRow.events(abstractRowEvents);
Template.genotoxHumanExposureRow.onRendered(function() {
    initDraggables(this.find('#sortableInner'), '.dhInner', GenotoxHumanExposureResult);
    toggleRowVisibilty(Session.get('reorderRows'), this.$('.dragHandle'));
});


Template.genotoxHumanExposureResultTbl.helpers(abstractNestedTableHelpers);
Template.genotoxHumanExposureResultTbl.events(abstractNestedTableEvents);
