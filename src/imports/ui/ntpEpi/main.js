import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import {
    abstractMainHelpers,
} from '/imports/api/client/templates';

import './main.html';


Template.ntpEpiMain.helpers(abstractMainHelpers);
Template.ntpEpiMain.onCreated(function() {
    Session.set('evidenceType', 'ntpEpiDescriptive');
    Session.set('nestedEvidenceType', 'ntpEpiResult');
    Session.set('evidenceShowNew', false);
    Session.set('evidenceShowAll', false);
    Session.set('evidenceEditingId', null);
    Session.set('nestedEvidenceEditingId', null);
    this.subscribe('ntpEpiDescriptive', Session.get('Tbl')._id);
});
Template.ntpEpiMain.onDestroyed(function() {
    Session.set('evidenceType', null);
    Session.set('nestedEvidenceType', null);
    Session.set('evidenceShowNew', false);
    Session.set('evidenceShowAll', false);
    Session.set('evidenceEditingId', null);
    Session.set('nestedEvidenceEditingId', null);
    Session.set('sortsAndFilters', null);
});

