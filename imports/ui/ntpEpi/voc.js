import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';
import { Session } from 'meteor/session';
import NtpEpiResult from '/imports/api/shared/ntpEpiResult';

import {
    initPopovers,
    destroyPopovers,
} from '/imports/api/client/utilities';


var vocHelpers = {
    getVocSchema: function(){
        return NtpEpiResult.variableOfConcernSchema.schema();
    },
    isNew: function(){
        return Session.get('nestedEvidenceEditingId') === null;
    },
};

Template.variablesOfConcern.helpers(vocHelpers);
Template.variablesOfConcern.events({
    'click #addVocRow': function(evt, tmpl) {
        var tbody = tmpl.find('tbody');
        Blaze.renderWithData(Template.variablesOfConcernForm, {}, tbody);
    },
});
Template.variablesOfConcern.onRendered(function() {
    initPopovers(this);
});
Template.variablesOfConcern.onDestroyed(function() {
    destroyPopovers(this);
});


