import { Meteor } from 'meteor/meteor';
import { Blaze } from 'meteor/blaze';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';

import _ from 'underscore';

import {
    createNewNestedModal,
} from './utilities';


let removeNestedFormModal = function(tmpl, options) {
    $('#modalDiv')
        .one('hide.bs.modal', function() {
            var key = Session.get('evidenceType'),
                NestedCollection = tblBuilderCollections.evidenceLookup[key].nested_collection;
            $(tmpl.view._domrange.members).remove();
            Blaze.remove(tmpl.view);
            if ((options != null) && (options.remove != null)) {
                NestedCollection.remove(options.remove);
            }})
        .modal('hide');
};


export const abstractMainHelpers = {};


export const abstractTblHelpers = {
    showNew: function() {
        return Session.get('evidenceShowNew');
    },
    isEditing: function() {
        return Session.equals('evidenceEditingId', this._id);
    },
    showRow: function(isHidden) {
        return Session.get('evidenceShowAll') || !isHidden;
    },
    object_list: function() {
        var key = Session.get('evidenceType'),
            sfs = Session.get('sortsAndFilters') || {},
            objs = null,
            Collection;

        if (key != null) {
            Collection = tblBuilderCollections.evidenceLookup[key].collection,
            objs = Collection.find({}, {sort: {sortIdx: 1}}).fetch();
            objs = clientShared.applySortsAndFilters(objs, sfs);
            if (sfs.save) {
                Session.set('sortsAndFilters', _.extend(sfs, {'save': false}));
                clientShared.saveSortOrder(objs);
            }
        }
        return objs;
    },
};


export const abstractRowHelpers = {
    getChildren: function() {
        var key = Session.get('evidenceType'),
            NestedCollection = tblBuilderCollections.evidenceLookup[key].nested_collection;
        return NestedCollection.find({parent_id: this._id}, {sort: {sortIdx: 1}});
    },
};


export const abstractRowEvents = {
    'click #show-edit': function(evt, tmpl) {
        Session.set('evidenceEditingId', this._id);
        Tracker.flush();
        clientShared.activateInput($('input[name=referenceID]')[0]);
    },
    'click #toggle-hidden': function(evt, tmpl) {
        var key = Session.get('evidenceType'),
            Collection = tblBuilderCollections.evidenceLookup[key].collection;
        Collection.update(this._id, {$set: {isHidden: !this.isHidden}});
    },
    'click .add-nested': createNewNestedModal,
    'click #move-content': function(evt, tmpl) {
        var div = document.getElementById('modalHolder');
        $(div).empty();
        Blaze.renderWithData(Template.moveModal, {content: this}, div);
    },
    'click #clone-content': function(evt, tmpl) {
        var ET = tblBuilderCollections.evidenceLookup[Session.get('evidenceType')];
        cloneObject(this, ET.collection, ET.nested_collection);
    },
};


export const abstractFormEvents = {
    'click #create-cancel': function(evt, tmpl) {
        Session.set('evidenceShowNew', false);
    },
    'click #update-cancel': function(evt, tmpl) {
        Session.set('evidenceEditingId', null);
    },
    'click #create': function(evt, tmpl) {
        var errorDiv, isValid,
            key = Session.get('evidenceType'),
            Collection = tblBuilderCollections.evidenceLookup[key].collection,
            obj = clientShared.newValues(tmpl.find('#mainForm')),
            createPreValidate = tmpl.view.template.__helpers[' createPreValidate'];

        _.extend(obj, {
            tbl_id: Session.get('Tbl')._id,
        });

        if (createPreValidate) obj = createPreValidate(tmpl, obj, this);
        isValid = Collection.simpleSchema().namedContext().validate(obj);
        if (isValid) {
            Collection.insert(obj);
            Session.set('evidenceShowNew', false);
        } else {
            errorDiv = createErrorDiv(Collection.simpleSchema().namedContext());
            $(tmpl.find('#errors')).html(errorDiv);
        }
    },
    'click #update': function(evt, tmpl) {
        var errorDiv, fld, i, isValid, modifier, updatePreValidate,
            key = Session.get('evidenceType'),
            Collection = tblBuilderCollections.evidenceLookup[key].collection,
            vals = clientShared.updateValues(tmpl.find('#mainForm'), this),
            ref = tblBuilderCollections.evidenceLookup[key].requiredUpdateFields;
        for (i = 0; i < ref.length; i++) {
            fld = ref[i];
            vals[fld] = tmpl.find(`select[name="${fld}"]`).value;
        }
        updatePreValidate = tmpl.view.template.__helpers[' updatePreValidate'];
        if (updatePreValidate != null) vals = updatePreValidate(tmpl, vals, this);
        modifier = {$set: vals};
        isValid = Collection
            .simpleSchema()
            .namedContext()
            .validate(modifier, {modifier: true});
        if (isValid) {
            Collection.update(this._id, {$set: vals});
            (isCtrlClick(evt)) ? animateClick(evt.target) : Session.set('evidenceEditingId', false);
        } else {
            errorDiv = createErrorDiv(Collection.simpleSchema().namedContext());
            $(tmpl.find('#errors')).html(errorDiv);
        }
    },
    'click #delete': function(evt, tmpl) {
        var key = Session.get('evidenceType'),
            Collection = tblBuilderCollections.evidenceLookup[key].collection;
        Collection.remove(this._id);
        Session.set('evidenceEditingId', null);
    },
    'click #setQA,#unsetQA': function(evt, tmpl) {
        var key = Session.get('evidenceType'),
            collection_name = tblBuilderCollections.evidenceLookup[key].collection_name;
        Meteor.call('adminToggleQAd', this._id, collection_name, function(err, response) {
            if (response) clientShared.toggleQA(tmpl, response.QAd);
        });
    },
    'click #addNestedResult': createNewNestedModal,
};


