import { Template } from 'meteor/templating';

import _ from 'underscore';

import ExposureEvidence from '/imports/collections/exposure';

import {
    abstractFormEvents,
} from '/imports/api/client/templates';

import {
    toggleQA,
    initPopovers,
    destroyPopovers,
} from '/imports/api/client/utilities';

import './exposureForm.html';


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
    toggleQA(this, this.data.isQA);
    initPopovers(this);
});
Template.exposureForm.onDestroyed(function() {
    destroyPopovers(this);
});
