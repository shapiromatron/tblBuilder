import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import {
    abstractMainHelpers,
} from '/imports/api/client/templates';


import './epi.html';


Template.epiMain.helpers(abstractMainHelpers);
Template.epiMain.onCreated(function() {
    Session.set('evidenceType', 'epiDescriptive');
    Session.set('evidenceShowNew', false);
    Session.set('evidenceShowAll', false);
    Session.set('evidenceEditingId', null);
    Session.set('nestedEvidenceEditingId', null);
    this.subscribe('epiDescriptive', Session.get('Tbl')._id);
});
Template.epiMain.onDestroyed(function() {
    Session.set('evidenceType', null);
    Session.set('evidenceShowNew', false);
    Session.set('evidenceShowAll', false);
    Session.set('evidenceEditingId', null);
    Session.set('nestedEvidenceEditingId', null);
    Session.set('sortsAndFilters', null);
});
