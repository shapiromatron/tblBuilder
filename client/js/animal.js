Template.animalMain.helpers(clientShared.abstractMainHelpers);
Template.animalMain.rendered = function() {
  Session.set('evidenceShowNew', false);
  Session.set('evidenceEditingId', null);
  Session.set('evidenceShowAll', false);
  return Session.set('evidenceType', 'animal');
};


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
Template.animalTbl.events(_.extend({
    'click .wordReport': function(evt, tmpl) {
      var tbl_id = Session.get('Tbl')._id,
          report_type = evt.target.dataset.type,
          fn = evt.target.dataset.fn + ".docx";

      return Meteor.call("pyWordReport", tbl_id, report_type, function(err, response) {
        if (response) return clientShared.b64toWord(response, fn);
        return alert("An error occurred.");
      });
    }
  }, clientShared.abstractTblEvents));
Template.animalTbl.rendered = function() {
  new Sortable(this.find('#sortable'), {
    handle: ".dhOuter",
    onUpdate: clientShared.moveRowCheck,
    Cls: AnimalEvidence
  });
  return clientShared.toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'));
};


var getFirstEndpoint = function(parent_id) {
  return AnimalEndpointEvidence.findOne({
    parent_id: parent_id
  });
};
Template.animalRow.helpers(_.extend({
    getDoses: function() {
      return shared.getAnimalDoses(getFirstEndpoint(this._id));
    },
    getNStarts: function() {
      return shared.getAnimalNStarts(getFirstEndpoint(this._id));
    },
    getNSurvivings: function() {
      return shared.getAnimalNSurvivings(getFirstEndpoint(this._id));
    }
  }, clientShared.abstractRowHelpers));
Template.animalRow.events(clientShared.abstractRowEvents);
Template.animalRow.rendered = function() {
  new Sortable(this.find('#sortableInner'), {
    handle: ".dhInner",
    onUpdate: clientShared.moveRowCheck,
    Cls: AnimalEndpointEvidence
  });
  return clientShared.toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'));
};


Template.animalForm.helpers({
  getStudyDesigns: function() {
    return AnimalEvidence.studyDesigns;
  },
  getSexes: function() {
    return AnimalEvidence.sexes;
  }
});
Template.animalForm.events(clientShared.abstractFormEvents);
Template.animalForm.rendered = function() {
  clientShared.toggleQA(this, this.data.isQA);
  return $(this.findAll('.helpPopovers')).popover({
    delay: {show: 500, hide: 100},
    trigger: "hover",
    placement: "auto"
  });
};


Template.animalEndpointTbl.helpers(_.extend({
    getIncidents: function() {
      var txt = "",
          val = shared.getAnimalEndpointIncidents(this.endpointGroups),
          sig;

      if (val !== "") {
        sig = this.incidence_significance || "";
        txt = "<tr><td>" + val + "</td><td>" + sig + "</td></tr>";
      }
      return txt;
    },
    getMultiplicities: function() {
      var txt = "",
          val = shared.getAnimalEndpointMultiplicities(this.endpointGroups),
          sig;

      if (val !== "") {
        sig = this.multiplicity_significance || "";
        txt = "<tr><td>" + val + "</td><td>" + sig + "</td></tr>";
      }
      return txt;
    },
    getTotalTumours: function() {
      var txt = "",
          val = shared.getAnimalTotalTumours(this.endpointGroups),
          sig;

      if (val !== "") {
        sig = this.total_tumours_significance || "";
        txt = "<tr><td>" + val + "</td><td>" + sig + "</td></tr>";
      }
      return txt;
    }
  }, clientShared.abstractNestedTableHelpers));
Template.animalEndpointTbl.events(clientShared.abstractNestedTableEvents);


var getEndpointGroupRows = function(tmpl, obj) {
  var i, len, ref, results, row, tbody;
  delete obj.dose;
  delete obj.nStart;
  delete obj.nSurviving;
  delete obj.incidence;
  delete obj.multiplicity;
  delete obj.totalTumours;
  obj.endpointGroups = [];
  tbody = tmpl.find('.endpointGroupTbody');
  ref = $(tbody).find('tr');
  results = [];
  for (i = 0, len = ref.length; i < len; i++) {
    row = ref[i];
    results.push(obj.endpointGroups.push(clientShared.newValues(row)));
  }
  return results;
};
Template.animalEndpointForm.helpers(clientShared.abstractNestedFormHelpers);
Template.animalEndpointForm.events(_.extend({
    'click #inner-addEndpointGroup': function(evt, tmpl) {
      var tbody;
      tbody = tmpl.find('.endpointGroupTbody');
      return Blaze.renderWithData(Template.animalEndpointGroupForm, {}, tbody);
    },
    'click #inner-create': function(evt, tmpl) {
      var NestedCollection, errorDiv, isValid, key, obj;
      key = Session.get('evidenceType');
      NestedCollection = clientShared.evidenceType[key].nested_collection;
      obj = clientShared.newValues(tmpl.find('#nestedModalForm'));
      getEndpointGroupRows(tmpl, obj);
      obj['tbl_id'] = Session.get('Tbl')._id;
      obj['parent_id'] = tmpl.data.parent._id;
      obj['sortIdx'] = 1e10;
      obj['isHidden'] = false;
      isValid = NestedCollection.simpleSchema().namedContext().validate(obj);
      if (isValid) {
        NestedCollection.insert(obj);
        return clientShared.removeNestedFormModal(tmpl);
      } else {
        errorDiv = clientShared.createErrorDiv(NestedCollection.simpleSchema().namedContext());
        return $(tmpl.find("#errors")).html(errorDiv);
      }
    },
    'click #inner-update': function(evt, tmpl) {
      var NestedCollection, errorDiv, isValid, key, modifier, vals;
      key = Session.get('evidenceType');
      NestedCollection = clientShared.evidenceType[key].nested_collection;
      vals = clientShared.updateValues(tmpl.find('#nestedModalForm'), this);
      getEndpointGroupRows(tmpl, vals);
      modifier = {
        $set: vals
      };
      isValid = NestedCollection.simpleSchema().namedContext().validate(modifier, {
        modifier: true
      });
      if (isValid) {
        NestedCollection.update(this._id, modifier, {
          removeEmptyStrings: false
        });
        Session.set("nestedEvidenceEditingId", null);
        return clientShared.removeNestedFormModal(tmpl);
      } else {
        errorDiv = clientShared.createErrorDiv(NestedCollection.simpleSchema().namedContext());
        return $(tmpl.find("#errors")).html(errorDiv);
      }
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
Template.animalEndpointForm.rendered = function() {
  var aniResult;
  aniResult = AnimalEndpointEvidence.findOne({
    _id: Session.get('nestedEvidenceEditingId')
  });
  if (aniResult != null) {
    clientShared.toggleQA(this, aniResult.isQA);
  }
  $(this.find('#nestedModalDiv')).modal('toggle');
  return $(this.findAll('.helpPopovers')).popover({
    delay: {
      show: 500,
      hide: 100
    },
    trigger: "hover",
    placement: "auto"
  });
};


Template.animalEndpointGroupForm.events({
  'click #endpointGroup-delete': function(evt, tmpl) {
    Blaze.remove(tmpl.view);
    return $(tmpl.view._domrange.members).remove();
  }
});
