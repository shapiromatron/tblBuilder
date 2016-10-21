import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import {
    abstractMainHelpers,
} from '/imports/api/client/templates';

import './main.html';


Template.genotoxMain.helpers(abstractMainHelpers);
Template.genotoxMain.onCreated(function() {
    Session.set('evidenceType', 'genotoxEvidence');
    Session.set('evidenceShowNew', false);
    Session.set('evidenceShowAll', false);
    Session.set('evidenceEditingId', null);
    this.subscribe('genotoxEvidence', Session.get('Tbl')._id);
});
Template.genotoxMain.onDestroyed(function() {
    Session.set('evidenceType', null);
    Session.set('evidenceShowNew', false);
    Session.set('evidenceShowAll', false);
    Session.set('evidenceEditingId', null);
    Session.set('sortsAndFilters', null);
});
