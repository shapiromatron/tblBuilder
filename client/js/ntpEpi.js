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
});


Template.ntpEpiDescTbl.helpers(_.extend({}, clientShared.abstractTblHelpers));
Template.ntpEpiDescTbl.events(_.extend({}, clientShared.abstractTblEvents));
Template.ntpEpiDescTbl.onRendered(function() {
  clientShared.toggleRiskPlot();
  clientShared.initDraggables(this.find('#sortable'), ".dhOuter", NtpEpiDescriptive);
  clientShared.toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'));
});


Template.ntpEpiDescriptiveForm.helpers({});
Template.ntpEpiDescriptiveForm.events(_.extend({}, clientShared.abstractFormEvents));
Template.ntpEpiDescriptiveForm.onRendered(function() {
  clientShared.toggleQA(this, this.data.isQA);
  clientShared.initPopovers(this);
});
Template.ntpEpiDescriptiveForm.onDestroyed(function() {
  clientShared.destroyPopovers(this);
});
