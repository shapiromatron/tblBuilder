Template.epiMain.helpers(clientShared.abstractMainHelpers);
Template.epiMain.rendered = function() {
  Session.set('evidenceShowNew', false);
  Session.set('evidenceEditingId', null);
  Session.set('evidenceShowAll', false);
  Session.set('evidenceType', 'epi');
};


Template.epiAnalysisTbl.rendered = function() {
  var data = shared.getFlattenedEpiData(Session.get("Tbl")._id),
      tbl = $(this.find('#analysisTbl')),
      header = data.shift(); // drop header column

  var columns = _.map(header, function(field){
    return {
      "title": field,
      "visible": shared.defaultEpiVisible.indexOf(field) >= 0
    }
  });

  return tbl.dataTable({
    "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],
    "dom": 'RC<"clear">lfrtip',
    "scrollY": "600px",
    "scrollCollapse": true,
    "paging": false,
    "data": data,
    "columns": columns
  });
};
$.extend($.fn.dataTableExt.oSort, {
  "authorYear-pre": function(s) {
    var res = s.match(/(\w+).*(\d{4})/);
    if (res != null) {
      return res[2] + " " + res[1];
    } else {
      return s;
    }
  },
  "authorYear-asc": function(a, b) {
    return ((a < b) ? -1 : ((a > b) ? 1 : 0));
  },
  "authorYear-desc": function(a, b) {
    return ((a < b) ? 1 : ((a > b) ?  -1 : 0));
  },
  "riskSort-pre": function(s) {
    var res = s.match(/([\d\.]+)/);
    return parseFloat(res[1]);
  },
  "riskSort-asc": function(a, b) {
    return ((a < b) ? -1 : ((a > b) ? 1 : 0));
  },
  "riskSort-desc": function(a, b) {
    return ((a < b) ? 1 : ((a > b) ?  -1 : 0));
  }
});


Template.epiDescriptiveTbl.helpers(_.extend({
    getReportTypes: function() {
      var reports = [];
      switch (Meteor.settings["public"].context) {
        case "ntp":
          reports = [
            {
              "type": "NtpEpiDescriptive",
              "fn": "epi-descriptive",
              "text": "Download Word: study descriptions"
            }, {
              "type": "NtpEpiResults",
              "fn": "epi-result",
              "text": "Download Word: results by organ-site"
            }, {
              "type": "NtpEpiAniResults",
              "fn": "animal-bioassay",
              "text": "Download Word: animal-bioassay"
            }
          ];
          break;
        case "iarc":
          reports = [
            {
              "type": "EpiHtmlTblRecreation",
              "fn": "epi-results",
              "text": "Download Word: HTML table recreation"
            }
          ];
          break;
        default:
          console.log("Unknown site context.");
      }
      return reports;
    }
  }, clientShared.abstractTblHelpers));
Template.epiDescriptiveTbl.events(_.extend({
    'click .wordReport': function(evt, tmpl) {
      var tbl_id = Session.get('Tbl')._id,
          report_type = evt.target.dataset.type,
          fn = evt.target.dataset.fn + ".docx";

      Meteor.call("pyWordReport", tbl_id, report_type, function(err, response) {
        if (response) return clientShared.b64toWord(response, fn);
        return alert("An error occurred.");
      });
    }
  }, clientShared.abstractTblEvents));
Template.epiDescriptiveTbl.rendered = function() {
  clientShared.toggleRiskPlot();
  new Sortable(this.find('#sortable'), {
    handle: ".dhOuter",
    onUpdate: clientShared.moveRowCheck,
    Cls: EpiDescriptive
  });
  clientShared.toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'));
};


Template.epiDescriptiveRow.helpers(_.extend({
    getCol2: function() {
      var html = "",
          ref, rrCase, rrCtrl;
      if (CaseControlTypes.indexOf(this.studyDesign) >= 0) {

        rrCase = shared.getPercentOrText(this.responseRateCase);
        rrCtrl = shared.getPercentOrText(this.responseRateControl);
        if (rrCase.length > 0) rrCase = " (" + rrCase + ")";
        if (rrCtrl.length > 0) rrCtrl = " (" + rrCtrl + ")";

        html += "<strong>Cases: </strong>" + this.populationSizeCase + rrCase + "; " + this.sourceCase + "<br>";
        html += "<strong>Controls: </strong>" + this.populationSizeControl + rrCtrl + "; " + this.sourceControl;

      } else {
        html += this.populationSize + "; " + this.eligibilityCriteria;
      }

      html += "<br><strong>Exposure assess. method: </strong>";

      if (this.exposureAssessmentType.toLowerCase().search("other") >= 0) {
        html += "other";
      } else {
        html += "" + this.exposureAssessmentType;
      }

      if (this.exposureAssessmentNotes != null) html += "; " + this.exposureAssessmentNotes;
      if (this.outcomeDataSource != null) html += "<br>" + this.outcomeDataSource;

      return html;
    }
  }, clientShared.abstractRowHelpers));
