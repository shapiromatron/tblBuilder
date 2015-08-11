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
