var clsMethods = {
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
        }
    },
    instanceMethods = {
        isOccupational: function(){
            return ExposureEvidence.isOccupational(this.exposureScenario);
        }
    };


ExposureEvidence = new Meteor.Collection('exposureEvidence', {
  transform: function (doc) {
    return  _.extend(Object.create(instanceMethods), doc);
  }
});
_.extend(ExposureEvidence, clsMethods);


tblBuilderSchema.attachSchema(ExposureEvidence, _.extend({
    referenceID: {
        label: "Reference",
        type: SimpleSchema.RegEx.Id
    },
    exposureScenario: {
        label: "Exposure scenario",
        type: String,
        allowedValues: ExposureEvidence.exposureScenarios
    },
    collectionDate: {
        label: "Collection date",
        type: String,
        min: 1
    },
    occupation: {
        label: "Industry or occupation",
        type: String,
        optional: true,
        custom: function() {
          var isRequired = (ExposureEvidence.isOccupational(this.field('exposureScenario').value)) && (this.value === "");
          if (isRequired) return "required";
        }
    },
    occupationInfo: {
        label: "Other occupational information",
        type: String,
        optional: true
    },
    country: {
        label: "Country",
        type: String,
        min: 1
    },
    location: {
        label: "Other locational information",
        type: String,
        optional: true
    },
    agent: {
        label: "Agent",
        type: String,
        min: 1
    },
    samplingMatrix: {
        label: "Sampling matrix",
        type: String,
        min: 1
    },
    samplingApproach: {
        label: "Sampling approach",
        type: String,
        allowedValues: ExposureEvidence.samplingApproaches
    },
    numberMeasurements: {
        label: "Number of measurements",
        type: String,
        min: 1
    },
    measurementDuration: {
        label: "Measurement duration",
        type: String,
        min: 1
    },
    exposureLevel: {
        label: "Mean or median exposure-level",
        type: String,
        min: 1
    },
    exposureLevelDescription: {
        label: "Description of exposure-level",
        type: String,
        allowedValues: ExposureEvidence.exposureLevelDescriptions
    },
    exposureLevelRange: {
        label: "Range of exposure-level",
        type: String,
        min: 1
    },
    units: {
        label: "Units",
        type: String,
        min: 1
    },
    comments: {
        label: "Comments",
        type: String,
        optional: true
    }
}, tblBuilderSchema.base, tblBuilderSchema.table));
