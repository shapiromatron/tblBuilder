import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';
import { Session } from 'meteor/session';
import NtpAnimalEndpointEvidence from '/imports/collections/ntpAnimalEndpointEvidence';

import {
    initPopovers,
    destroyPopovers,
} from '/imports/api/client/utilities';

import './endpointGroupFormTable.html';


let egHelpers = {
    getEndpointGroupSchema: function(){
        return NtpAnimalEndpointEvidence.endpointGroupSchema.schema();
    },
    isNew: function(){
        return Session.get('nestedEvidenceEditingId') === null;
    },
};

Template.endpointGroupFormTable.helpers(egHelpers);
Template.endpointGroupFormTable.events({
    'click #addRow': function(evt, tmpl) {
        Blaze.renderWithData(
            Template.endpointGroupFormRow, {}, tmpl.find('tbody'));
    },
});
Template.endpointGroupFormTable.onRendered(function() {
    initPopovers(this);
});
Template.endpointGroupFormTable.onDestroyed(function() {
    destroyPopovers(this);
});

export { egHelpers };
