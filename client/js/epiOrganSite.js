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
          results = EpiResult.find({"organSite": {$in: organSites}}).fetch();

      results.forEach(function(d) {
        d.desc = EpiDescriptive.findOne(d.parent_id);
      });

      return results;
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
    console.log(tmpl.rowHidden.get())
  }
}, trCreated = function(){
  this.rowHidden = new ReactiveVar(false);
}

Template.epiOrganSiteFullTr.helpers(trHelpers);
Template.epiOrganSiteFullTr.events(trEvents);
Template.epiOrganSiteFullTr.onCreated(trCreated);


Template.epiOrganSiteResultTr.helpers(trHelpers);
Template.epiOrganSiteResultTr.events(trEvents);
Template.epiOrganSiteResultTr.onCreated(trCreated);
