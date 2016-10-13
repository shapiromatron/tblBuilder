import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import './main.html';


Template.adminMain.onCreated(function() {
    Session.set('adminUserEditingId', null);
    Session.set('adminUserShowNew', false);
});
Template.adminMain.onDestroyed(function() {
    Session.set('adminUserEditingId', null);
    Session.set('adminUserShowNew', false);
});
