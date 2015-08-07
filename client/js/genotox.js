Template.genotoxMain.helpers(clientShared.abstractMainHelpers);
Template.genotoxMain.onCreated(function() {
  Session.set('evidenceType', 'genotoxEvidence');
  Session.set('evidenceShowNew', false);
  Session.set('evidenceShowAll', false);
  Session.set('evidenceEditingId', null);
  this.subscribe('genotoxEvidence', Session.get('Tbl')._id);
});


Template.genotoxTbl.helpers(clientShared.abstractTblHelpers);
Template.genotoxTbl.events(clientShared.abstractTblEvents);
Template.genotoxTbl.onRendered(function() {
  clientShared.initDraggables(this.find('#sortable'), ".dhOuter", GenotoxEvidence);
  clientShared.toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'));
});


Template.genotoxRow.events(clientShared.abstractRowEvents);
Template.genotoxRow.helpers({
  getCol1: function() {
    return this.dataClass;
  },
  getCol2: function() {
    return GenotoxEvidence.getTestSystemDesc(this);
  },
  getCol3: function() {
    return this.endpoint + "/<br>" + this.endpointTest;
  },
  getCol4: function() {
    var txt;
    if (this.dualResult) {
      txt = this.resultNoMetabolic;
    } else {
      txt = this.result;
    }
    if (this.dataClass === "Human in vivo" && this.significance) {
      txt += "&nbsp;" + this.significance;
    }
    return txt;
  },
  getCol5: function() {
    var txt;
    if (this.dualResult) {
      txt = this.resultMetabolic;
    } else {
      if (this.dataClass.indexOf('vitro') >= 0 || this.dataClass.indexOf('Non-mammalian') >= 0) {
        txt = "";
      } else {
        txt = "NA";
      }
    }
    return txt;
  },
  getCol6: function() {
    var txt = this.agent;
    if (this.led) {
      txt += ",<br>" + this.led + " " + this.units;
    }
    if (this.dosesTested != null) {
      txt += ",<br>[" + this.dosesTested + "&nbsp;" + this.units + "]";
    }
    if (this.dosingDuration) {
      txt += ", " + this.dosingDuration;
    }
    return txt;
  },
  getCol7: function() {
    return this.comments;
  }
});


