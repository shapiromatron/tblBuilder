Template.formLegendPulldown.onRendered(function() {
  $(this.findAll('pre')).click(function(e) {
    e.preventDefault();
    e.stopPropagation();
  });
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
Template.optRiskPlot.onCreated(function() {
  Session.setDefault('epiRiskShowPlots', false);
});



Template.selectList.helpers({
  isSelected: function(current, selected) {
    return current === selected;
  }
});


var autocompleteOptions = function(qry, cb) {
  var tbl_id = Session.get("Tbl")._id,
      methodName = this.$el
                       .parent()
                       .parent()
                       .find('input')
                       .data('methodname');

  Meteor.call(methodName, qry, tbl_id, function(err, res) {
    if (err) return console.log(err);
    return cb(_.map(res, function(d){return {value: d};}));
  });
};
Template.typeaheadInput.helpers({getOptions: autocompleteOptions});
Template.typeaheadInput.onRendered(function() {
  return Meteor.typeahead.inject("input[name=" + this.data.name + "]");
});


Template.typeaheadSelectList.helpers({getOptions: autocompleteOptions});
Template.typeaheadSelectList.events({
  'typeahead:selected': function(evt, tmpl, v) {
    var $ul = $(tmpl.find("ul"));
    clientShared.typeaheadSelectListAddLI($ul, v.value);
    $(evt.target).typeahead("val", "");
  },
  'click .selectListRemove': function(evt, tmpl) {
    $(evt.currentTarget).parent().remove();
  },
  'keyup .form-control': function(evt, tmpl) {
    if (evt.which !== 13) return;

    var val = evt.target.value,
        $ul = $(tmpl.find('ul'));

    if (clientShared.typeaheadSelectListAddLI($ul, val)){
      return evt.target.value = "";
    }
  }
});
Template.typeaheadSelectList.onRendered(function() {
  return Meteor.typeahead.inject("input[name=" + this.data.name + "]");
});
