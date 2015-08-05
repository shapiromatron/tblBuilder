shared = {
  getHTMLTitleBase: function() {
    var context = Meteor.settings["public"].context.toUpperCase();
    document.title = context + " Table Builder";
  },
  getHTMLTitleTbl: function() {
    var base = shared.getHTMLTitleBase(),
        tbl = Session.get('Tbl');
    document.title = base + " | " + tbl.tblType + " | " + tbl.name;
  },
  capitalizeFirst: function(str) {
    if ((str != null) && str.length > 0) {
      str = str[0].toUpperCase() + str.slice(1);
    }
    return str;
  },
  riskFormatter: function(obj) {
    if (obj.riskMid == null) return "-";
    var txt = obj.riskMid.toString();
    if ($.isNumeric(obj.riskLow) && $.isNumeric(obj.riskHigh)) {
      txt += " (" + obj.riskLow + "–" + obj.riskHigh + ")";
    }
    if (obj.riskEstimated) txt = "[" + txt + "]";
    return txt;
  },
  cloneObject: function(oldObj, Collection, NestedCollection) {
    var i, len, newNest, newObj, new_parent_id, oldNest, ref, results;
    newObj = $.extend(true, {}, oldObj);
    new_parent_id = Collection.insert(newObj);
    if (NestedCollection != null) {
      ref = NestedCollection.find({
        parent_id: oldObj._id
      }).fetch();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        oldNest = ref[i];
        newNest = $.extend(true, {}, oldNest);
        newNest.parent_id = new_parent_id;
        results.push(NestedCollection.insert(newNest));
      }
      return results;
    }
  },
  getPercentOrText: function(txt) {
    if (txt == null) return "";
    if ($.isNumeric(txt)) txt = txt.toString();
    if (txt.search && txt.search(/(\d)+/) >= 0) txt += "%";
    return txt;
  },
  getFlattenedEpiData: function(tbl_id) {
    var coexposures, data, getResultData, header, i, len, reference, row, rows, v, vals;
    getResultData = function(parent_id, row) {
      var covariates, i, j, len, len1, re, ref, row2, row3, rows, v, vals;
      vals = EpiResult.find({parent_id: parent_id}, {sort: {sortIdx: 1}}).fetch();
      rows = [];
      for (i = 0, len = vals.length; i < len; i++) {
        v = vals[i];
        covariates = v.covariates.join(', ');
        row2 = row.slice();
        row2.push(v._id, v.organSite, v.effectMeasure, v.effectUnits, v.trendTest, covariates, v.covariatesControlledText, v.notes);
        ref = v.riskEstimates;
        for (j = 0, len1 = ref.length; j < len1; j++) {
          re = ref[j];
          row3 = row2.slice();
          row3.push(re.exposureCategory, re.numberExposed, re.riskEstimated, re.riskMid, re.riskLow, re.riskHigh, re.inTrendTest, shared.riskFormatter(re));
          rows.push(row3);
        }
      }
      // set undefined to blank text-string
      return _.map(rows, function(row){
        return _.map(row, function(d){return (d===undefined)? "" : d;});
      });
    };
    vals = EpiDescriptive.find({tbl_id: tbl_id}, {sort: {sortIdx: 1}}).fetch();
    header = ["Descriptive ID", "Reference", "Study design", "Location", "Enrollment or follow-up dates", "Population/eligibility characteristics", "Other population descriptors", "Outcome Data Source", "Population size", "Loss to follow-up (%)", "Type of referent group", "Population cases", "Response rate cases", "Source cases", "Population controls", "Response rate controls", "Source controls", "Exposure assessment type", "Quantitative exposure level", "Exposure assessment notes", "Possible co-exposures", "Principal strengths", "Principal limitations", "General notes", "Result ID", "Organ site", "Effect measure", "Effect measure units", "Trend test", "Covariates", "Covariates notes", "General notes", "Exposure category", "Number exposed", "Risks estimated?", "Risk Mid", "Risk 5% CI", "Risk 95% CI", "In trend-test", "Risk"];
    data = [header];
    for (i = 0, len = vals.length; i < len; i++) {
      v = vals[i];
      reference = Reference.findOne({
        _id: v.referenceID
      }).name;
      coexposures = v.coexposures.join(', ');
      row = [v._id, reference, v.studyDesign, v.location, v.enrollmentDates, v.eligibilityCriteria, v.populationDescription, v.outcomeDataSource, v.populationSize, v.lossToFollowUp, v.referentGroup, v.populationSizeCase, v.responseRateCase, v.sourceCase, v.populationSizeControl, v.responseRateControl, v.sourceControl, v.exposureAssessmentType, v.exposureLevel, v.exposureAssessmentNotes, coexposures, v.strengths, v.limitations, v.notes];
      rows = getResultData(v._id, row);
      data.push.apply(data, rows);
    }
    return data;
  },
  getFlattenedExposureData: function(tbl_id) {
    var data, header, i, len, reference, row, v, vals;
    vals = ExposureEvidence.find({
      tbl_id: tbl_id
    }, {
      sort: {
        sortIdx: 1
      }
    }).fetch();
    header = ["Exposure ID", "Reference", "Exposure scenario", "Collection date", "Occupation", "Occupational information", "Country", "Location", "Agent", "Sampling Matrix", "Sampling Approach", "Number of measurements", "Measurement duration", "Exposure level", "Exposure level description", "Exposure level range", "Units", "Comments"];
    data = [header];
    for (i = 0, len = vals.length; i < len; i++) {
      v = vals[i];
      reference = Reference.findOne({
        _id: v.referenceID
      }).name;
      row = [v._id, reference, v.exposureScenario, v.collectionDate, v.occupation, v.occupationInfo, v.country, v.location, v.agent, v.samplingMatrix, v.samplingApproach, v.numberMeasurements, v.measurementDuration, v.exposureLevel, v.exposureLevelDescription, v.exposureLevelRange, v.units, v.comments];
      data.push(row);
    }
    return data;
  },
  getFlattenedAnimalData: function(tbl_id) {
    var data, getEndpointData, header, i, len, limitations, reference, row, rows, strengths, v, vals;
    getEndpointData = function(parent_id, row) {
      var eg, i, j, len, len1, ref, row2, row3, rows, signifs, v, vals;
      vals = AnimalEndpointEvidence.find({
        parent_id: parent_id
      }, {
        sort: {
          sortIdx: 1
        }
      }).fetch();
      rows = [];
      for (i = 0, len = vals.length; i < len; i++) {
        v = vals[i];
        row2 = row.slice();
        row2.push(v._id, v.tumourSite, v.histology, v.units);
        signifs = [v.incidence_significance, v.multiplicity_significance, v.total_tumours_significance];
        ref = v.endpointGroups;
        for (j = 0, len1 = ref.length; j < len1; j++) {
          eg = ref[j];
          row3 = row2.slice();
          row3.push(eg.dose, eg.nStart, eg.nSurviving, eg.incidence, eg.multiplicity, eg.totalTumours);
          row3.push.apply(row3, signifs);
          rows.push(row3);
        }
      }
      return rows;
    };
    vals = AnimalEvidence.find({
      tbl_id: tbl_id
    }, {
      sort: {
        sortIdx: 1
      }
    }).fetch();
    header = ["Evidence ID", "Reference", "Study design", "Species", "Strain", "Sex", "Agent", "Purity", "Dosing route", "Vehicle", "Age at start", "Duration", "Dosing Regimen", "Strengths", "Limitations", "Comments", "Endpoint ID", "Tumour site", "Histology", "Units", "Dose", "N at Start", "N Surviving", "Incidence", "Multiplicity", "Total Tumours", "Incidence significance", "Multiplicity significance", "Total tumours significance"];
    data = [header];
    for (i = 0, len = vals.length; i < len; i++) {
      v = vals[i];
      reference = Reference.findOne({
        _id: v.referenceID
      }).name;
      strengths = v.strengths.join(', ');
      limitations = v.limitations.join(', ');
      row = [v._id, reference, v.studyDesign, v.species, v.strain, v.sex, v.agent, v.purity, v.dosingRoute, v.vehicle, v.ageAtStart, v.duration, v.dosingRegimen, strengths, limitations, v.comments];
      rows = getEndpointData(v._id, row);
      data.push.apply(data, rows);
    }
    return data;
  },
  getFlattenedGenotoxData: function(tbl_id) {
    var data, header, i, len, reference, row, v, vals;
    vals = GenotoxEvidence.find({
      tbl_id: tbl_id
    }, {
      sort: {
        sortIdx: 1
      }
    }).fetch();
    header = ["Genotoxicity ID", "Reference", "Data class", "Agent", "Plylogenetic class", "Test system", "Non-mammalian species", "Non-mammalian strain", "Mammalian species", "Mammalian strain", "Tissue/Cell line", "Species", "Strain", "Sex", "Tissue, animal", "Tissue, human", "Cell type", "Exposure description", "Endpoint", "Endpoint test", "Dosing route", "Dosing duration", "Dosing regime", "Doses tested", "Units", "Dual results?", "Result", "Result, metabolic activation", "Result, no metabolic activation", "LED/HID", "Significance", "Comments"];
    data = [header];
    for (i = 0, len = vals.length; i < len; i++) {
      v = vals[i];
      reference = Reference.findOne({
        _id: v.referenceID
      }).name;
      row = [v._id, reference, v.dataClass, v.agent, v.phylogeneticClass, v.testSystem, v.speciesNonMamm, v.strainNonMamm, v.testSpeciesMamm, v.speciesMamm, v.tissueCellLine, v.species, v.strain, v.sex, v.tissueAnimal, v.tissueHuman, v.cellType, v.exposureDescription, v.endpoint, v.endpointTest, v.dosingRoute, v.dosingDuration, v.dosingRegimen, v.dosesTested, v.units, v.dualResult, v.result, v.led, v.resultMetabolic, v.resultNoMetabolic, v.significance, v.comments];
      data.push(row);
    }
    return data;
  },
  setExposureWordFields: function(d) {
    d.location = d.location || "Not-reported";
    d.occupationInfo = d.occupationInfo || "";
    return d.comments = d.comments || "";
  },
  defaultEpiVisible: ["Reference", "Study design", "Location", "Organ site", "Effect measure", "Exposure category", "Risk"],
  mechanisticTestCrosswalk: {
    "Non-mammalian": {
      "Acellular systems": {
        "Genotox": {
          "DNA damage": ["DNA adducts", "DNA strand breaks", "DNA cross-links", "Intercalation", "Other"]
        }
      },
      "Prokaryote (bacteria)": {
        "Genotox": {
          "DNA damage": ["DNA strand breaks", "DNA cross-links", "Other"],
          "Mutation": ["Reverse mutation", "Forward mutation", "Other"],
          "DNA repair": ["Other"]
        }
      },
      "Lower eukaryote (yeast, mold)": {
        "Genotox": {
          "DNA damage": ["DNA strand breaks", "DNA cross-links", "Other"],
          "Mutation": ["Reverse mutation", "Forward mutation", "Gene conversion", "Other"],
          "Chromosomal damage": ["Chromosomal aberrations", "Aneuploidy", "Other"]
        }
      },
      "Insect": {
        "Genotox": {
          "Mutation": ["Somatic mutation and recombination test (SMART)", "Sex-linked recessive lethal mutations", "Heritable translocation test", "Dominant lethal test", "Other"],
          "Chromosomal damage": ["Aneuploidy", "Other"],
          "DNA repair": ["Other"]
        }
      },
      "Plant systems": {
        "Genotox": {
          "DNA damage": ["Unscheduled DNA synthesis", "Other"],
          "Chromosomal damage": ["Chromosomal aberrations", "Micronuclei", "Sister Chromatid Exchange", "Aneuploidy", "Other"],
          "Mutation": ["Reverse mutation", "Forward mutation", "Gene conversion", "Other"]
        }
      },
      "Other (fish, worm, bird, etc)": {
        "Genotox": {
          "DNA damage": ["DNA adducts", "DNA strand breaks", "DNA cross-links", "DNA oxidation", "Unscheduled DNA synthesis", "Other"],
          "Mutation": ["Oncogene", "Tumour suppressor", "Other"],
          "Chromosomal damage": ["Chromosomal aberrations", "Micronuclei", "Sister Chromatid Exchange", "Aneuploidy", "Other"],
          "DNA repair": ["Other"]
        }
      }
    },
    "Mammalian and human in vitro": {
      "Human": {
        "Genotox": {
          "DNA damage": ["DNA adducts", "DNA strand breaks", "DNA cross-links", "DNA oxidation", "Unscheduled DNA synthesis", "Other"],
          "Mutation": ["Oncogene", "Tumour suppressor", "Other"],
          "Chromosomal damage": ["Chromosomal aberrations", "Micronuclei", "Sister Chromatid Exchange", "Aneuploidy", "Other"],
          "DNA repair": ["Other"],
          "Cell transformation": ["Other"]
        }
      },
      "Non-human mammalian": {
        "Genotox": {
          "DNA damage": ["DNA adducts ", "DNA strand breaks", "DNA cross-links", "DNA oxidation", "Unscheduled DNA synthesis", "Other"],
          "Mutation": ["tk", "hprt ", "ouabain resistance", "Other gene", "Chromosomal damage", "Chromosomal aberrations", "Micronuclei", "Sister Chromatid Exchange", "Aneuploidy", "Other"],
          "Chromosomal damage": ["Chromosomal aberrations", "Micronuclei", "Sister Chromatid Exchange", "Aneuploidy", "Other"],
          "DNA repair": ["Other"],
          "Cell transformation": ["Other"]
        }
      }
    },
    "Animal in vivo": {
      "Genotox": {
        "DNA damage": ["DNA adducts", "DNA strand breaks", "DNA cross-links", "DNA oxidation", "Unscheduled DNA synthesis", "Other"],
        "Mutation": ["Mouse spot test", "Mouse specific locus test", "Dominant lethal test", "Transgenic animal tests ", "Other"],
        "Chromosomal damage": ["Chromosomal aberrations", "Micronuclei", "Sister Chromatid Exchange", "Aneuploidy", "Other"],
        "DNA repair": ["Other"]
      }
    },
    "Human in vivo": {
      "Genotox": {
        "DNA damage": ["DNA adducts", "DNA strand breaks", "DNA cross-links", "DNA oxidation", "Unscheduled DNA synthesis", "Other"],
        "Mutation": ["Oncogene", "Tumour suppressor", "Other"],
        "Chromosomal damage": ["Chromosomal aberrations", "Micronuclei", "Sister Chromatid Exchange", "Aneuploidy", "Other"],
        "DNA repair": ["Other"]
      }
    }
  },
  isGenotoxAcellular: function(dataClass, phylogeneticClass) {
    var acell, dcls;
    dcls = "Non-mammalian";
    acell = "Acellular systems";
    return (dataClass === dcls) && (phylogeneticClass === acell);
  },
  getGenotoxTestSystemDesc: function(d) {
    var txt;
    switch (d.dataClass) {
      case "Non-mammalian":
        if (shared.isGenotoxAcellular(d.dataClass, d.phylogeneticClass)) {
          txt = d.phylogeneticClass + "<br>" + d.testSystem;
        } else {
          txt = d.phylogeneticClass + "<br>" + d.speciesNonMamm + "&nbsp;" + d.strainNonMamm;
        }
        break;
      case "Mammalian and human in vitro":
        txt = d.speciesMamm + "<br>" + d.tissueCellLine;
        break;
      case "Animal in vivo":
        txt = d.species + "&nbsp;" + d.strain + "&nbsp;" + d.sex + "<br>" + d.tissueAnimal;
        txt += "<br>" + d.dosingRoute + ";&nbsp;" + d.dosingDuration + ";&nbsp;" + d.dosingRegimen;
        break;
      case "Human in vivo":
        txt = d.tissueHuman + ", " + d.cellType + "<br>" + d.exposureDescription;
        break;
      default:
        console.log("unknown data-type: {#d.dataClass}");
    }
    return txt;
  },
  setNonMammalianExperimentText: function(d) {
    var txt;
    txt = "" + d.agent;
    if ((d.led != null) && d.led !== "") {
      txt += "\n" + d.led;
    }
    txt += " " + d.units;
    if (d.dosesTested != null) {
      txt += "\n[" + d.dosesTested + " " + d.units + "]";
    }
    if (d.dosingDuration != null) {
      txt += "\n" + d.dosingDuration;
    }
    return txt;
  },
  setGenotoxWordFields: function(d) {
    d.comments = d.comments || "";
    d.led = d.led || "";
    d.significance = d.significance || "";
    switch (d.dataClass) {
      case "Non-mammalian":
        if (shared.isGenotoxAcellular(d.dataClass, d.phylogeneticClass)) {
          d._testSystem = d.testSystem;
        } else {
          d._testSystem = d.speciesNonMamm + " " + d.strainNonMamm;
        }
        d._experimental = shared.setNonMammalianExperimentText(d);
        break;
      case "Mammalian and human in vitro":
        d.colA = d.testSpeciesMamm === "Human" ? d.testSpeciesMamm : d.speciesMamm;
    }
    if (d.dualResult) {
      d.resultA = d.resultNoMetabolic;
      return d.resultB = d.resultMetabolic;
    } else {
      d.resultA = d.result;
      if (d.dataClass.indexOf('vitro') >= 0 || d.dataClass.indexOf('Non-mammalian') >= 0) {
        return d.resultB = "";
      } else {
        return d.resultB = "NA";
      }
    }
  },
  getAnimalDoses: function(e) {
    if (e) {
      return e.endpointGroups.map(function(v) {
        return v.dose;
      }).join(", ") + " " + e.units;
    } else {
      return "NR";
    }
  },
  getAnimalNStarts: function(e) {
    if (e) {
      return e.endpointGroups.map(function(v) {
        return v.nStart;
      }).join(", ");
    } else {
      return "NR";
    }
  },
  getAnimalNSurvivings: function(e) {
    var numeric, survivings;
    if ((e == null) || (e.endpointGroups == null)) {
      return "NR";
    }
    numeric = false;
    survivings = e.endpointGroups.map(function(eg) {
      if ((eg.nSurviving != null) && eg.nSurviving !== "") {
        numeric = true;
        return eg.nSurviving;
      } else {
        return "NR";
      }
    });
    if (numeric) {
      return survivings.join(", ");
    } else {
      return "NR";
    }
  },
  getAnimalEndpointIncidents: function(egs) {
    var val;
    if (_.pluck(egs, "incidence").join("").length > 0) {
      val = egs.map(function(v) {
        return v.incidence;
      }).join(", ");
      return "Tumour incidence: " + val;
    } else {
      return "";
    }
  },
  getAnimalEndpointMultiplicities: function(egs) {
    var val;
    if (_.pluck(egs, "multiplicity").join("").length > 0) {
      val = egs.map(function(v) {
        return v.multiplicity || "NR";
      }).join(", ");
      return "Tumour multiplicity: " + val;
    } else {
      return "";
    }
  },
  getAnimalTotalTumours: function(egs) {
    var val;
    if (_.pluck(egs, "totalTumours").join("").length > 0) {
      val = egs.map(function(v) {
        return v.totalTumours || "NR";
      }).join(", ");
      return "Total tumours: " + val;
    } else {
      return "";
    }
  },
  setAnimalWordFields: function(d) {
    var e, i, len, ref;
    d.strengths = d.strengths.join(", ") || "None";
    d.limitations = d.limitations.join(", ") || "None";
    d.comments = d.comments || "None";
    d.endpoints = AnimalEndpointEvidence.find({
      parent_id: d._id
    }).fetch();
    ref = d.endpoints;
    for (i = 0, len = ref.length; i < len; i++) {
      e = ref[i];
      e.incidents = shared.getAnimalEndpointIncidents(e.endpointGroups);
      e.multiplicities = shared.getAnimalEndpointMultiplicities(e.endpointGroups);
      e.total_tumours = shared.getAnimalTotalTumours(e.endpointGroups);
      e.incidence_significance = e.incidence_significance || "";
      e.multiplicity_significance = e.multiplicity_significance || "";
      e.total_tumours_significance = e.total_tumours_significance || "";
    }
    e = d.endpoints.length > 0 ? d.endpoints[0] : void 0;
    d.doses = shared.getAnimalDoses(e);
    d.nStarts = shared.getAnimalNStarts(e);
    return d.nSurvivings = shared.getAnimalNSurvivings(e);
  }
}
