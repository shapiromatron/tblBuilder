Template.formLegendPulldown.onRendered(function() {
  $(this.findAll('pre')).click(function(e) {
    e.preventDefault();
    e.stopPropagation();
  });
});


Template.contentContainer.helpers({
  getContainerClass: function() {
    return (Session.get("isFullScreen")) ? "container-fluid" : "container";
  }
});


Template.optFullScreen.helpers({
  isFullScreen: function() {
    return Session.get("isFullScreen");
  }
});
Template.optFullScreen.events({
  'click #toggleFullScreen': function(evt, tmpl) {
    evt.preventDefault();
    Session.set("isFullScreen", !Session.get("isFullScreen"));
  }
});


Template.optRiskPlot.helpers({
  showPlots: function() {
    return Session.get("epiRiskShowPlots");
  }
});
Template.optRiskPlot.events({
  'click #epiRiskShowPlots': function(evt, tmpl) {
    evt.preventDefault();
    Session.set('epiRiskShowPlots', !Session.get('epiRiskShowPlots'));
    clientShared.toggleRiskPlot();
  },
  'click #showForestAxisModal': function(evt, tmpl) {
    var div = document.getElementById('modalHolder');
    $(div).empty();
    Blaze.renderWithData(Template.forestAxisModal, {}, div);
  },
});


var closeModal = function(evt, tmpl) {
  // todo: not fired when ESC pressed to close
  $('#modalDiv')
    .on('hide.bs.modal', function() {
      $(tmpl.view._domrange.members).remove();
      Blaze.remove(tmpl.view);
    }).modal('hide');
}
Template.forestAxisModal.helpers({
  getMin: function(){
    return Session.get("epiForestPlotMin");
  },
  getMax: function(){
    return Session.get("epiForestPlotMax");
  },
  hasError: function(){
    return Template.instance().err.get().length>0;
  },
  getError: function(){
    return Template.instance().err.get();
  }
});
Template.forestAxisModal.events({
  'click #update': function(evt, tmpl){
    var min = parseFloat(tmpl.$('input[name="min"]').val(), 10),
        max = parseFloat(tmpl.$('input[name="max"]').val(), 10);
    if (min>0 && max>0 && max>min){
      Session.set("epiForestPlotMin", min);
      Session.set("epiForestPlotMax", max);
      clientShared.toggleRiskPlot();
      $('.epiRiskPlot').trigger('rerender');
      closeModal(evt, tmpl);
    } else {
      tmpl.err.set("Values must be greater than 0, and min<max.");
    }
  },
  'click #cancel': closeModal,
});
Template.forestAxisModal.onCreated(function() {
  this.err = new ReactiveVar("");
});
Template.forestAxisModal.onRendered(function() {
  $('#modalDiv').modal('toggle');
});


Template.optShowAllRows.helpers({
  isShowAll: function() {
    return Session.get('evidenceShowAll');
  }
});
Template.optShowAllRows.events({
  'click #toggleShowAllRows': function(evt, tmpl) {
      evt.preventDefault();
      Session.set('evidenceShowAll', !Session.get('evidenceShowAll'));
  }
});


Template.optQaFlags.events({
  'click #toggleQAflags': function(evt, tmpl) {
      Session.set('showQAflags', !Session.get('showQAflags'));
  },
});



Template.optSortFilter.events({
  "click #sortFilter": function(evt, tmpl){
    var div = document.getElementById('modalHolder');
    $(div).empty();
    Blaze.renderWithData(Template.sortFilterModal, {}, div);
  },
});