export const abstractNestedTableHelpers = {
    showRow: function(isHidden) {
        return Session.get('evidenceShowAll') || !isHidden;
    },
};


export const abstractNestedTableEvents = {
    'click #inner-show-edit': function(evt, tmpl) {
        var div = document.getElementById('modalHolder'),
            key = Session.get('evidenceType'),
            NestedTemplate = tblBuilderCollections.evidenceLookup[key].nested_template;

        Session.set('nestedEvidenceEditingId', tmpl.data._id);
        return Blaze.renderWithData(NestedTemplate, {}, div);
    },
    'click #inner-toggle-hidden': function(evt, tmpl) {
        var key = Session.get('evidenceType'),
            NestedCollection = tblBuilderCollections.evidenceLookup[key].nested_collection,
            data = tmpl.view.parentView.dataVar.curValue;

        NestedCollection.update(data._id, {$set: {isHidden: !data.isHidden}});
    },
    'click #clone-nested-content': function(evt, tmpl) {
        var data = tmpl.view.parentView.dataVar.curValue,
            ET = tblBuilderCollections.evidenceLookup[Session.get('evidenceType')];
        return cloneObject(data, ET.nested_collection);
    },
};


export const abstractNestedFormHelpers = {
    isNew: function() {
        return Session.get('nestedEvidenceEditingId') === null;
    },
    getObject: function() {
        var initial = this,
            key = Session.get('evidenceType'),
            NestedCollection = tblBuilderCollections.evidenceLookup[key].nested_collection,
            existing = NestedCollection.findOne({_id: Session.get('nestedEvidenceEditingId')});
        return existing || initial;
    },
};


export const abstractNestedFormEvents = {
    'click #inner-create': function(evt, tmpl) {
        var errorDiv, isValid,
            key = Session.get('evidenceType'),
            NestedCollection = tblBuilderCollections.evidenceLookup[key].nested_collection,
            obj = clientShared.newValues(tmpl.find('#nestedModalForm'));

        _.extend(obj, {
            tbl_id: Session.get('Tbl')._id,
            parent_id: tmpl.data.parent._id,
            sortIdx: 1e10,
            isHidden: false,
        });
        NestedCollection.preSaveHook(tmpl, obj);

        isValid = NestedCollection
            .simpleSchema()
            .namedContext()
            .validate(obj);

        if (isValid) {
            NestedCollection.insert(obj);
            removeNestedFormModal(tmpl);
        } else {
            errorDiv = createErrorDiv(NestedCollection.simpleSchema().namedContext());
            $(tmpl.find('#errors')).html(errorDiv);
        }
    },
    'click #inner-create-cancel': function(evt, tmpl) {
        removeNestedFormModal(tmpl);
    },
    'click #inner-update': function(evt, tmpl) {
        var errorDiv, modifier, isValid,
            key = Session.get('evidenceType'),
            NestedCollection = tblBuilderCollections.evidenceLookup[key].nested_collection,
            vals = clientShared.updateValues(tmpl.find('#nestedModalForm'), this);

        NestedCollection.preSaveHook(tmpl, vals);

        modifier = {$set: vals},
        isValid = NestedCollection
            .simpleSchema()
            .namedContext()
            .validate(modifier, {modifier: true});

        if (isValid) {
            NestedCollection.update(this._id, modifier);
            if (isCtrlClick(evt)){
                animateClick(evt.target);
            } else {
                Session.set('nestedEvidenceEditingId', null);
                removeNestedFormModal(tmpl);
            }
        } else {
            errorDiv = createErrorDiv(NestedCollection.simpleSchema().namedContext());
            $(tmpl.find('#errors')).html(errorDiv);
        }
    },
    'click #inner-update-cancel': function(evt, tmpl) {
        Session.set('nestedEvidenceEditingId', null);
        removeNestedFormModal(tmpl);
    },
    'click #inner-delete': function(evt, tmpl) {
        Session.set('nestedEvidenceEditingId', null);
        removeNestedFormModal(tmpl, {'remove': this._id});
    },
    'click #setQA,#unsetQA': function(evt, tmpl) {
        var key = Session.get('evidenceType'),
            nested_collection_name = tblBuilderCollections.evidenceLookup[key].nested_collection_name;
        Meteor.call('adminToggleQAd', this._id, nested_collection_name, function(err, response) {
            if (response) clientShared.toggleQA(tmpl, response.QAd);
        });
    },
};
