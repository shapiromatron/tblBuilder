Template.exposureMain.helpers(clientShared.abstractMainHelpers);
Template.exposureMain.rendered = function() {
  Session.set('evidenceShowNew', false);
  Session.set('evidenceEditingId', null);
  Session.set('evidenceShowAll', false);
  Session.set('evidenceType', 'exposure');
};


Template.exposureTbl.helpers(clientShared.abstractTblHelpers);
Template.exposureTbl.events(clientShared.abstractTblEvents);
Template.exposureTbl.rendered = function() {
  new Sortable(this.find('#sortable'), {
    handle: ".dhOuter",
    onUpdate: clientShared.moveRowCheck,
    Cls: ExposureEvidence
  });
  clientShared.toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'));
};


Template.exposureRow.events(clientShared.abstractRowEvents);


var toggleOccFields = function(tmpl) {
  var selector = tmpl.find('select[name="exposureScenario"]'),
      scen = $(selector).find('option:selected')[0].value;
  if (ExposureEvidence.isOccupational(scen)) {
    $(tmpl.findAll('.isOcc')).show();
    $(tmpl.findAll('.isNotOcc')).hide();
  } else {
    $(tmpl.findAll('.isOcc')).hide();
    $(tmpl.findAll('.isNotOcc')).show();
  }
};
Template.exposureForm.helpers({
  getExposureScenario: function() {return ExposureEvidence.exposureScenarios;},
  getSamplingApproach: function() {return ExposureEvidence.samplingApproaches;},
  getExposureLevelDescription: function() {return ExposureEvidence.exposureLevelDescriptions;}
});
Template.exposureForm.events(_.extend({
    'change select[name="exposureScenario"]': function(evt, tmpl) {
      return toggleOccFields(tmpl);
    }
  }, clientShared.abstractFormEvents));
Template.exposureForm.rendered = function() {
  toggleOccFields(this);
  clientShared.toggleQA(this, this.data.isQA);
  return $(this.findAll('.helpPopovers')).popover({
    delay: {show: 500, hide: 100},
    trigger: "hover",
    placement: "auto"
  });
};
