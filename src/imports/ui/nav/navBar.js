import {Meteor} from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { getHTMLTitleBase } from '/imports/api/client/utilities';
import './navBar.html';


Template.navBar.helpers({
    getTitle(){
        return Meteor.settings.public.context.toUpperCase();
    },
    getClassDebug(){
        if (Meteor.settings.public.debug) return 'navbar-debug';
    },
    getTitleDebug(){
        if (Meteor.settings.public.debug) return ' (development)';
    },
});
Template.navBar.onCreated(function() {
    document.title = getHTMLTitleBase();
});
