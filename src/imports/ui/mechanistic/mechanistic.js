import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Tracker } from 'meteor/tracker';

import MechanisticEvidence from '/imports/collections/mechanistic';

import {
    createErrorDiv,
} from '/imports/api/client/utilities';

import {
    initDraggables,
    activateInput,
    updateValues,
    toggleRowVisibilty,
    initPopovers,
    destroyPopovers,
} from '/imports/api/client/utilities';

import {
    newValues,
} from '/imports/api/utilities';


var initializeDraggable = function(tmpl, options) {
    var id = options.isSection ? tmpl.data.section : tmpl.data._id,
        container = tmpl.find('#dragContainer_' + id);

    if (container) {
        initDraggables(container, '.dragHandle_' + id,
            MechanisticEvidence, {draggable: '.dragObj_' + id}
        );
        toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'));
    }
};


Template.mechanisticOpts.helpers({
    isAllCollapsed: function() {
        return Session.get('mechanisticAllCollapsed');
    },
});


Template.mechanisticMain.events({
    'click #mechanistic-toggleShowAllRows': function() {
        var els = $('.accordianBody');
        if (Session.get('mechanisticAllCollapsed')) {
            els.collapse('show');
        } else {
            els.collapse('hide');
        }
        Session.set('mechanisticAllCollapsed', !Session.get('mechanisticAllCollapsed'));
    },
    'click #mechanistic-reorderRows': function(evt, tmpl) {
        Session.set('reorderRows', !Session.get('reorderRows'));
        toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'));
    },
});
Template.mechanisticMain.onCreated(function() {
    Session.set('evidenceType', 'mechanisticEvidence');
    Session.set('mechanisticAllCollapsed', true);
    Session.set('evidenceShowNew', false);
    Session.set('evidenceEditingId', null);
    this.subscribe('mechanisticEvidence', Session.get('Tbl')._id);
});
Template.mechanisticMain.onDestroyed(function() {
    Session.set('evidenceType', null);
    Session.set('mechanisticAllCollapsed', true);
    Session.set('evidenceShowNew', false);
    Session.set('evidenceEditingId', null);
});
Template.mechanisticMain.onRendered(function() {
    $(this.findAll('.collapse')).on('show.bs.collapse', function() {
        $(this).parent().addClass('evidenceExpanded');
    });
    $(this.findAll('.collapse')).on('hide.bs.collapse', function() {
        $(this).parent().removeClass('evidenceExpanded');
    });
});


Template.mechanisticTbl.helpers({
    getMechanisticEvidenceSections: function() {
        return MechanisticEvidence.evidenceSections;
    },
});


Template.mechanisticSectionTR.helpers({
    getSectionEvidence: function() {
        return MechanisticEvidence.find(
          {section: this.section},
          {sort: {sortIdx: 1}});
    },
    displayNewSection: function() {
        return this.section === Session.get('evidenceEditingId');
    },
    getDragContainer: function() {
        return 'dragContainer_' + this.section;
    },
});
Template.mechanisticSectionTR.events({
    'click #mechanistic-newSection': function(evt, tmpl) {
        Session.set('evidenceEditingId', this.section);
        Tracker.flush();
        activateInput(tmpl.find('textarea[name=text]'));
    },
});
Template.mechanisticSectionTR.onRendered(function() {
    initializeDraggable(this, {isSection: true});
});


Template.mechanisticEvidenceDisplay.helpers({
    displayEditingForm: function() {
        return Session.get('evidenceEditingId') === this._id;
    },
    displayNewChild: function() {
        return Session.get('evidenceShowNew') === this._id;
    },
    hasChildren: function() {
        return MechanisticEvidence.find({parent: this._id}).count() > 0;
    },
    getChildren: function() {
        return MechanisticEvidence.find({parent: this._id}, {sort: {sortIdx: 1}});
    },
    getDragContainer: function() {
        return 'dragContainer_' + this._id;
    },
    getDragHandleName: function() {
        return (this.section) ? 'dragHandle_' + this.section : 'dragHandle_' + this.parent;
    },
    getDragObject: function() {
        return (this.section) ? 'dragObj_' + this.section : 'dragObj_' + this.parent;
    },
});
Template.mechanisticEvidenceDisplay.events({
    'click #mechanistic-show-edit': function(evt, tmpl) {
        Session.set('evidenceEditingId', this._id);
        Tracker.flush();
        activateInput(tmpl.find('textarea[name=text]'));
    },
    'click #mechanistic-newChild': function(evt, tmpl) {
        Session.set('evidenceShowNew', this._id);
        Tracker.flush();
        activateInput(tmpl.find('textarea[name=text]'));
    },
});
Template.mechanisticEvidenceDisplay.onRendered(function() {
    initializeDraggable(this, {isSection: false});
});


Template.mechanisticEvidenceForm.events({
    'click #mechanisticEvidence-create': function(evt, tmpl) {
        var errorDiv, isValid, obj;
        obj = newValues(tmpl.find('#mechanisticEvidenceForm'));
        obj['tbl_id'] = Session.get('Tbl')._id;
        obj['section'] = this.section;
        obj['parent'] = this.parent;
        obj['sortIdx'] = 1e10;
        isValid = MechanisticEvidence.simpleSchema().namedContext().validate(obj);
        if (isValid) {
            MechanisticEvidence.insert(obj);
            Session.set('evidenceEditingId', null);
            Session.set('evidenceShowNew', false);
        } else {
            errorDiv = createErrorDiv(MechanisticEvidence.simpleSchema().namedContext());
            $(tmpl.find('#errors')).html(errorDiv);
        }
    },
    'click #mechanisticEvidence-create-cancel': function(evt, tmpl) {
        Session.set('evidenceEditingId', null);
        Session.set('evidenceShowNew', false);
    },
    'click #mechanisticEvidence-update': function(evt, tmpl) {
        var errorDiv,
            vals = updateValues(tmpl.find('#mechanisticEvidenceForm'), this),
            modifier = {$set: vals},
            isValid = MechanisticEvidence
              .simpleSchema()
              .namedContext()
              .validate(modifier, {modifier: true});

        if (isValid) {
            MechanisticEvidence.update(this._id, modifier);
            Session.set('evidenceEditingId', null);
            Session.set('evidenceShowNew', false);
        } else {
            errorDiv = createErrorDiv(MechanisticEvidence.simpleSchema().namedContext());
            $(tmpl.find('#errors')).html(errorDiv);
        }
    },
    'click #mechanisticEvidence-update-cancel': function(evt, tmpl) {
        Session.set('evidenceEditingId', null);
        Session.set('evidenceShowNew', false);
    },
    'click #mechanisticEvidence-delete': function(evt, tmpl) {
        MechanisticEvidence.remove(this._id);
        Session.set('evidenceEditingId', null);
        Session.set('evidenceShowNew', false);
    },
});
Template.mechanisticEvidenceForm.helpers({
    displaySubheading: function() {
        return this.section != null;
    },
    getEvidenceOptions: function() {
        return MechanisticEvidence.evidenceOptions;
    },
});
Template.mechanisticEvidenceForm.onRendered(function() {
    initPopovers(this);
});
Template.mechanisticEvidenceForm.onDestroyed(function() {
    destroyPopovers(this);
});
