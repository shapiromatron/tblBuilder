Template.animalMain.helpers(clientShared.abstractMainHelpers);
Template.animalMain.onCreated(function() {
  Session.set('evidenceType', 'animalEvidence');
  Session.set('evidenceShowNew', false);
  Session.set('evidenceShowAll', false);
  Session.set('evidenceEditingId', null);
  Session.set('nestedEvidenceEditingId', null);
  this.subscribe('animalEvidence', Session.get('Tbl')._id);
});
Template.animalMain.onDestroyed(function() {
  Session.set('evidenceType', null);
  Session.set('evidenceShowNew', false);
  Session.set('evidenceShowAll', false);
  Session.set('evidenceEditingId', null);
  Session.set('nestedEvidenceEditingId', null);
});


Template.animalTbl.helpers(_.extend({
    getReportTypes: function() {
      return [
        {
          "type": "AnimalHtmlTblRecreation",
          "fn": "ani-results",
          "text": "Download Word: HTML table recreation"
        }
      ];
    }
  }, clientShared.abstractTblHelpers));
Template.animalTbl.onRendered(function() {
  clientShared.initDraggables(this.find('#sortable'), ".dhOuter", AnimalEvidence);
  clientShared.toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'));
});


var getFirstEndpoint = function(parent_id) {
  return AnimalEndpointEvidence.findOne({parent_id: parent_id});
};
Template.animalRow.helpers(_.extend({
    getDoses: function() {
      return AnimalEvidence.getDoses(getFirstEndpoint(this._id));
    },
    getNStarts: function() {
      return AnimalEvidence.getNStarts(getFirstEndpoint(this._id));
    },
    getNSurvivings: function() {
      return AnimalEvidence.getNSurvivings(getFirstEndpoint(this._id));
    }
  }, clientShared.abstractRowHelpers));
Template.animalRow.events(clientShared.abstractRowEvents);
Template.animalRow.onRendered(function() {
  clientShared.initDraggables(this.find('#sortableInner'), ".dhInner", AnimalEndpointEvidence);
  clientShared.toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'));
});


Template.animalForm.events(clientShared.abstractFormEvents);
Template.animalForm.onRendered(function() {
  clientShared.toggleQA(this, this.data.isQA);
  clientShared.initPopovers(this);
});
Template.animalForm.onDestroyed(function() {
  clientShared.destroyPopovers(this);
});


Template.animalEndpointTbl.helpers(_.extend({
    getIncidents: function() {
      var txt = "",
          val = AnimalEvidence.getIncidents(this.endpointGroups),
          sig;

      if (val !== "") {
        sig = this.incidence_significance || "";
        txt = "<tr><td>" + val + "</td><td>" + sig + "</td></tr>";
      }
      return txt;
    },
    getMultiplicities: function() {
      var txt = "",
          val = AnimalEvidence.getMultiplicities(this.endpointGroups),
          sig;

      if (val !== "") {
        sig = this.multiplicity_significance || "";
        txt = "<tr><td>" + val + "</td><td>" + sig + "</td></tr>";
      }
      return txt;
    },
    getTotalTumours: function() {
      var txt = "",
          val = AnimalEvidence.getTotalTumours(this.endpointGroups),
          sig;

      if (val !== "") {
        sig = this.total_tumours_significance || "";
        txt = "<tr><td>" + val + "</td><td>" + sig + "</td></tr>";
      }
      return txt;
    }
  }, clientShared.abstractNestedTableHelpers));
Template.animalEndpointTbl.events(clientShared.abstractNestedTableEvents);


Template.animalEndpointForm.helpers(clientShared.abstractNestedFormHelpers);
Template.animalEndpointForm.events(_.extend({
    'click #inner-addEndpointGroup': function(evt, tmpl) {
      var tbody = tmpl.find('.endpointGroupTbody');
      return Blaze.renderWithData(Template.animalEndpointGroupForm, {}, tbody);
    },
    'click #calculate-statistics': function(evt, tmpl) {
      return Meteor.call("getAnimalBioassayStatistics", this._id, function(err, response) {
        if (response) {
          return console.log(response);
        }
        return alert("An error occurred.");
      });
    }
  }, clientShared.abstractNestedFormEvents));
Template.animalEndpointForm.onRendered(function() {
  var aniResult = AnimalEndpointEvidence.findOne(
          {_id: Session.get('nestedEvidenceEditingId')});
  if (aniResult != null) {
    clientShared.toggleQA(this, aniResult.isQA);
  }
  $('#modalDiv').modal('toggle');
  clientShared.initPopovers(this);
});
Template.animalEndpointForm.onDestroyed(function() {
  clientShared.destroyPopovers(this);
});


Template.animalEndpointGroupForm.events({
  'click #endpointGroup-delete': function(evt, tmpl) {
    Blaze.remove(tmpl.view);
    return $(tmpl.view._domrange.members).remove();
  }
});
