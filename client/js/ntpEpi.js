Template.ntpEpiMain.helpers(clientShared.abstractMainHelpers);
Template.ntpEpiMain.onCreated(function() {
  Session.set('evidenceType', 'ntpEpiDescriptive');
  Session.set('evidenceShowNew', false);
  Session.set('evidenceShowAll', false);
  Session.set('evidenceEditingId', null);
  Session.set('nestedEvidenceEditingId', null);
  this.subscribe('ntpEpiDescriptive', Session.get('Tbl')._id);
});
Template.ntpEpiMain.onDestroyed(function() {
  Session.set('evidenceType', null);
  Session.set('evidenceShowNew', false);
  Session.set('evidenceShowAll', false);
  Session.set('evidenceEditingId', null);
  Session.set('nestedEvidenceEditingId', null);
  Session.set('sorts', []);
  Session.set('filters', []);
});


Template.ntpEpiDescTbl.helpers(clientShared.abstractTblHelpers);
Template.ntpEpiDescTbl.onRendered(function() {
  clientShared.toggleRiskPlot();
  clientShared.initDraggables(this.find('#sortable'), ".dhOuter", NtpEpiDescriptive);
  clientShared.toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'));
});


Template.ntpEpiDescriptiveRow.helpers(clientShared.abstractRowHelpers);
Template.ntpEpiDescriptiveRow.events(clientShared.abstractRowEvents);
Template.ntpEpiDescriptiveRow.onRendered(function() {
  // clientShared.initDraggables(this.find('#sortableInner'), ".dhInner", EpiResult);
  clientShared.toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'));
});


var toggleRequiredFields = function(tmpl, duration){
  var duration = duration || 1000,
      design = tmpl.find("select[name=studyDesign]").value,
      shows, hides;
  switch (design){
    case "Cohort":
      shows = [".isCohort", ".isntCC"];
      hides = [".isntCohort", "isNCC"];
      break;
    case "Case-Control":
      shows = [".isntCohort"];
      hides = [".isCohort", ".isntCC", "isNCC"];
      break;
    case "Nested Case-Control":
    case "Ecological":
      shows = [".isntCohort", ".isntCC", "isNCC"];
      hides = [".isCohort"];
      break;
    default:
      console.log("unknown study-design: {0}".printf(design));
  }
  tmpl.$(hides.join(",")).fadeOut(duration, function(){
    tmpl.$(shows.join(",")).fadeIn(duration);
  });
};
Template.ntpEpiDescriptiveForm.helpers({
  allAccordiansShown: function(){
    return Template.instance().allAccordiansShown.get();
  }
});
Template.ntpEpiDescriptiveForm.events(_.extend({
  'change select[name="studyDesign"]': function(evt, tmpl) {
    return toggleRequiredFields(tmpl);
  },
  'click #toggleAccordian': function(evt, tmpl){
    tmpl.allAccordiansShown.set(!tmpl.allAccordiansShown.get());
    var action = (tmpl.allAccordiansShown.get()) ? "show" : "hide";
    $(tmpl.findAll(".collapse")).collapse(action);
  }
}, clientShared.abstractFormEvents));
Template.ntpEpiDescriptiveForm.onCreated(function(){
  this.allAccordiansShown = new ReactiveVar(false);
});
Template.ntpEpiDescriptiveForm.onRendered(function() {
  clientShared.toggleQA(this, this.data.isQA);
  clientShared.initPopovers(this);
  toggleRequiredFields(this, 1e-6);
});
Template.ntpEpiDescriptiveForm.onDestroyed(function() {
  clientShared.destroyPopovers(this);
});
