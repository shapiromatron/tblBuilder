var clsMethods = {
        evidenceSections: [
            {section: "toxicokinetics",     sectionDesc: "Toxicokinetics"},
            {section: "characteristics",    sectionDesc: "Key characteristics"},
            {section: "targetSites",        sectionDesc: "Toxicity confirming target tissue/site"},
            {section: "susceptibility",     sectionDesc: "Susceptibility"},
            {section: "other",              sectionDesc: "Additional relevant data"}
        ],
        evidenceCategories: [
            "Electrophilicity",
            "Genotoxicity",
            "Altered Repair Genomic Instability",
            "Chronic Inflamation Oxidative Stress",
            "Receptor Mediated",
            "Proliferation or Death",
            "Immunosupression",
            "Epigentic",
            "Immortalization",
            "Other"
        ],
        evidenceOptions: [
            "++",
            "+",
            "+/-",
            "-",
            "I"
        ]
    },
    instanceMethods = {};


MechanisticEvidence = new Meteor.Collection('mechanisticEvidence', {
  transform: function (doc) {
    return  _.extend(Object.create(instanceMethods), doc);
  }
});
_.extend(MechanisticEvidence, clsMethods);
