import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import {
    abstractMainHelpers,
} from '/imports/api/client/templates';

import './main.html';


Template.genotoxHumanExposureMain.helpers(abstractMainHelpers);
Template.genotoxHumanExposureMain.onCreated(function() {
    Session.set('evidenceType', 'genotoxHumanExposureEvidence');
    Session.set('nestedEvidenceType', 'genotoxHumanExposureResult');
    Session.set('evidenceShowNew', false);
    Session.set('evidenceShowAll', false);
    Session.set('evidenceEditingId', null);
    this.subscribe('genotoxHumanExposureEvidence', Session.get('Tbl')._id);
});
Template.genotoxHumanExposureMain.onDestroyed(function() {
    Session.set('evidenceType', null);
    Session.set('nestedEvidenceType', null);
    Session.set('evidenceShowNew', false);
    Session.set('evidenceShowAll', false);
    Session.set('evidenceEditingId', null);
    Session.set('sortsAndFilters', null);
});