var applySortFilter = function(save, evt, tmpl){
  var sorts = _.map(tmpl.findAll("#sortTbl > tbody > tr"), function(el){
          var $el = $(el);
          return {
            field: $el.find("select[name='field']").val(),
            order: $el.find("select[name='order']").val(),
          }
        }),
        filters = _.map(tmpl.findAll("#filterTbl > tbody > tr"), function(el){
          var $el = $(el);
          return {
            field:      $el.find("select[name='field']").val(),
            filterType: $el.find("select[name='filterType']").val(),
            text:       $el.find("input[name='text']").val(),
          }
        });
    Session.set("sortsAndFilters", {
      "sorts": sorts,
      "filters": filters,
      "save": save
    });
    closeModal(evt, tmpl);
}
Template.sortFilterModal.helpers({
  hasError: function(){
    return Template.instance().err.get().length>0;
  },
  getError: function(){
    return Template.instance().err.get();
  }
});
Template.sortFilterModal.helpers({
  getSortList: function(){
    var sfs = Session.get("sortsAndFilters") || {};
    return sfs.sorts;
  },
  getFilterList: function(){
    var sfs = Session.get("sortsAndFilters") || {};
    return sfs.filters;
  }
});
Template.sortFilterModal.events({
  'click #addSort': function(evt, tmpl){
    var tbody = tmpl.find('#sortTbl > tbody');
    Blaze.renderWithData(Template.sfSortTR, {}, tbody);
  },
  'click #addFilter': function(evt, tmpl){
    var tbody = tmpl.find('#filterTbl > tbody');
    Blaze.renderWithData(Template.sfFilterTR, {}, tbody);
  },
  'click #apply': _.partial(applySortFilter, false),
  'click #applyAndSave': _.partial(applySortFilter, true),
  'click #cancel': closeModal,
});
Template.sortFilterModal.onCreated(function() {
  this.err = new ReactiveVar("");
});
Template.sortFilterModal.onRendered(function() {
  $('#modalDiv').modal('toggle');
});


var sfTrEvents = {
  'click .moveUp': function(evt, tmpl){
    var tr = $(tmpl.firstNode);
    tr.insertBefore(tr.prev());
  },
  'click .moveDown': function(evt, tmpl){
    var tr = $(tmpl.firstNode);
    tr.insertAfter(tr.next());
  },
  'click .delete': function(evt, tmpl){
    Blaze.remove(tmpl.view);
    $(tmpl.view._domrange.members).remove();
  },
}
Template.sfSortTR.events(sfTrEvents);
Template.sfSortTR.helpers({
  getFieldOptions: function(){
    var key = Session.get('evidenceType');
    return _.keys(tblBuilderCollections.evidenceLookup[key].collection.sortFields);
  },
  getOrderOptions: function(){
    return ["Ascending", "Descending"];
  }
});

Template.sfFilterTR.events(sfTrEvents);
Template.sfFilterTR.helpers({
  getFieldOptions: function(){
    return ["Reference", "Reference2", "Reference3"];
  },
  getFilterTypeOptions: function(){
    return [">", "≥", "<", "≤", "exact", "contains", "not_contains"];
  }
});

Template.optCreate.events({
  'click #show-create': function(evt, tmpl) {
    Session.set("evidenceShowNew", true);
    Tracker.flush();
    clientShared.activateInput($("input[name=referenceID]"));
  }
});


Template.showNewBtn.helpers({
  showNew: function(){
    return Session.get('evidenceShowNew');
  }
});
Template.showNewBtn.events({
  'click #show-create-btn': function(evt, tmpl) {
    Session.set("evidenceShowNew", true);
    Tracker.flush();
    clientShared.activateInput($("input[name=referenceID]"));
  }
});


Template.optReorder.events({
  'click #reorderRows': function(evt, tmpl) {
    var val = (!Session.get('reorderRows'));
    Session.set('reorderRows', val);
    clientShared.toggleRowVisibilty(val, $('.dragHandle'));
  }
});


Template.optWord.helpers({
  getReportTypes: function(){
    var key = Session.get('evidenceType');
    return tblBuilderCollections.evidenceLookup[key].collection.wordReportFormats;
  }
})
Template.optWord.events({
  'click .wordReport': function(evt, tmpl) {
      var tbl_id = Session.get('Tbl')._id,
          report_type = evt.target.dataset.type,
          fn = evt.target.dataset.fn + ".docx";

      Meteor.call("wordReport", tbl_id, report_type, function(err, response) {
          if (response) return clientShared.b64toWord(response, fn);
          return alert("An error occurred.");
      });
  }
});


