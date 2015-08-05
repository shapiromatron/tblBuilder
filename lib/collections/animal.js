var aniClsMethods = {
        studyDesigns: [
            "Full carcinogenicity",
            "Initiation-promotion (tested as initiator)",
            "Initiation-promotion (tested as promoter)",
            "Co-carcinogenicity",
            "Carcinogenicity with other modifying factor"
        ],
        sexes: [
            "M",
            "F",
            "M+F (combined)",
            "NR"
        ]
    },
    aniInstanceMethods = {},
    endpointClsMethods = {},
    endpointInstanceMethods = {};


AnimalEvidence = new Meteor.Collection('animalEvidence', {
  transform: function (doc) {
    return  _.extend(Object.create(aniInstanceMethods), doc);
  }
});
_.extend(AnimalEvidence, aniClsMethods);


AnimalEndpointEvidence = new Meteor.Collection('animalEndpointEvidence', {
  transform: function (doc) {
    return  _.extend(Object.create(endpointInstanceMethods), doc);
  }
});
_.extend(AnimalEndpointEvidence, endpointClsMethods);