Template.epiDescriptiveRow.events(clientShared.abstractRowEvents);
Template.epiDescriptiveRow.rendered = function() {
  new Sortable(this.find('#sortableInner'), {
    handle: ".dhInner",
    onUpdate: clientShared.moveRowCheck,
    Cls: EpiResult
  });
  clientShared.toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'));
};


var getEligibilityCriteria = function(tmpl, obj, data) {
  // two different fields with this name; one for case and one for cohort
  tmpl.findAll('textarea[name="eligibilityCriteria"]').forEach(function(fld){
    if (fld.value.length > 0) obj.eligibilityCriteria = fld.value;
  });
  return obj;
};
Template.epiDescriptiveForm.helpers({
  getStudyDesignOptions: function() {
    return epiStudyDesignOptions;
  },
  getExposureAssessmentTypeOptions: function() {
    return exposureAssessmentTypeOptions;
  },
  createPreValidate: function(tmpl, obj, data) {
    return getEligibilityCriteria(tmpl, obj, data);
  },
  updatePreValidate: function(tmpl, obj, data) {
    return getEligibilityCriteria(tmpl, obj, data);
  }
});
Template.epiDescriptiveForm.events(_.extend({
    'change select[name="studyDesign"]': function(evt, tmpl) {
      return toggleCCfields(tmpl);
    },
    'click #addEpiResult': function(evt, tmpl) {
      var div = tmpl.find('#epiResultDiv');
      Blaze.renderWithData(Template.epiResultForm, {descriptive: this}, div);
    }
  }, clientShared.abstractFormEvents));
Template.epiDescriptiveForm.rendered = function() {
  toggleCCfields(this);
  clientShared.toggleQA(this, this.data.isQA);
  $(this.findAll('.helpPopovers')).popover({
    delay: {show: 500,hide: 100},
    trigger: "hover",
    placement: "auto"
  });
};


var toggleCCfields = function(tmpl) {
  var selector = tmpl.find('select[name="studyDesign"]'),
      studyD = $(selector).find('option:selected')[0].value;
  if (CaseControlTypes.indexOf(studyD) >= 0) {
    $(tmpl.findAll('.isNotCCinput')).hide();
    $(tmpl.findAll('.isCCinput')).show();
  } else {
    $(tmpl.findAll('.isCCinput')).hide();
    $(tmpl.findAll('.isNotCCinput')).show();
  }
};
Template.epiResultTbl.helpers(_.extend({
    showPlots: function() {
      return Session.get("epiRiskShowPlots");
    },
    displayTrendTest: function() {
      return this.trendTest != null;
    },
    displayEffectUnits: function(d) {
      return d.effectUnits != null;
    }
  }, clientShared.abstractNestedTableHelpers));
Template.epiResultTbl.events(clientShared.abstractNestedTableEvents);


Template.organSiteTd.helpers({
  getRowspan: function() {
    var rows = this.riskEstimates.length;
    if (this.effectUnits != null) rows += 1;
    return rows;
  }
});