Template.optExcel.events({
  'click #downloadExcel': function(evt, tmpl) {
    var tbl_id = Session.get('Tbl')._id,
        key = Session.get('evidenceType'),
        method = tblBuilderCollections.evidenceLookup[key].excel_method,
        fn = tblBuilderCollections.evidenceLookup[key].excel_fn;

    Meteor.call(method, tbl_id, function(err, response) {
      clientShared.returnExcelFile(response, fn);
    });
  }
});


Template.selectList.helpers({
  isSelected: function(current, selected) {
    return current === selected;
  }
});


var autocompleteOptions = function(qry, sync, cb) {
  var tbl_id,
      methodName = this.find('.typeahead').getAttribute('data-methodname');

  if (Session.get("Tbl")) tbl_id = Session.get("Tbl")._id;
  Meteor.call(methodName, qry, tbl_id, function(err, res) {
    if (err) return console.log(err);
    return cb(_.map(res, function(d){return {value: d};}));
  });
}, injectTypeahead = function(){
  Meteor.typeahead.inject("input[name=" + this.data.name + "]");
}, removeLI = function(evt, tmpl){
  $(evt.currentTarget).parent().remove();
}, selectListAddLI = function(ul, val) {
  var txts = clientShared.typeaheadSelectListGetLIs($(ul));
  if ((val !== "") && (!_.contains(txts, val))) {
    Blaze.renderWithData(Template.typeaheadSelectListLI, val, ul);
  }
}, selectMultiEvents = {
  'typeahead:selected': function(evt, tmpl) {
    selectListAddLI(tmpl.find("ul"), evt.target.value);
    tmpl.$('.typeahead').typeahead('val', "");
  },
  'keyup .form-control': function(evt, tmpl) {
    // add new input not found in list
    if (evt.which === 13){
      selectListAddLI(tmpl.find("ul"), evt.target.value);
      tmpl.$('.typeahead').typeahead('val', "");
    }
  },
  'click .selectListRemove': removeLI,
};

Template.typeaheadInput.helpers({getOptions: autocompleteOptions});
Template.typeaheadInput.onRendered(injectTypeahead);


Template.typeaheadSelectList.helpers({getOptions: autocompleteOptions});
Template.typeaheadSelectList.events(selectMultiEvents);
Template.typeaheadSelectList.onRendered(injectTypeahead);


Template.typeaheadUserSelect.helpers({
  searchUsers: function(query, sync, cb) {
    Meteor.call('searchUsers', query, {}, function(err, res) {
      if (err) return console.log(err);
      return cb(res);
    });
  },
  getRoledUsers: function(userType) {
    if (!this.tbl.user_roles) return;
    var ids = _.chain(this.tbl.user_roles)
           .filter(function(d){return d.role === userType;})
           .pluck("user_id")
           .value();
    return Meteor.users.find({_id: {$in: ids}});
  }
});
Template.typeaheadUserSelect.events({
  'click .removeUser': removeLI,
  'typeahead:selected': function(evt, tmpl, v) {
    var ul = tmpl.$('.' + tmpl.data.name)
        ids = ul.find('li').map(function(i, el){
          return el.getAttribute('data-user_id');
        });

    if (!_.contains(ids, v._id)) {
      return Blaze.renderWithData(Template.UserLI, v, ul[0]);
    }
    tmpl.$('.typeahead').typeahead('val', "");
  }
});
Template.typeaheadUserSelect.onRendered(injectTypeahead);


var printTimestamp = function(moment){
    return moment.format('MMM Do YYYY, h:mm a');
}

