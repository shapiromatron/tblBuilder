import {Meteor} from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { getHTMLTitleBase } from '/imports/api/client/utilities';


Template.navBar.helpers({
    getTitle: function() {
        return Meteor.settings['public'].context.toUpperCase();
    },
});
Template.navBar.onCreated(function() {
    document.title = getHTMLTitleBase();
});
