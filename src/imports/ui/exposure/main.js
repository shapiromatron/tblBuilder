import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import {
    abstractMainHelpers,
} from '/imports/api/client/templates';

import './main.html';


Template.exposureMain.helpers(abstractMainHelpers);
Template.exposureMain.onCreated(function() {
    Session.set('evidenceType', 'exposureEvidence');
    Session.set('evidenceShowNew', false);
    Session.set('evidenceShowAll', false);
    Session.set('evidenceEditingId', null);
    this.subscribe('exposureEvidence', Session.get('Tbl')._id);
});
Template.exposureMain.onDestroyed(function() {
    Session.set('evidenceType', null);
    Session.set('evidenceShowNew', false);
    Session.set('evidenceShowAll', false);
    Session.set('evidenceEditingId', null);
    Session.set('sortsAndFilters', null);
});