Template.tableTitle.helpers({
  getTable: function(){return Session.get("Tbl");},
  getLastUpdated: function(){
    var ts = moment(Session.get("Tbl").lastUpdated),
        obj,
        filts = {sort: {lastUpdated : -1}},
        key = Session.get('evidenceType'),
        Collection = tblBuilderCollections.evidenceLookup[key].collection,
        NestedCollection = tblBuilderCollections.evidenceLookup[key].nested_collection;

    obj = Collection.findOne({}, filts);
    if(obj && ts.isBefore(obj.lastUpdated)) ts = moment(obj.lastUpdated);

    if (NestedCollection){
      obj = NestedCollection.findOne({}, filts);
      if(obj && ts.isBefore(obj.lastUpdated)) ts = moment(obj.lastUpdated);
    }

    return printTimestamp(ts);
  }
});


Template.qaNotice.helpers({
  qaNotice: function(datetime, userID) {
    var user = Meteor.users.findOne(userID);
        datetime = printTimestamp(moment(datetime));
    if (user) username = user.profile.fullName;
    if (username) {
      return "QA'd by {0} on {1}".printf(username, datetime);
    } else {
      return "QA'd on {0}".printf(datetime);
    }
  }
});


Template.objectLastUpdated.helpers({
  getLastUpdated: function(){
    if (this.lastUpdated){
      return "Last updated: {0}".printf(printTimestamp(moment(this.lastUpdated)));
    }
    return "";
  }
})


Template.evidenceFormSubmissionDiv.helpers({
  isNew: function(){
    return _.isUndefined(this._id);
  },
  isQA: function(){
    return this.isQA === true;
  },
  showAddNested: function(){
    var key = Session.get('evidenceType'),
        coll = tblBuilderCollections.evidenceLookup[key].nested_collection
    return (!_.isUndefined(coll));
  }
});


Template.nestedEvidenceFormSubmissionDiv.helpers({
  isNew: function(){
    return _.isUndefined(this._id);
  },
  isQA: function(){
    return this.isQA === true;
  }
});


var fldGetSchema = function(){
  var coll;
  if(this.data.name){
    if (this.data.nested){
      coll = tblBuilderCollections
              .evidenceLookup[Session.get('evidenceType')]
              .nested_collection;
    } else {
      coll = tblBuilderCollections
              .evidenceLookup[Session.get('evidenceType')]
              .collection;
    }
    this.data.schema = coll.simpleSchema()._schema[this.data.name];
  }
}, fldHelpers = {
  isRequired: function(){
    if (_.isUndefined(this.schema.optional) ||
        this.schema.forceRequiredSymbol === true)
      return "*";
  },
  isSelected: function(current, selected) {
    return current === selected;
  },
  getOptions: autocompleteOptions
}

Template.fldLabel.onCreated(fldGetSchema);
Template.fldLabel.helpers(fldHelpers);

Template.fldInputText.onCreated(fldGetSchema);
Template.fldInputText.helpers(fldHelpers);

Template.fldInputFloat.onCreated(fldGetSchema);
Template.fldInputFloat.helpers(fldHelpers);

Template.fldInputInteger.onCreated(fldGetSchema);
Template.fldInputInteger.helpers(fldHelpers);

Template.fldCheckbox.onCreated(fldGetSchema);
Template.fldCheckbox.helpers(fldHelpers);

Template.fldInputTypeahead.onCreated(fldGetSchema);
Template.fldInputTypeahead.helpers(fldHelpers);
Template.fldInputTypeahead.onRendered(injectTypeahead);

Template.fldTypeaheadSelectMultiple.onCreated(fldGetSchema);
Template.fldTypeaheadSelectMultiple.helpers(fldHelpers);
Template.fldTypeaheadSelectMultiple.events(selectMultiEvents);
Template.fldTypeaheadSelectMultiple.onRendered(injectTypeahead);

Template.fldTextArea.onCreated(fldGetSchema);
Template.fldTextArea.helpers(fldHelpers);

Template.fldSelectSingle.onCreated(fldGetSchema);
Template.fldSelectSingle.helpers(fldHelpers);
