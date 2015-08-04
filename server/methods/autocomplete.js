var singleFieldTextSearch = function(Collection, field, qrystr, tbl_id) {
  var options, query, queryset, values;
  check(qrystr, String);
  query = {};
  query[field] = {$regex: new RegExp(qrystr, "i")};
  if (tbl_id != null) {query["tbl_id"] = tbl_id;}
  options = {fields: {}, limit: 1000, sort: []};
  options.fields[field] = 1;
  options.sort.push(field);
  queryset = Collection.find(query, options).fetch();
  values = _.pluck(queryset, field);
  return _.uniq(values, true);
};

Meteor.methods({
  adminUserEditProfile: function(_id, obj) {
    if (!serverShared.isStaffOrHigher(this.userId)) {
      throw new Meteor.Error(403, "Nice try wise-guy.");
    }
    return Meteor.users.update(_id, {$set: obj});
  },
  adminUserCreateProfile: function(obj) {
    var _id, opts;
    if (!serverShared.isStaffOrHigher(this.userId)) {
      throw new Meteor.Error(403, "Nice try wise-guy.");
    }
    obj.emails[0].address = obj.emails[0].address.trim();
    opts = {email: obj.emails[0].address};
    _id = Accounts.createUser(opts);
    Meteor.users.update(_id, {$set: obj});
    return Accounts.sendEnrollmentEmail(_id);
  },
  adminUserResetPassword: function(_id) {
    if (!serverShared.isStaffOrHigher(this.userId)) {
      throw new Meteor.Error(403, "Nice try wise-guy.");
    }
    return Accounts.sendResetPasswordEmail(_id);
  },
  adminToggleQAd: function(_id, model) {
    var collection, obj, qad, timestamp, updates;
    if (!serverShared.isStaffOrHigher(this.userId)) {
      throw new Meteor.Error(403, "Nice try wise-guy.");
    }
    collection = (function() {
      switch (model) {
        case "epiDescriptive":
          return EpiDescriptive;
        case "epiResult":
          return EpiResult;
        case "mechanisticEvidence":
          return MechanisticEvidence;
        case "exposureEvidence":
          return ExposureEvidence;
        case "animalEvidence":
          return AnimalEvidence;
        case "animalEndpointEvidence":
          return AnimalEndpointEvidence;
        case "genotoxEvidence":
          return GenotoxEvidence;
        default:
          return void 0;
      }
    })();
    if (collection) {
      obj = collection.findOne(_id);
      if (obj) {
        qad = obj.isQA;
        if (qad) {
          updates = {
            isQA: false,
            timestampQA: null,
            user_id_QA: null
          };
        } else {
          timestamp = new Date();
          updates = {
            isQA: true,
            timestampQA: timestamp,
            user_id_QA: this.userId
          };
        }
        collection.update(_id, {$set: updates});
        return {success: true, QAd: !qad};
      }
    }
    return {success: false};
  },
  adminSetPassword: function(_id, passwd) {
    if (!serverShared.isStaffOrHigher(this.userId)) {
      throw new Meteor.Error(403, "Nice try wise-guy.");
    }
    try {
      Accounts.setPassword(_id, passwd);
      return {success: true};
    } catch (_error) {
      return {success: false};
    }
  },
  searchUsers: function(str) {
    var query, querystr;
    check(str, String);
    querystr = new RegExp(str, "i");
    query = {
      $or: [
        {"emails": {$elemMatch: {"address": {$regex: querystr}}}},
        {"profile.fullName": {$regex: querystr}},
        {"profile.affiliation": {$regex: querystr}}
      ]
    };
    return Meteor.users.find(query, {fields: {_id: 1, emails: 1, profile: 1}, limit: 20}).fetch();
  },
  searchReference: function(inputs) {
    var options, query, querystr;
    check(inputs, {qry: String, monographAgent: String});
    querystr = new RegExp(inputs.qry, "i");
    query = {
      $and: [{
          name: {$regex: querystr},
          monographAgent: {$in: [inputs.monographAgent]}
        }]
    };
    options = {limit: 50};
    return Reference.find(query, options).fetch();
  },
  searchOrganSite: function(query) {
    return singleFieldTextSearch(EpiResult, "organSite", query);
  },
  searchEffectUnits: function(query) {
    return singleFieldTextSearch(EpiResult, "effectUnits", query);
  },
  searchEffectMeasure: function(query) {
    return singleFieldTextSearch(EpiResult, "effectMeasure", query);
  },
  searchMonographAgent: function(query) {
    return singleFieldTextSearch(Tables, "monographAgent", query);
  },
  searchCovariates: function(query) {
    var covariates, queryset, querystr;
    check(query, String);
    querystr = new RegExp(query, "i");
    queryset = EpiResult.find({
      "covariates": {$in: [querystr]}},
      {fields: {covariates: 1},
      limit: 1000
    }).fetch();
    covariates = _.flatten(_.pluck(queryset, 'covariates'));
    covariates = _.filter(covariates, function(v) {
      return v.match(querystr);
    });
    return _.uniq(covariates, false);
  },
  searchCoexposures: function(query) {
    var coexposures, queryset, querystr;
    check(query, String);
    querystr = new RegExp(query, "i");
    queryset = EpiDescriptive.find(
      {"coexposures": {$in: [querystr]}},
      {fields: {coexposures: 1},
      limit: 1000
    }).fetch();
    coexposures = _.flatten(_.pluck(queryset, 'coexposures'));
    coexposures = _.filter(coexposures, function(v) {
      return v.match(querystr);
    });
    return _.uniq(coexposures, false);
  },
  searchPrintCaption: function(query, tbl_id) {
    return singleFieldTextSearch(EpiResult, "printCaption", query, tbl_id);
  },
  searchCountries: function(query) {
    return singleFieldTextSearch(ExposureEvidence, "country", query);
  },
  searchAgents: function(query) {
    return singleFieldTextSearch(ExposureEvidence, "agent", query);
  },
  searchSamplingMatrices: function(query) {
    return singleFieldTextSearch(ExposureEvidence, "samplingMatrix", query);
  },
  searchUnits: function(query) {
    var extra, vals;
    vals = singleFieldTextSearch(ExposureEvidence, "units", query);
    if (query[0] === "u") {
      extra = singleFieldTextSearch(ExposureEvidence, "units", query.replace("u", "μ"));
      vals = _.union(extra, vals);
    }
    if (query[0] === "p") {
      extra = singleFieldTextSearch(ExposureEvidence, "units", query.replace("p", "ρ"));
      vals = _.union(extra, vals);
    }
    return vals;
  },
  searchGenotoxAgents: function(query) {
    return singleFieldTextSearch(GenotoxEvidence, "agent", query);
  },
  searchGenotoxTestSystem: function(query) {
    return singleFieldTextSearch(GenotoxEvidence, "testSystem", query);
  },
  searchSpeciesNonMamm: function(query) {
    return singleFieldTextSearch(GenotoxEvidence, "speciesNonMamm", query);
  },
  searchStrainNonMamm: function(query) {
    return singleFieldTextSearch(GenotoxEvidence, "strainNonMamm", query);
  },
  searchSpeciesMamm: function(query) {
    return singleFieldTextSearch(GenotoxEvidence, "speciesMamm", query);
  },
  searchGenotoxSpecies: function(query) {
    return singleFieldTextSearch(GenotoxEvidence, "species", query);
  },
  searchGenotoxStrain: function(query) {
    return singleFieldTextSearch(GenotoxEvidence, "strain", query);
  },
  searchTissueCellLine: function(query) {
    return singleFieldTextSearch(GenotoxEvidence, "tissueCellLine", query);
  },
  searchGenotoxTissueAnimal: function(query) {
    return singleFieldTextSearch(GenotoxEvidence, "tissueAnimal", query);
  },
  searchGenotoxTissueHuman: function(query) {
    return singleFieldTextSearch(GenotoxEvidence, "tissueHuman", query);
  },
  searchGenotoxCellType: function(query) {
    return singleFieldTextSearch(GenotoxEvidence, "cellType", query);
  },
  searchGenotoxDosingRoute: function(query) {
    return singleFieldTextSearch(GenotoxEvidence, "dosingRoute", query);
  },
  searchGenotoxDosingUnits: function(query) {
    var extra, vals;
    vals = singleFieldTextSearch(GenotoxEvidence, "units", query);
    if (query[0] === "u") {
      extra = singleFieldTextSearch(GenotoxEvidence, "units", query.replace("u", "μ"));
      vals = _.union(extra, vals);
    }
    if (query[0] === "p") {
      extra = singleFieldTextSearch(GenotoxEvidence, "units", query.replace("p", "ρ"));
      vals = _.union(extra, vals);
    }
    return vals;
  },
  searchAnimalSpecies: function(query) {
    return singleFieldTextSearch(AnimalEvidence, "species", query);
  },
  searchAnimalStrain: function(query) {
    return singleFieldTextSearch(AnimalEvidence, "strain", query);
  },
  searchAnimalAgent: function(query) {
    return singleFieldTextSearch(AnimalEvidence, "agent", query);
  },
  searchAnimalPurity: function(query) {
    return singleFieldTextSearch(AnimalEvidence, "purity", query);
  },
  searchAnimalVehicle: function(query) {
    return singleFieldTextSearch(AnimalEvidence, "vehicle", query);
  },
  searchAnimalDosingRoute: function(query) {
    return singleFieldTextSearch(AnimalEvidence, "dosingRoute", query);
  },
  searchAnimalStrengths: function(query) {
    return singleFieldTextSearch(AnimalEvidence, "strengths", query);
  },
  searchAnimalLimitations: function(query) {
    return singleFieldTextSearch(AnimalEvidence, "limitations", query);
  },
  searchAnimalTumourSite: function(query) {
    return singleFieldTextSearch(AnimalEndpointEvidence, "tumourSite", query);
  },
  searchAnimalHistology: function(query) {
    return singleFieldTextSearch(AnimalEndpointEvidence, "histology", query);
  },
  searchAnimalUnits: function(query) {
    var extra, vals;
    vals = singleFieldTextSearch(AnimalEndpointEvidence, "units", query);
    if (query[0] === "u") {
      extra = singleFieldTextSearch(AnimalEndpointEvidence, "units", query.replace("u", "μ"));
      vals = _.union(extra, vals);
    }
    if (query[0] === "p") {
      extra = singleFieldTextSearch(AnimalEndpointEvidence, "units", query.replace("p", "ρ"));
      vals = _.union(extra, vals);
    }
    return vals;
  }
});
