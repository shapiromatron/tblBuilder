import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';
import { Session } from 'meteor/session';
import NtpEpiResult from '/imports/api/shared/ntpEpiResult';


var vocHelpers = {
    getVocSchema: function(){
        return NtpEpiResult.variableOfConcernSchema.schema();
    },
    isNew: function(){
        return Session.get('nestedEvidenceEditingId') === null;
    },
};


Template.variablesOfConcernForm.helpers(vocHelpers);
Template.variablesOfConcernForm.events({
    'click #delete': function(evt, tmpl) {
        Blaze.remove(tmpl.view);
        tmpl.$(tmpl.view._domrange.members).remove();
    },
    'click #moveUp': function(evt, tmpl) {
        var tr = tmpl.$(tmpl.firstNode);
        tr.insertBefore(tr.prev());
    },
    'click #moveDown': function(evt, tmpl) {
        var tr = tmpl.$(tmpl.firstNode);
        tr.insertAfter(tr.next());
    },
});
