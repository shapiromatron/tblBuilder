import { Template } from 'meteor/templating';

import {
    abstractFormEvents,
} from '/imports/api/client/templates';

import {
    toggleQA,
    initPopovers,
    destroyPopovers,
} from '/imports/api/client/utilities';

import './form.html';


Template.genotoxHumanExposureEvidenceForm.events(abstractFormEvents);
Template.genotoxHumanExposureEvidenceForm.onRendered(function() {
    toggleQA(this, this.data.isQA);
    initPopovers(this);
});
Template.genotoxHumanExposureEvidenceForm.onDestroyed(function() {
    destroyPopovers(this);
});
