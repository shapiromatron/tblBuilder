import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import genotoxHumanExposureResult from '/imports/collections/ntpEpiResult';

import {
    abstractNestedFormHelpers,
    abstractNestedFormEvents,
} from '/imports/api/client/templates';

import {
    toggleQA,
    initPopovers,
    destroyPopovers,
} from '/imports/api/client/utilities';

import './nestedForm.html';


Template.genotoxHumanExposureResultForm.helpers(abstractNestedFormHelpers);
Template.genotoxHumanExposureResultForm.events(abstractNestedFormEvents);
Template.genotoxHumanExposureResultForm.onRendered(function() {
    let object = genotoxHumanExposureResult.findOne({_id: Session.get('nestedEvidenceEditingId')});
    if (object != null) toggleQA(this, object.isQA);
    this.$('#modalDiv').modal('toggle');
    initPopovers(this);
});
Template.genotoxHumanExposureResultForm.onDestroyed(function() {
    destroyPopovers(this);
});
