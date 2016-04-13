Template.referencesMain.onCreated(function() {
    Session.set('referenceShowNew', false);
    Session.set('referenceEditingId', null);
    Session.set('monographAgent', this.data.monographAgent);
    this.subscribe('monographReference', this.data.monographAgent);
});
Template.referencesMain.onDestroyed(function() {
    Session.set('referenceShowNew', false);
    Session.set('referenceEditingId', null);
    Session.set('monographAgent', null);
});


Template.referencesTbl.helpers({
    referenceShowNew: function() {
        return Session.get('referenceShowNew');
    },
    getReferences: function() {
        return Reference.find({}, {sort: [['name', 1]]});
    },
    referenceIsEditing: function() {
        return Session.equals('referenceEditingId', this._id);
    },
});
Template.referencesTbl.events({
    'click #reference-show-create': function(evt, tmpl) {
        Session.set('referenceShowNew', true);
        Tracker.flush();
        clientShared.activateInput(tmpl.find('input[name=name]'));
    },
    'click #reference-show-edit': function(evt, tmpl) {
        Session.set('referenceEditingId', this._id);
        Tracker.flush();
        clientShared.activateInput(tmpl.find('input[name=name]'));
    },
    'click #reference-downloadExcel': function(evt, tmpl) {
        var volumeNumber = Session.get('monographAgent');
        Meteor.call('referenceExcelDownload', volumeNumber, function(err, response) {
            clientShared.returnExcelFile(response, 'references.xlsx');
        });
    },
});


var toggleFieldDisplays = function(tmpl) {
    var showPubMed = tmpl.find('select[name=referenceType] option:selected').text === 'PubMed';
    if (showPubMed) {
        $('#pubMedFields').show();
        $('#otherFields').hide();
    } else {
        $('#pubMedFields').hide();
        $('#otherFields').show();
    }
};
Template.referenceForm.helpers({
    getReferenceTypeOptions: function() {
        return Reference.typeOptions;
    },
});
Template.referenceForm.events({
    'click #reference-create': function(evt, tmpl) {
        var obj = clientShared.newValues(tmpl.find('#referenceForm')),
            isModal = this.isModal,
            errorDiv, isValid;
        tmpl.$('#errors').empty();
        obj['monographAgent'] = [Session.get('monographAgent')];
        isValid = Reference.simpleSchema().namedContext().validate(obj);
        if (isValid) {
            Reference.insert(obj, function(err, _id){
                Meteor.call('getReference', _id, function(err, res){
                    // If a reference is a duplicate, it will return a new '_id' but it
                    // will be unused; thus we check for a duplicate to see if one already
                    // exists.
                    if (_.isUndefined(res)) res = Reference.checkForDuplicate(obj);
                    Session.set('referenceShowNew', false);
                    Session.set('referenceNewObj', res);
                    if (isModal) $('#referenceQuickAdd').modal('toggle');
                });
            });
        } else {
            errorDiv = clientShared.createErrorDiv(Reference.simpleSchema().namedContext());
            tmpl.$('#errors').html(errorDiv);
        }
    },
    'click #reference-create-cancel': function(evt, tmpl) {
        Session.set('referenceShowNew', false);
        if (this.isModal) $('#referenceQuickAdd').modal('toggle');
    },
    'click #reference-update': function(evt, tmpl) {
        var vals = clientShared.updateValues(tmpl.find('#referenceForm'), this),
            modifier = {$set: vals},
            isValid = Reference
              .simpleSchema()
              .namedContext()
              .validate(modifier, {modifier: true}),
            errorDiv;

        if (isValid) {
            Reference.update(this._id, modifier);
            Session.set('referenceEditingId', null);
        } else {
            errorDiv = clientShared.createErrorDiv(Reference.simpleSchema().namedContext());
            $(tmpl.find('#errors')).html(errorDiv);
        }
    },
    'click #reference-update-cancel': function(evt, tmpl) {
        return Session.set('referenceEditingId', null);
    },
    'click #reference-delete': function(evt, tmpl) {
        var ref_id = this._id,
            monographAgent = Session.get('monographAgent');
        Meteor.call('removeReference', ref_id, monographAgent, function(err, res) {
            return Session.set('referenceEditingId', null);
        });
    },
    'click .pubmedLookup': function(evt, tmpl) {
        var spinner = $(tmpl.find('.pubmedLookupSpinner')),
            pubmedID = tmpl.find('input[name=pubmedID]').value,
            citation = tmpl.find('textarea[name=fullCitation]'),
            name = tmpl.find('input[name=name]');

        spinner.toggleClass('spinner-active');
        return clientShared.getPubMedDetails(pubmedID, function(v) {
            spinner.toggleClass('spinner-active');
            citation.value = v.fullCitation;
            name.value = v.shortCitation;
        });
    },
    'change select[name=referenceType]': function(evt, tmpl) {
        return toggleFieldDisplays(tmpl);
    },
});
Template.referenceForm.onRendered(function() {
    return toggleFieldDisplays(this);
});


