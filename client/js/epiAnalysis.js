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
    },
    showPlots: function() {
      return Session.get("epiRiskShowPlots");
    }
  }, clientShared.abstractMainHelpers));
Template.epiOrganSiteMain.events({
  'change #organSiteSelector': function(evt, tmpl) {
    tmpl.organSites.set($(evt.target).val() || []);
    return clientShared.toggleRiskPlot();
  }
});
Template.epiOrganSiteMain.created = function() {
  this.subscribe('epiCollective', this.data.volumeNumber, this.data.monographAgent);
  return this.organSites = new ReactiveVar([]);
};
