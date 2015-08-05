var clsMethods = {
        dataClass: [
            "Non-mammalian",
            "Mammalian and human in vitro",
            "Animal in vivo",
            "Human in vivo"
        ],
        phylogeneticClasses: [
            "Acellular systems",
            "Prokaryote (bacteria)",
            "Lower eukaryote (yeast, mold)",
            "Insect",
            "Plant systems",
            "Other (fish, worm, bird, etc)"
        ],
        mammalianTestSpecies: [
            "Human",
            "Non-human mammalian"
        ],
        sexes: [
            "Male",
            "Female",
            "Male and female"
        ],
        resultOptions: [
            " + ",
            "(+)",
            "+/-",
            "(-)",
            " - ",
            "Not tested"
        ]
    },
    instanceMethods = {};


GenotoxEvidence = new Meteor.Collection('genotoxEvidence', {
  transform: function (doc) {
    return  _.extend(Object.create(instanceMethods), doc);
  }
});
_.extend(GenotoxEvidence, clsMethods);