var toggleDataClassFields = function(tmpl) {
    var dataClass = tmpl.find('select[name="dataClass"]').value,
        phylo = tmpl.find('select[name="phylogeneticClass"]').value,
        shows = "",
        hides = "";

    switch (dataClass) {
      case "Non-mammalian":
        shows = ".non_mamm, .doses, .vitro";
        hides = ".mamm_vitro, .ani_vivo, .human_vivo, .concs";
        if (phylo === "Other (fish, worm, bird, etc)") {
          shows += ", .expvivo";
        } else {
          hides += ", .expvivo";
        }
        break;
      case "Mammalian and human in vitro":
        shows = ".mamm_vitro, .doses, .vitro";
        hides = ".non_mamm, .ani_vivo, .human_vivo, .concs, .expvivo";
        break;
      case "Animal in vivo":
        shows = ".ani_vivo, .concs, .expvivo";
        hides = ".non_mamm, .mamm_vitro, .human_vivo, .doses, .vitro";
        break;
      case "Human in vivo":
        shows = ".human_vivo, .concs";
        hides = ".non_mamm, .mamm_vitro, .ani_vivo, .doses, .vitro, .expvivo";
        break;
      default:
        console.log("unknown data-type: {#dataClass}");
    }
    $(tmpl.findAll(shows)).show();
    $(tmpl.findAll(hides)).hide();
  },
  togglePhyloFields = function(tmpl) {
    var dataClass = tmpl.find('select[name="dataClass"]').value,
        phylo = tmpl.find('select[name="phylogeneticClass"]').value;

    if (dataClass !== "Non-mammalian") return;

    if (GenotoxEvidence.isGenotoxAcellular(dataClass, phylo)) {
      $(tmpl.findAll('.isAcellular')).show();
      $(tmpl.findAll('.isntAcellular')).hide();
    } else {
      $(tmpl.findAll('.isAcellular')).hide();
      $(tmpl.findAll('.isntAcellular')).show();
    }
  },
  toggleEndpointOptions = function(tmpl) {
    var dataClass = tmpl.find('select[name="dataClass"]').value,
        phylo = tmpl.find('select[name="phylogeneticClass"]').value,
        mamm = tmpl.find('select[name="testSpeciesMamm"]').value,
        tox = "Genotox",
        obj, options, selector, existing, found;

    switch (dataClass) {
      case "Non-mammalian":
        obj = GenotoxEvidence.testCrosswalk[dataClass][phylo][tox];
        break;
      case "Mammalian and human in vitro":
        obj = GenotoxEvidence.testCrosswalk[dataClass][mamm][tox];
        break;
      case "Animal in vivo":
        obj = GenotoxEvidence.testCrosswalk[dataClass][tox];
        break;
      case "Human in vivo":
        obj = GenotoxEvidence.testCrosswalk[dataClass][tox];
        break;
      default:
        console.log("unknown data-type: " + dataClass);
    }

    options = _.map(_.keys(obj), function(d){
      return "<option value='" + d + "'>" + d + "</option>";
    })

    selector = $(tmpl.find('select[name="endpoint"]'));
    if (tmpl.data.isNew) {
      existing = "option[value='" + (selector.val()) + "']";
    } else {
      existing = "option[value='" + tmpl.data.endpoint + "']";
    }
    selector.html(options);

    found = selector.find(existing);
    if (found.length > 0) found.prop('selected', true);
    toggleEndpointTestOptions(tmpl);
  },
  toggleEndpointTestOptions = function(tmpl) {
    var dataClass = tmpl.find('select[name="dataClass"]').value,
        phylo = tmpl.find('select[name="phylogeneticClass"]').value,
        mamm = tmpl.find('select[name="testSpeciesMamm"]').value,
        tox = "Genotox",
        endpoint = tmpl.find('select[name="endpoint"]').value,
        obj, options, selector, existing, found;

    switch (dataClass) {
      case "Non-mammalian":
        obj = GenotoxEvidence.testCrosswalk[dataClass][phylo][tox][endpoint];
        break;
      case "Mammalian and human in vitro":
        obj = GenotoxEvidence.testCrosswalk[dataClass][mamm][tox][endpoint];
        break;
      case "Animal in vivo":
        obj = GenotoxEvidence.testCrosswalk[dataClass][tox][endpoint];
        break;
      case "Human in vivo":
        obj = GenotoxEvidence.testCrosswalk[dataClass][tox][endpoint];
        break;
      default:
        console.log("unknown data-type: {#dataClass}");
    }

    options = _.map(_.values(obj), function(d){
      return "<option value='" + d + "'>" + d + "</option>";
    })

    selector = $(tmpl.find('select[name="endpointTest"]'));
    if (tmpl.data.isNew) {
      existing = "option[value='" + (selector.val()) + "']";
    } else {
      existing = "option[value='" + tmpl.data.endpointTest + "']";
    }
    selector.html(options);

    found = selector.find(existing);
    if (found.length > 0) return found.prop('selected', true);
  },
  toggleDualResult = function(tmpl) {
    var dual = $(tmpl.find('input[name="dualResult"]')).prop('checked'),
        dataClass = tmpl.find('select[name="dataClass"]').value;

    if (dual && (dataClass === "Non-mammalian" || dataClass === "Mammalian and human in vitro")) {
      $(tmpl.findAll('.isDualResult')).show();
      $(tmpl.findAll('.isntDualResult')).hide();
    } else {
      $(tmpl.findAll('.isDualResult')).hide();
      $(tmpl.findAll('.isntDualResult')).show();
    }
  };
Template.genotoxForm.helpers({
  getDataClass: function() {
    return GenotoxEvidence.dataClass;
  },
  getPhylogeneticClasses: function() {
    return GenotoxEvidence.phylogeneticClasses;
  },
  getMammalianTestSpecies: function() {
    return GenotoxEvidence.mammalianTestSpecies;
  },
  getSexes: function() {
    return GenotoxEvidence.sexes;
  },
  getResultOptions: function() {
    return GenotoxEvidence.resultOptions;
  }
});
Template.genotoxForm.events(_.extend({
    'change select[name="dataClass"]': function(evt, tmpl) {
      toggleDataClassFields(tmpl);
      togglePhyloFields(tmpl);
      toggleEndpointOptions(tmpl);
      toggleDualResult(tmpl);
    },
    'change select[name="phylogeneticClass"]': function(evt, tmpl) {
      toggleDataClassFields(tmpl);
      togglePhyloFields(tmpl);
      toggleEndpointOptions(tmpl);
    },
    'click input[name="dualResult"]': function(evt, tmpl) {
      toggleDualResult(tmpl);
    },
    'change select[name="testSpeciesMamm"]': function(evt, tmpl) {
      toggleEndpointOptions(tmpl);
    },
    'change select[name="endpoint"]': function(evt, tmpl) {
      toggleEndpointTestOptions(tmpl);
    }
  }, clientShared.abstractFormEvents));
Template.genotoxForm.onRendered(function() {
  toggleDataClassFields(this);
  togglePhyloFields(this);
  toggleEndpointOptions(this);
  toggleDualResult(this);
  clientShared.toggleQA(this, this.data.isQA);
  clientShared.initPopovers(this, {html: true});
});
Template.genotoxForm.onDestroyed(function() {
  clientShared.destroyPopovers(this);
});
