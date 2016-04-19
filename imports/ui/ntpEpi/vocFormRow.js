import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';

import { vocHelpers } from './vocFormTable';
import './vocFormRow.html';


Template.vocFormRow.helpers(vocHelpers);
Template.vocFormRow.events({
    'click #delete': function(evt, tmpl) {
        Blaze.remove(tmpl.view);
        tmpl.$(tmpl.view._domrange.members).remove();
    },
    'click #moveUp': function(evt, tmpl) {
        let tr = tmpl.$(tmpl.firstNode);
        tr.insertBefore(tr.prev());
    },
    'click #moveDown': function(evt, tmpl) {
        let tr = tmpl.$(tmpl.firstNode);
        tr.insertAfter(tr.next());
    },
});
