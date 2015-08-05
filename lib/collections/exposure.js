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
