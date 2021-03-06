import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Spacebars } from 'meteor/spacebars';
import { UI } from 'meteor/ui';

import _ from 'underscore';

import {
    userCanEdit,
} from '/imports/api/client/utilities';


var uiHelpers = {
    userCanEdit: function() {
        return userCanEdit(Session.get('Tbl'));
    },
    ballotBoolean: function(bool) {
        var icon = bool.hash.bool ? 'glyphicon-ok' : 'glyphicon-remove';
        return Spacebars.SafeString(`<span class='glyphicon ${icon}'></span>`);
    },
    eachIndex: function(array) {
        return _.map(array, function(v, i){ return {value: v, index: i};});
    },
    isEqual: function(kw) {
        return kw.hash.current === kw.hash.target;
    },
    qaMark: function(isQA) {
        var icon, title;
        if (Session.get('showQAflags')) {
            icon = isQA ? 'glyphicon-ok' : 'glyphicon-remove';
            title = isQA ? 'QA\'d' : 'Not QA\'d';
            return Spacebars.SafeString(`<span title='${title}' class='btn-xs text-muted pull-right glyphicon ${icon}'></span>`);
        }
    },
    hasContactEmail: function() {
        return (Meteor.settings != null) &&
               (Meteor.settings['public'] != null) &&
               (Meteor.settings['public'].contact_email != null);
    },
    contactEmail: function() {
        var email = Meteor.settings.public.contact_email,
            flavor = Meteor.settings.public.context.toUpperCase();

        return `${email}?subject=[${flavor} Table Builder]`;
    },
    commaList: function(lst) {
        return lst.join(', ');
    },
    addIndex: function(lst) {
        return _.map(lst, function(v, i) {
            return {i: i, v: v};
        });
    },
    equals: function(a, b) {
        return a === b;
    },
    getUserDescription: function() {
        return (this.profile && this.profile.fullName)
          ? this.profile.fullName
          : _.pluck(this.emails, 'address').join(', ');
    },
    getMonographAgent: function(){
        return Session.get('monographAgent');
    },
    preserveWhitespaceInHtml(txt){
        if (txt) return txt.replace(/(\n)+/g, '<br>');
    },
    showDebugInformation(id_, idx){
        let el = '';
        if (Session.get('showSortIndex')){
            el += `<p class='debugInfo'>${idx}</p>`;
        }
        if (Session.get('showIds')){
            el += `<p class='debugInfo'>${id_}</p>`;
        }
        return el;
    },
};

_.each(uiHelpers, function(func, name){
    UI.registerHelper(name, func);
});
