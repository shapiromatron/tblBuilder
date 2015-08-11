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
  }
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


Template.optWord.events({
  'click #wordReport': function(evt, tmpl) {
    var div = document.getElementById('#modalHolder');
    Blaze.renderWithData(Template.reportTemplateModal, {}, div);
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
};

Template.typeaheadInput.helpers({getOptions: autocompleteOptions});
Template.typeaheadInput.onRendered(injectTypeahead);


Template.typeaheadSelectList.helpers({getOptions: autocompleteOptions});
Template.typeaheadSelectList.events({
  'typeahead:selected': function(evt, tmpl) {
    selectListAddLI(tmpl.find("ul"), evt.target.value);
    tmpl.$('.typeahead').typeahead('val', "");
  },
  'click .selectListRemove': removeLI,
});
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


Template.tableTitle.helpers({
  getTable: function(){return Session.get("Tbl");}
});