var searchReferences = function(qry, sync, cb) {
    qry = {
        qry: qry,
        monographAgent: Session.get('monographAgent'),
    };
    Meteor.call('searchReference', qry, function(err, res) {
        if (err) return console.log(err);
        _.each(res, function(d){d.value = d.name;});
        return cb(res);
    });
};
Template.referenceSingleSelect.helpers({
    getOptions: searchReferences,
});
Template.referenceSingleSelect.events({
    'typeahead:selected': function(evt, tmpl, v) {
        var div = $(tmpl.find('div.selectedReference')).empty();
        Blaze.renderWithData(Template.referenceSingleSelectSelected, {reference: v, referenceID: v._id}, div[0]);
        $(evt.target).typeahead('val', '');
    },
    'click .selectListRemove': function(evt, tmpl) {
        $(evt.currentTarget).parent().remove();
    },
});
Template.referenceSingleSelect.onRendered(function() {
    var div = $(this.find('div.selectedReference'));
    // if a new reference is created, inject it into the input scope
    Tracker.autorun(function() {
        var ref = Session.get('referenceNewObj');
        if (ref !== null) {
            div.empty();
            Blaze.renderWithData(Template.referenceSingleSelectSelected, {reference: ref, referenceID: ref._id}, div[0]);
            Session.set('referenceNewObj', null);
        }
    });
    Meteor.typeahead.inject();
});


var getCurrentReferenceIds = function(tmpl){
    var $ul = $(tmpl.find('ul')),
        ids = [];
    $ul.find('li').each(function(i, li){
        ids.push($(li).data('id'));
    });
    return ids;
};
Template.referenceMultiSelect.helpers({
    getOptions: searchReferences,
});
Template.referenceMultiSelect.events({
    'typeahead:selected': function(evt, tmpl, v) {
        var $ul = $(tmpl.find('ul')),
            ids = getCurrentReferenceIds(tmpl);

        if (ids.indexOf(v._id) < 0) {
            Blaze.renderWithData(Template.referenceMultiSelectListLI, {reference: v, referenceID: v._id}, $ul[0]);
        }
        return $(evt.target).typeahead('val', '');
    },
    'click .selectListRemove': function(evt, tmpl) {
        return $(evt.currentTarget).parent().remove();
    },
});
Template.referenceMultiSelect.onRendered(function() {
    var $ul = $(this.find('ul'));

    // if a new reference is created, inject it into the input scope
    Tracker.autorun(function() {
        var ref = Session.get('referenceNewObj');
        if (ref !== null) {
            Blaze.renderWithData(Template.referenceMultiSelectListLI, {reference: ref, referenceID: ref._id}, $ul[0]);
            Session.set('referenceNewObj', null);
        }
    });

    return Meteor.typeahead.inject();
});


Template.printReference.helpers({
    getReference: function(id) {
        var data = Template.currentData();
        return data.reference || Reference.findOne({_id: id});
    },
    showHyperlink: function() {
        return (!_.isNull(this.pubmedID) && isFinite(this.pubmedID)) || this.otherURL;
    },
    getHyperlink: function() {
        if (!_.isNull(this.pubmedID) && isFinite(this.pubmedID)) {
            return 'http://www.ncbi.nlm.nih.gov/pubmed/' + this.pubmedID + '/';
        } else {
            return this.otherURL;
        }
    },
});
Template.printReference.onRendered(function() {
    $(this.find('*[data-toggle=popover]')).popover({
        trigger: 'hover',
        placement: 'bottom',
        delay: {show: 500, hide: 300},
    });
});
