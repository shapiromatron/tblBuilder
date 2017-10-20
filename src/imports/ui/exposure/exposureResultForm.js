import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import ExposureResult from '/imports/collections/exposureResult';

import {
    abstractNestedFormHelpers,
    abstractNestedFormEvents,
} from '/imports/api/client/templates';

import {
    toggleQA,
    initPopovers,
    destroyPopovers,
} from '/imports/api/client/utilities';

import './exposureResultForm.html';


Template.exposureResultForm.helpers(abstractNestedFormHelpers);
Template.exposureResultForm.events(abstractNestedFormEvents);
Template.exposureResultForm.onRendered(function() {
    $('#modalDiv').modal('toggle').one('shown.bs.modal', ()=>{
        var obj = ExposureResult.findOne({_id: Session.get('nestedEvidenceEditingId')});
        if (obj != null){
            toggleQA(this, obj.isQA);
        }
        initPopovers(this);
    });
});
Template.exposureResultForm.onDestroyed(function() {
    destroyPopovers(this);
});

