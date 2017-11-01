import _ from 'underscore';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import {
    abstractMainHelpers,
} from '/imports/api/client/templates';

import './main.html';


let sharedHelpers = {
    epiShowDescriptive: function(){
        return Session.get('epiShowDescriptive');
    },
};

Template.epiMain.helpers(_.extend(sharedHelpers, abstractMainHelpers));
Template.epiMain.onCreated(function() {
    Session.set('evidenceType', 'epiDescriptive');
    Session.set('nestedEvidenceType', 'epiResult');
    Session.set('evidenceShowNew', false);
    Session.set('evidenceShowAll', false);
    Session.set('evidenceEditingId', null);
    Session.set('nestedEvidenceEditingId', null);
    Session.setDefault('epiShowDescriptive', true);
    this.subscribe('epiDescriptive', Session.get('Tbl')._id);
});
Template.epiMain.onDestroyed(function() {
    Session.set('evidenceType', null);
    Session.set('nestedEvidenceType', null);
    Session.set('evidenceShowNew', false);
    Session.set('evidenceShowAll', false);
    Session.set('evidenceEditingId', null);
    Session.set('nestedEvidenceEditingId', null);
    Session.set('sortsAndFilters', null);
});


Template.optToggleEpiView.helpers(sharedHelpers);
Template.optToggleEpiView.events({
    'click a': function(){
        Session.set('epiShowDescriptive', !Session.get('epiShowDescriptive'));
    },
});
