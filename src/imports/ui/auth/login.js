import { Template } from 'meteor/templating';

import { Router } from 'meteor/iron:router';


Template._loginButtonsLoggedInDropdown.events({
    'click #login-buttons-edit-profile': function(event) {
        event.stopPropagation();
        Template._loginButtons.toggleDropdown();
        Router.go('profileEdit');
    },
});
