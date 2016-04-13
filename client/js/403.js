import { Template } from 'meteor/templating';


Template.Http403.onRendered(function() {
    $('#login-dropdown-list')
        .addClass('alert-info');
});
Template.Http403.onDestroyed(function() {
    $('#login-dropdown-list')
        .removeClass('alert-info');
});
