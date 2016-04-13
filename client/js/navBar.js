import {Meteor} from 'meteor/meteor';
import { Template } from 'meteor/templating';


Template.navBar.helpers({
    getTitle: function() {
        return Meteor.settings['public'].context.toUpperCase();
    },
});
Template.navBar.onCreated(function() {
    document.title = utilities.getHTMLTitleBase();
});
