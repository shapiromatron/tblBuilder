var epiClsMethods = {
        studyDesignOptions: [
            "Cohort",
            "Nested Case-Control",
            "Case-Control",
            "Ecological"
        ],
        exposureAssessmentTypeOptions: [
            "JEM",
            "questionnaire",
            "company records",
            "food frequency questionnaire",
            "personal monitoring",
            "environmental monitoring",
            "modelling",
            "expert assessment",
            "other (specify in exposure assessment notes)"
        ],
        isCaseControl: function(val){
            var list = ["Case-Control", "Nested Case-Control"];
            return _.contains(list, val);
        }
    },
    epiInstanceMethods = {
        isCaseControl: function(){
            return EpiDescriptive.isCaseControl(this.studyDesign);
        }
    },
    resClsMethods = {},
    resInstanceMethods = {};


EpiDescriptive = new Meteor.Collection('epiDescriptive', {
  transform: function (doc) {
    return  _.extend(Object.create(epiInstanceMethods), doc);
  }
});
_.extend(EpiDescriptive, epiClsMethods);


EpiResult = new Meteor.Collection('epiResult', {
  transform: function (doc) {
    return  _.extend(Object.create(resInstanceMethods), doc);
  }
});
_.extend(EpiResult, resClsMethods);
