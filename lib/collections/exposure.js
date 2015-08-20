var instanceMethods = {
    isOccupational: function(){
        return ExposureEvidence.isOccupational(this.exposureScenario);
    }
};
ExposureEvidence = new Meteor.Collection('exposureEvidence', {
  transform: function (doc) {
    return  _.extend(Object.create(instanceMethods), doc);
  }
});


// collection class methods/attributes
_.extend(ExposureEvidence, {
    exposureScenarios: [
        "Occupational",
        "Environmental",
        "Integrated/mixed"
    ],
    samplingApproaches: [
        "Personal",
        "Environmental",
        "Biological",
        "Other",
        "Not-specified"
    ],
    exposureLevelDescriptions: [
        "Arithmetic mean",
        "Geometric mean",
        "Median",
        "Other",
        "Not-reported"
    ],
    isOccupational: function(val){
        var list = ["Occupational"];
        return _.contains(list, val);
    },
    tabular: function(tbl_id) {
        var data, header, i, len, reference, row, v, vals;
        vals = ExposureEvidence.find({tbl_id: tbl_id}, {sort: {sortIdx: 1}}).fetch();
        header = ["Exposure ID", "Reference", "Exposure scenario", "Collection date", "Occupation", "Occupational information", "Country", "Location", "Agent", "Sampling Matrix", "Sampling Approach", "Number of measurements", "Measurement duration", "Exposure level", "Exposure level description", "Exposure level range", "Units", "Comments"];
        data = [header];
        for (i = 0, len = vals.length; i < len; i++) {
            v = vals[i];
            reference = Reference.findOne({_id: v.referenceID}).name;
            row = [v._id, reference, v.exposureScenario, v.collectionDate, v.occupation, v.occupationInfo, v.country, v.location, v.agent, v.samplingMatrix, v.samplingApproach, v.numberMeasurements, v.measurementDuration, v.exposureLevel, v.exposureLevelDescription, v.exposureLevelRange, v.units, v.comments];
            data.push(row);
        }
        return data;
    },
    reportContext: function(tbl_id) {
        var tbl = Tables.findOne(tbl_id),
            exposures = ExposureEvidence.find(
                {tbl_id: tbl_id},
                {sort: {sortIdx: 1}}).fetch();
      exposures.forEach(function(exp){
        exp.reference = Reference.findOne({_id: exp.referenceID});
        ExposureEvidence.setWordFields(exp);
      });
      return {
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
    setWordFields: function(d) {
        d.location = d.location || "Not-reported";
        d.occupationInfo = d.occupationInfo || "";
        d.comments = d.comments || "";
    },
    wordReportFormats: [
        {
          "type": "ExposureTables",
          "fn": "exposure",
          "text": "Download Word"
        }
    ]
});


tblBuilderCollections.attachSchema(ExposureEvidence, _.extend({
    referenceID: {
        label: "Reference",
        type: SimpleSchema.RegEx.Id
    },
    exposureScenario: {
        label: "Exposure scenario",
        type: String,
        allowedValues: ExposureEvidence.exposureScenarios,
        popoverText: "Type of exposure-information collected",
    },
    collectionDate: {
        label: "Collection date",
        type: String,
        min: 1,
        popoverText: "Year(s) of data collection",
        placeholderText: "e.g. 2009-2011",
    },
    occupation: {
        label: "Industry or occupation",
        type: String,
        optional: true,
        custom: function() {
          var isRequired = (ExposureEvidence.isOccupational(this.field('exposureScenario').value)) && (this.value === "");
          if (isRequired) return "required";
        },
        popoverText: "Industry/occupation for occupational exposure",
        placeholderText: "e.g. Bitumen production",
        forceRequiredSymbol: true,
    },
    occupationInfo: {
        label: "Other occupational information",
        type: String,
        optional: true,
        popoverText: "Other information (e.g., job task, etc.) if important",
        placeholderText: "e.g. Tar distillation",
    },
    country: {
        label: "Country",
        type: String,
        min: 1,
        popoverText: "Country of exposure measurement",
        placeholderText: "e.g. France",
        typeaheadMethod: "searchCountries",
    },
    location: {
        label: "Other location information",
        type: String,
        optional: true,
        popoverText: "Other information (e.g., region, state, province, city) if important",
        placeholderText: "e.g. Montpellier",
    },
    agent: {
        label: "Agent",
        type: String,
        min: 1,
        popoverText: "The substance or exposure that was measured (e.g., PM-10, TCE, Total PCB)",
        typeaheadMethod: "searchAgents",
        placeholderText: "e.g. PM-10",
    },
    samplingMatrix: {
        label: "Sampling matrix",
        type: String,
        min: 1,
        popoverText: "The environmental medium or other matrix (e.g., air, drinking water, food, urine, blood) in which the agent was measured",
        typeaheadMethod: "searchSamplingMatrices",
        placeholderText: "e.g. air",
    },
    samplingApproach: {
        label: "Sampling approach",
        type: String,
        allowedValues: ExposureEvidence.samplingApproaches,
        popoverText: "Approach used to collect samples",
    },
    numberMeasurements: {
        label: "Number of measurements",
        type: String,
        min: 1,
        popoverText: "Typically the number of samples for environmental sampling, or the number of individuals sampled if personal sampling (if >1 measurement/person, give total measurements and explain in the comment-box)",
        placeholderText: "e.g. 3",
    },
    measurementDuration: {
        label: "Measurement duration",
        type: String,
        min: 1,
        popoverText: "Mean or range; NR if not reported; NA if not applicable",
        placeholderText: "e.g. NR",
    },
    exposureLevel: {
        label: "Mean or median exposure-level",
        type: String,
        min: 1,
        popoverText: "Quantitative level or NR if not reported. Geometric mean preferred if available.",
        placeholderText: "e.g. 12.35",
    },
    exposureLevelDescription: {
        label: "Description of exposure-level",
        type: String,
        allowedValues: ExposureEvidence.exposureLevelDescriptions,
        popoverText: "Statistic used to describe exposure-level",
    },
    exposureLevelRange: {
        label: "Range of exposure-level",
        type: String,
        min: 1,
        popoverText: "Minimum and maximum or NR if not reported. Optionally if range not reported the standard-deviation or other measure of variability relative to the mean. (e.g., 32.3-40.2, NR, 13.2 SD, 14.7 SE)",
        placeholderText: "e.g. 32.3-40.2",
    },
    units: {
        label: "Units",
        type: String,
        min: 1,
        popoverText: "Measurement units (e.g. µg/m³, g/m²)",
        placeholderText: "e.g. µg/m³",
        typeaheadMethod: "searchUnits",
    },
    comments: {
        label: "Additional information/comments",
        type: String,
        optional: true,
        popoverText: "Other relevant information or Working Group comments",
        textAreaRows: 2,
    }
}, tblBuilderCollections.base, tblBuilderCollections.table));
