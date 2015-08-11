var instanceMethods = {};
NtpEpiDescriptive = new Meteor.Collection('ntpEpiDescriptive', {
  transform: function (doc) {
    return  _.extend(Object.create(instanceMethods), doc);
  }
});


// collection class methods/attributes
_.extend(NtpEpiDescriptive, {
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
    ]
});

