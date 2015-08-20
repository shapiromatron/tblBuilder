var Future = Meteor.npmRequire('fibers/future'),
    PythonShell = Meteor.npmRequire('python-shell'),
    fs = Meteor.npmRequire('fs'),
    DocxGen = Meteor.npmRequire('docxtemplater'),
    expressions = Meteor.npmRequire('angular-expressions'),
    createWordReport = function(templateFilename, data) {
      var angularParser, blob, docx, path;
      angularParser = function(tag) {
        return {get: expressions.compile(tag)};
      };
      path = serverShared.getWordTemplatePath(templateFilename);
      blob = fs.readFileSync(path, "binary");
      docx = new DocxGen(blob);
      docx.setOptions({parser: angularParser});
      docx.setData(data);
      docx.render();
      return docx.getZip().generate({type: "string"});
    },
    exposureWordReport = function(tbl_id) {
      var d, exp, exposures, i, len, tbl;
      tbl = Tables.findOne(tbl_id);
      exposures = ExposureEvidence.find({tbl_id: tbl_id}, {sort: {sortIdx: 1}}).fetch();
      exposures.forEach(function(exp){
        exp.reference = Reference.findOne({_id: exp.referenceID});
        ExposureEvidence.setWordFields(exp);
      })
      return {
        "monographAgent": tbl.monographAgent,
        "volumeNumber": tbl.volumeNumber,
        "hasTable": true,
        "table": tbl,
        "exposures": exposures,
        "occupationals": _.filter(exposures, function(d) {
          return d.exposureScenario === "Occupational";
        }),
        "environmentals": _.filter(exposures, function(d) {
          return d.exposureScenario === "Environmental";
        }),
        "mixed": _.filter(exposures, function(d) {
          return d.exposureScenario === "Integrated/mixed";
        })
      };
    },
    prepareEpiDescriptive = function(desc) {
      desc.reference = Reference.findOne({_id: desc.referenceID});
      desc.coexposuresList = desc.coexposures.join(', ');
      desc.isCaseControl = desc.isCaseControl();
      desc.notes = desc.notes || "";
      desc.responseRateCase = utilities.getPercentOrText(desc.responseRateCase);
      desc.responseRateControl = utilities.getPercentOrText(desc.responseRateControl);
    },
    prepareEpiResult = function(res) {
      res.covariatesList = utilities.capitalizeFirst(res.covariates.join(', '));
      res.hasTrendTest = res.trendTest != null;
      res.riskEstimates.forEach(function(riskEst){
        riskEst.riskFormatted = res.riskFormatter(riskEst);
        riskEst.exposureCategory = utilities.capitalizeFirst(riskEst.exposureCategory);
      });
    },
    getEpiDataByReference = function(tbl_id) {
      var descriptions, tbl;
      tbl = Tables.findOne(tbl_id);
      descriptions = getDescriptionObjects([tbl_id]);
      return {
        "descriptions": descriptions,
        "monographAgent": tbl.monographAgent,
        "volumeNumber": tbl.volumeNumber,
        "hasTable": true,
        "table": tbl
      };
    },
    getEpiDataByReferenceMonographAgent = function(monographAgent, volumeNumber) {
      var data, descriptions, tbl_ids, tbls;
      tbls = Tables.find({volumeNumber: volumeNumber, monographAgent: monographAgent}).fetch();
      tbl_ids = _.pluck(tbls, "_id");
      descriptions = getDescriptionObjects(tbl_ids);
      return {
        "descriptions": descriptions,
        "monographAgent": monographAgent,
        "volumeNumber": volumeNumber,
        "hasTable": false
      };
    },
    getDescriptionObjects = function(tbl_ids) {
      var vals = EpiDescriptive.find(
        {tbl_id: {$in: tbl_ids}},
        {sort: {sortIdx: 1}}).fetch();

      vals.forEach(function(val){
        prepareEpiDescriptive(val);
        val.results = EpiResult.find(
          {parent_id: val._id},
          {sort: {sortIdx: 1}}).fetch();
        val.results.forEach(function(res){
          prepareEpiResult(res);
        });
      });
      return vals;
    },
    getEpiDataByOrganSite = function(tbl_id) {
      var data, organSites, tbl;
      tbl = Tables.findOne(tbl_id);
      organSites = getOrganSitesObject([tbl_id]);
      return {
        "organSites": organSites,
        "monographAgent": tbl.monographAgent,
        "volumeNumber": tbl.volumeNumber,
        "hasTable": true,
        "table": tbl
      };
    },
    getEpiDataByOrganSiteMonographAgent = function(monographAgent, volumeNumber) {
      var data, organSites, tbl_ids, tbls;
      tbls = Tables.find({volumeNumber: volumeNumber, monographAgent: monographAgent}).fetch();
      tbl_ids = _.pluck(tbls, "_id");
      organSites = getOrganSitesObject(tbl_ids);
      return {
        "organSites": organSites,
        "monographAgent": monographAgent,
        "volumeNumber": volumeNumber,
        "hasTable": false
      };
    },
    getOrganSitesObject = function(tbl_ids) {
      var data, epiResults, results, sites;
      epiResults = EpiResult.find({tbl_id: {$in: tbl_ids}}).fetch();
      sites = _.uniq(_.pluck(epiResults, "organSite"), false);
      return _.map(sites, function(site){
        results = EpiResult.find({tbl_id: {$in: tbl_ids}, organSite: site}).fetch();
        data = _.map(results, function(res){
          prepareEpiResult(res);
          res.descriptive = EpiDescriptive.findOne({_id: res.parent_id});
          prepareEpiDescriptive(res.descriptive);
          return res;
        });
        return {"organSite": site, "results": data};
      });
    },
    getEpiDataByTableCaptionDesc = function(tbl_id) {
      var caption, epiDescs, epiResults, studies, study, tables, tbl, tblCaptions, thisDescID, thisResults;
      tbl = Tables.findOne(tbl_id);

      epiDescs = EpiDescriptive.find({"tbl_id": tbl_id}, {sort: {sortIdx: 1}}).fetch();
      epiResults = EpiResult.find({"tbl_id": tbl_id}, {sort: {sortIdx: 1}}).fetch();
      _.map(epiDescs, prepareEpiDescriptive);
      _.map(epiResults, prepareEpiResult);

      tblCaptions = _.chain(epiResults)
                     .pluck("printCaption")
                     .without(undefined)
                     .unique(false)
                     .value();

      tables = tblCaptions.map(function(caption){
        thisResults = _.chain(epiResults)
          .where({"printCaption": caption})
          .filter(function(d) {return d.printOrder > 0;})
          .sortBy('printOrder')
          .value();

        studies = [];
        thisDescID = undefined;
        thisResults.forEach(function(res){
          if (res.parent_id !== thisDescID) {
            thisDescID = res.parent_id;
            study = JSON.parse(JSON.stringify(_.findWhere(epiDescs, {"_id": res.parent_id})));
            study.results = [];
            studies.push(study);
          }
          study.results.push(res);
        })
        return {"caption": caption, "studies": studies};
      });
      return {"tables": tables, "table": tbl};
    },
    epiWordReport = function(tbl_id, epiSortOrder) {
      switch (epiSortOrder) {
        case "Reference":
          return getEpiDataByReference(tbl_id);
        case "Organ-site":
          return getEpiDataByOrganSite(tbl_id);
        default:
          return console.error("unknown epiSortOrder");
      }
    },
    epiWordReportMultiTable = function(filename, monographAgent, volumeNumber) {
      var data,
          epiSortOrder = ReportTemplate.findOne({filename: filename}).epiSortOrder;
      switch (epiSortOrder) {
        case "Reference":
          data = getEpiDataByReferenceMonographAgent(monographAgent, volumeNumber);
          break;
        case "Organ-site":
          data = getEpiDataByOrganSiteMonographAgent(monographAgent, volumeNumber);
      }
      return createWordReport(filename, data);
    },
    animalWordReport = function(tbl_id) {
      var tbl = Tables.findOne(tbl_id),
          evidences = AnimalEvidence.find({tbl_id: tbl_id}, {sort: {sortIdx: 1}}).fetch();

      evidences.forEach(function(evidence){
        evidence.reference = Reference.findOne({_id: evidence.referenceID});
        AnimalEvidence.setWordFields(evidence);
      })

      return {
        "monographAgent": tbl.monographAgent,
        "volumeNumber": tbl.volumeNumber,
        "hasTable": true,
        "table": tbl,
        "studies": evidences
      };
    },
    mechanisticWordReport = function(tbl_id) {
      var formatEvidence = function(obj) {
            var refs = Reference.find({_id: {$in: obj.references}}).fetch();
            obj.references = _.pluck(refs, 'name').join(', ');
            if (obj.references !== "") obj.references = "(" + obj.references + ")";
            obj.text = obj.text || "";
            return obj.subheading = obj.subheading || "";
          },
          getChildren = function(parent) {
            var children = MechanisticEvidence.find(
              {parent: parent._id},
              {sort: {sortIdx: 1}}).fetch();
            parent.children = children;
            return children.map(function(child){
              formatEvidence(child);
              return getChildren(child);
            })
          },
          data = {
            "table": Tables.findOne({_id: tbl_id})
          };

      data.sections = MechanisticEvidence.evidenceSections.map(function(section){
        var children = MechanisticEvidence.find(
          {tbl_id: tbl_id,section: section.section},
          {sort: {sortIdx: 1}}).fetch();
        children.forEach(function(child){
          child.hasSubheading = (child.subheading != null) && child.subheading !== "";
          formatEvidence(child);
          getChildren(child);
        });
        return {"description": section.sectionDesc, "children": children};
      });
      return data;
    },
    genotoxWordReport = function(tbl_id) {
      var d, tbl, vals;
      tbl = Tables.findOne(tbl_id);
      d = {
        "monographAgent": tbl.monographAgent,
        "volumeNumber": tbl.volumeNumber,
        "table": tbl
      };
      vals = GenotoxEvidence.find({tbl_id: tbl_id}, {sort: {sortIdx: 1}}).fetch();
      vals.forEach(function(val){
        val.reference = Reference.findOne({_id: val.referenceID});
        GenotoxEvidence.setWordFields(val);
      })
      d.nonMammalian = _.filter(vals, function(v) {
        return v.dataClass === "Non-mammalian";
      });
      d.mammalianInVitro = _.filter(vals, function(v) {
        return v.dataClass === "Mammalian and human in vitro";
      });
      d.mammalianInVitro = _.sortBy(d.mammalianInVitro, function(v) {
        return v.testSpeciesMamm + v.speciesMamm;
      });
      d.animalInVivo = _.filter(vals, function(v) {
        return v.dataClass === "Animal in vivo";
      });
      d.humanInVivo = _.filter(vals, function(v) {
        return v.dataClass === "Human in vivo";
      });
      return d;
    },
    pyWordHelperArgs = function(report_type, context, fut) {
      var cb, options;
      options = {
        scriptPath: Meteor.settings.scripts_path,
        args: [report_type, JSON.stringify(context)],
        pythonPath: Meteor.settings.python_path
      };
      cb = function(err, res) {
        if (err) {
          console.log("An error occurred: ");
          console.log(err);
          return undefined;
        }
        return res.join("");
      };
      return PythonShell.run("generateReport.py", options, function(err, res) {
        return fut["return"](cb(err, res));
      });
    },
    pyWordHelperStdin = function(report_type, context, fut) {
      var report,
          options = {
              mode: "json",
              scriptPath: Meteor.settings.scripts_path,
              pythonPath: Meteor.settings.python_path
          },
          shell = new PythonShell("generateReport.py", options),
          inputs = {
              report_type: report_type,
              context: context
          };

      shell.on('message', function(msg) {
          return report = msg.report;
      });
      shell.send(inputs);
      return shell.end(function(err) {
        if (err) {console.log(err);}
        return fut["return"](report);
      });
    },
    getContext = function(report_type, tbl_id) {
      var d = {};
      switch (report_type) {
        case "EpiHtmlTblRecreation":
          d = getEpiDataByReference(tbl_id);
          break;
        case "NtpEpiDescriptive":
          d = getEpiDataByReference(tbl_id);
          break;
        case "NtpEpiResults":
          d = getEpiDataByTableCaptionDesc(tbl_id);
          break;
        case "NtpEpiAniResults":
          d = getEpiDataByTableCaptionDesc(tbl_id);
          break;
        case "AnimalHtmlTblRecreation":
          d = animalWordReport(tbl_id);
          break;
        case "ExposureTables":
          d = ExposureEvidence.reportContext(tbl_id);
          break;
        default:
          console.log("No context specified: {0}".printf(report_type));
      }
      return d;
    };

Meteor.methods({
  downloadWordReport: function(tbl_id, filename) {
    var data, tbl, template;
    tbl = Tables.findOne(tbl_id);
    template = ReportTemplate.findOne({filename: filename});
    switch (tbl.tblType) {
      case "Exposure Evidence":
        data = exposureWordReport(tbl_id);
        break;
      case "Epidemiology Evidence":
        data = epiWordReport(tbl_id, template.epiSortOrder);
        break;
      case "Animal Bioassay Evidence":
        data = animalWordReport(tbl_id);
        break;
      case "Genetic and Related Effects":
        data = genotoxWordReport(tbl_id);
        break;
      case "Mechanistic Evidence Summary":
        data = mechanisticWordReport(tbl_id);
        break;
      default:
        return console.error("unknown table type: " + tbl.tblType);
    }
    return createWordReport(filename, data);
  },
  monographAgentEpiReport: function(d) {
    return epiWordReportMultiTable(d.templateFN, d.monographagent, d.volumenumber);
  },
  pyWordReport: function(tbl_id, report_type) {
    var context, fut;
    this.unblock();
    fut = new Future();
    context = getContext(report_type, tbl_id);
    pyWordHelperStdin(report_type, context, fut);
    return fut.wait();
  }
});
