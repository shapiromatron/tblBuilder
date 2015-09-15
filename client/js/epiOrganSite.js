Template.epiOrganSiteMain.helpers(_.extend({
    getOrganSiteOptions: function() {
      return _.chain(EpiResult.find()
              .fetch())
              .pluck("organSite")
              .uniq()
              .sort()
              .map(function(d) {return "<option>" + d + "</option>";})
              .value();
    },
    object_list: function() {
      var tmpl = Template.instance(),
          organSites = tmpl.organSites.get(),
          results = EpiResult.find({"organSite": {$in: organSites}}).fetch(),
          rows = [];

      results.forEach(function(res) {
        var desc = EpiDescriptive.findOne(res.parent_id);
        res.riskEstimates.forEach(function(d, i){
          _.extend(d, {
            idx: i,
            res: res,
            desc: desc,
            firstDisplay: i===0,
            numRows: res.riskEstimates.length
          });
          rows.push(d);
        });
      });
      return rows;
    }
  }, clientShared.abstractMainHelpers));
Template.epiOrganSiteMain.events({
  'change #organSiteSelector': function(evt, tmpl) {
    tmpl.organSites.set($(evt.target).val() || []);
    return clientShared.toggleRiskPlot();
  },
  'click #selectVisible': function(evt, tmpl) {
    Session.set("eosShowCheckbox", !Session.get("eosShowCheckbox"));
  }
});
Template.epiOrganSiteMain.onCreated(function() {
  this.subscribe('epiCollective', this.data.volumeNumber, this.data.monographAgent);
  this.organSites = new ReactiveVar([]);
  Session.setDefault("eosShowCheckbox", false);
  Session.setDefault("epiRiskShowPlots", false);
});


var trHelpers = {
  showCheckbox: function(){
    return Session.get("eosShowCheckbox");
  },
  hideRow: function(){
    return (!Session.get("eosShowCheckbox") && Template.instance().rowHidden.get()) ? "hidden" : "";
  },
  rowVisible: function(){
    return Template.instance().rowHidden.get() ? "" : "checked";
  },
  showPlots: function() {
    return Session.get("epiRiskShowPlots");
  }
}, trEvents = {
  "click .hideRow" : function(evt, tmpl){
    tmpl.rowHidden.set(!tmpl.rowHidden.get());
  }
}, trCreated = function(){
  this.rowHidden = new ReactiveVar(false);
}

Template.epiOrganSiteTr.helpers(trHelpers);
Template.epiOrganSiteTr.events(trEvents);
Template.epiOrganSiteTr.onCreated(trCreated);