var getRiskRows = function(tmpl, obj) {
  delete obj.exposureCategory;
  delete obj.numberExposed;
  delete obj.riskMid;
  delete obj.riskLow;
  delete obj.riskHigh;
  delete obj.riskEstimated;
  delete obj.inTrendTest;
  var trs = tmpl.find('.riskEstimateTbody tr');
  obj.riskEstimates = _.map(trs, function(row){
    return clientShared.newValues(row);
  });
};
Template.epiResultForm.helpers(clientShared.abstractNestedFormHelpers);
Template.epiResultForm.events(_.extend({
    'click #inner-addRiskRow': function(evt, tmpl) {
      var tbody = tmpl.find('.riskEstimateTbody');
      Blaze.renderWithData(Template.riskEstimateForm, {}, tbody);
    },
    'click #inner-create': function(evt, tmpl) {
      var errorDiv, isValid,
          key = Session.get('evidenceType'),
          NestedCollection = clientShared.evidenceType[key].nested_collection,
          obj = clientShared.newValues(tmpl.find('#nestedModalForm'));

      getRiskRows(tmpl, obj);
      obj['tbl_id'] = Session.get('Tbl')._id;
      obj['parent_id'] = tmpl.data.parent._id;
      obj['sortIdx'] = 1e10;
      obj['isHidden'] = false;
      isValid = NestedCollection
        .simpleSchema()
        .namedContext()
        .validate(obj);

      if (isValid) {
        NestedCollection.insert(obj);
        clientShared.removeNestedFormModal(tmpl);
      } else {
        errorDiv = clientShared.createErrorDiv(NestedCollection.simpleSchema().namedContext());
        $(tmpl.find("#errors")).html(errorDiv);
      }
    },
    'click #inner-update': function(evt, tmpl) {
      var errorDiv, isValid, modifier,
          key = Session.get('evidenceType'),
          NestedCollection = clientShared.evidenceType[key].nested_collection,
          vals = clientShared.updateValues(tmpl.find('#nestedModalForm'), this);

      getRiskRows(tmpl, vals);
      modifier = {$set: vals};
      isValid = NestedCollection
        .simpleSchema()
        .namedContext()
        .validate(modifier, {modifier: true});

      if (isValid) {
        NestedCollection.update(this._id, modifier);
        Session.set("nestedEvidenceEditingId", null);
        clientShared.removeNestedFormModal(tmpl);
      } else {
        errorDiv = clientShared.createErrorDiv(NestedCollection.simpleSchema().namedContext());
        $(tmpl.find("#errors")).html(errorDiv);
      }
    }
  }, clientShared.abstractNestedFormEvents));
Template.epiResultForm.rendered = function() {
  var epiResult = EpiResult.findOne({_id: Session.get('nestedEvidenceEditingId')});
  if (epiResult != null) {
    clientShared.toggleQA(this, epiResult.isQA);
  }
  $(this.find('#nestedModalDiv')).modal('toggle');
  return $(this.findAll('.helpPopovers')).popover({
    delay: {show: 500, hide: 100},
    trigger: "hover",
    placement: "auto"
  });
};


Template.riskEstimateForm.events({
  'click #epiRiskEstimate-delete': function(evt, tmpl) {
    Blaze.remove(tmpl.view);
    $(tmpl.view._domrange.members).remove();
  }
});


Template.forestPlot.rendered = function() {
  var data = this.data.parent.riskEstimates[this.data.index],
      svg = d3.select(this.find('svg')),
      width = parseInt(svg.node().getBoundingClientRect().width),
      height = parseInt(svg.node().getBoundingClientRect().height),
      xscale = d3.scale.log().range([0, width]).domain([0.05, 50]).clamp(true),
      yscale = d3.scale.linear().range([0, height]).domain([0, 1]).clamp(true),
      group = svg.append('g').attr('class', 'riskBar'),
      riskStr = ("Effect measure " + this.data.parent.effectMeasure +
                 ": " + data.riskMid +
                 " (" + data.riskLow + "-" + data.riskHigh + ")");

  svg.attr('viewBox', "0 0 " + width + " " + height)
  group.append("svg:title").text(riskStr);

  if (data.riskMid != null) {
    group.selectAll()
      .data([data])
      .enter()
      .append("circle")
      .attr("cx", function(d, i) {return xscale(d.riskMid);})
      .attr("cy", function(d, i) {return yscale(0.5);})
      .attr("r", 5);
  }

  if ((data.riskLow != null) && (data.riskHigh != null)) {
    group.selectAll()
      .data([data])
      .enter()
      .append("line")
      .attr("x1", function(d, i) {return xscale(d.riskLow);})
      .attr("x2", function(d, i) {return xscale(d.riskHigh);})
      .attr("y1", yscale(0.5))
      .attr("y2", yscale(0.5));

    group.selectAll()
      .data([data])
      .enter()
      .append("line")
      .attr("x1", function(d, i) {return xscale(d.riskHigh);})
      .attr("x2", function(d, i) {return xscale(d.riskHigh);})
      .attr("y1", yscale(0.25))
      .attr("y2", yscale(0.75));

    group.selectAll()
      .data([data])
      .enter()
      .append("line")
      .attr("x1", function(d, i) {return xscale(d.riskLow);})
      .attr("x2", function(d, i) {return xscale(d.riskLow);})
      .attr("y1", yscale(0.25))
      .attr("y2", yscale(0.75));
  }
};
