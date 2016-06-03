import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Tracker } from 'meteor/tracker';

import _ from 'underscore';

import Tables from '/imports/collections/tables';
import {
    createErrorDiv,
    initDraggables,
    activateInput,
    updateValues,
    toggleRowVisibilty,
    getHTMLTitleBase,
} from '/imports/api/client/utilities';
import {
    newValues,
} from '/imports/api/utilities';


Template.home.onCreated(function() {
    document.title = getHTMLTitleBase();
    Session.set('tablesShowNew', false);
    Session.set('tablesEditingId', null);
    Session.set('reorderRows', false);
});
Template.home.onDestroyed(function() {
    Session.set('tablesShowNew', false);
    Session.set('tablesEditingId', null);
    Session.set('reorderRows', false);
});


Template.tableOpts.events({
    'click #tables-show-create': function(evt, tmpl) {
        Session.set('tablesShowNew', true);
        Tracker.flush();
    },
    'click #reorderRows': function(evt, tmpl) {
        var isReorder = !Session.get('reorderRows');
        Session.set('reorderRows', isReorder);
        if (isReorder) {
            tmpl.sortables = _.map($('.sortables'), function(v){
                return initDraggables(v, '.moveTableHandle', Tables);
            });
        } else {
            tmpl.sortables.forEach(function(v) { return v.destroy();});
        }
        toggleRowVisibilty(isReorder, $('.moveTableHandle'));
    },
});


Template.volumesList.helpers({
    getMonographs: function() {
        var opts = {fields: {'volumeNumber': 1}, sort: {'volumeNumber': -1}};
        return _.chain(Tables.find({}, opts).fetch())
                .pluck('volumeNumber')
                .uniq()
                .value();
    },
    getMonographAgents: function(volumeNumber){
        return _.chain(Tables.find({volumeNumber: volumeNumber}).fetch())
                .pluck('monographAgent')
                .sort()
                .uniq(true)
                .value()
                .join(', ');
    },
    showNew: function() {
        return Session.get('tablesShowNew');
    },
});


Template.volumeTableList.onCreated(function() {
    document.title = `Volume ${this.data.volumeNumber} | ${getHTMLTitleBase()}`;
});
Template.volumeTableList.helpers({
    getMonographAgents: function() {
        var tbls = Tables.find(
            {'volumeNumber': this.volumeNumber},
            {sort: {'monographAgent': 1}}).fetch();
        return _.chain(tbls)
                .pluck('monographAgent')
                .uniq()
                .value();
    },
    getTables: function(volumeNumber, monographAgent) {
        return Tables.find(
            {'volumeNumber': volumeNumber, 'monographAgent': monographAgent},
            {sort: {'sortIdx': 1}}).fetch();
    },
    showNew: function() {
        return Session.get('tablesShowNew');
    },
    isEditing: function() {
        return Session.equals('tablesEditingId', this._id);
    },
    getStatusColorClass: function(tbl) {
        return tbl.getStatusColorClass();
    },
});
Template.volumeTableList.events({
    'click #tables-show-edit': function(evt, tmpl) {
        Session.set('tablesEditingId', this._id);
        Tracker.flush();
        return activateInput(tmpl.find('input[name=volumeNumber]'));
    },
});


var getUserPermissionsObject = function(tmpl) {
    var ids = {},
        results = [],
        user_id;

    ['projectManagers', 'teamMembers', 'reviewers'].forEach(function(role){
        tmpl.findAll('.' + role + ' li').forEach(function(li){
            user_id = $(li).data('user_id');
            if (ids[user_id] === undefined){
                results.push({'user_id': user_id, 'role': role});
                ids[user_id] = true;
            }
        });
    });
    return results;
};
Template.tablesForm.helpers({
    getTblTypeOptions: function() {
        return Tables.typeOptions;
    },
    getStatusOptions: function() {
        return _.keys(Tables.statusOptions);
    },
});
Template.tablesForm.events({
    'click #tables-create': function(evt, tmpl) {
        var errorDiv, isValid, obj;
        obj = newValues(tmpl.find('#tablesForm'));
        obj['user_roles'] = getUserPermissionsObject(tmpl);
        delete obj['projectManagers'];
        delete obj['teamMembers'];
        delete obj['reviewers'];
        isValid = Tables.simpleSchema()
                        .namedContext()
                        .validate(obj);
        if (isValid) {
            Tables.insert(obj);
            return Session.set('tablesShowNew', false);
        } else {
            errorDiv = createErrorDiv(Tables.simpleSchema().namedContext());
            return $(tmpl.find('#errors')).html(errorDiv);
        }
    },
    'click #tables-create-cancel': function(evt, tmpl) {
        return Session.set('tablesShowNew', false);
    },
    'click #tables-update': function(evt, tmpl) {
        var errorDiv, isValid, modifier, vals;
        vals = updateValues(tmpl.find('#tablesForm'), this);
        vals['user_roles'] = getUserPermissionsObject(tmpl);
        delete vals['projectManagers'];
        delete vals['teamMembers'];
        delete vals['reviewers'];
        modifier = {$set: vals};
        isValid = Tables.simpleSchema()
                        .namedContext()
                        .validate(modifier, {modifier: true});
        if (isValid) {
            Tables.update(this._id, modifier);
            return Session.set('tablesEditingId', null);
        } else {
            errorDiv = createErrorDiv(Tables.simpleSchema().namedContext());
            return $(tmpl.find('#errors')).html(errorDiv);
        }
    },
    'click #tables-update-cancel': function(evt, tmpl) {
        return Session.set('tablesEditingId', null);
    },
    'click #tables-delete': function(evt, tmpl) {
        Tables.remove(this._id);
        return Session.set('tablesEditingId', null);
    },
});
Template.tablesForm.onRendered(function() {
    activateInput(this.find('input[name=volumeNumber]'));
});
