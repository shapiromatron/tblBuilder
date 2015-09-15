Template.epiOrganSiteMain.helpers(_.extend({
    getOrganSiteOptions: function() {
      return _.chain(EpiResult.find()
              .fetch())
              .pluck("organSite")
              .uniq()
              .sort()
              .map(function(d) {return "<option>{0}</option>".printf(d);})
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
            res_id: res._id,
            res: res,
            desc: desc,
            display: true,
            first: i===0,
            rows: res.riskEstimates.length,
          });
          rows.push(d);
        });
      });

      tmpl.eosRows = rows;
      Session.set('eosChanged',  new Date());
      return rows;
    }
  }, clientShared.abstractMainHelpers));
Template.epiOrganSiteMain.events({
  'change #organSiteSelector': function(evt, tmpl) {
    tmpl.organSites.set($(evt.target).val() || []);
    return clientShared.toggleRiskPlot();
  },
  'click #selectVisible': function(evt, tmpl) {
    Session.set("eosEditMode", !Session.get("eosEditMode"));
  }
});
Template.epiOrganSiteMain.onCreated(function() {
  this.subscribe('epiCollective', this.data.volumeNumber, this.data.monographAgent);
  this.organSites = new ReactiveVar([]);
  Session.setDefault("eosEditMode", false);
  Session.setDefault("epiRiskShowPlots", false);

  // reactively determine the first row and row-length of displayed values
  this.eosRows = [];
  var self = this;
  Tracker.autorun(function (){
    var matched = {},
        ts = Session.get('eosChanged'); // for reactivity
    if (Session.get("eosEditMode") === false) {
      self.eosRows.forEach(function(v){
        if (v.display && matched[v.res_id] === undefined){
          matched[v.res_id] = true;
          v.firstVisible = true;
          v.rowsVisible = _.where(self.eosRows,
            {"display": true, "res_id": v.res_id}).length;
        } else {
          v.firstVisible = false;
          v.rowsVisible = null;
        }
      });
    }
  });
});
Template.epiOrganSiteMain.onDestroyed(function() {
  Session.set("eosEditMode", null);
  Session.get('eosChanged', null);
});


Template.epiOrganSiteTr.helpers({
  isDisplayed: function(){
    return (Session.get("eosEditMode")) ? true : this.display;
  },
  editMode: function(){
    return Session.get("eosEditMode");
  },
  showPlots: function() {
    return Session.get("epiRiskShowPlots");
  },
  getFirstDisplay: function(){
    return (Session.get("eosEditMode")) ? this.first : this.firstVisible;
  },
  getNumRows: function(){
    return (Session.get("eosEditMode")) ? this.rows : this.rowsVisible;
  },
  getDisplayValue: function(){
    return (this.display) ? "checked" : "";
  }
});
Template.epiOrganSiteTr.events({
  "click .hideRow" : function(evt, tmpl){
    tmpl.data.display = !tmpl.data.display;
  }
});
