var instanceMethods = {};
GenotoxEvidence = new Meteor.Collection('genotoxEvidence', {
  transform: function (doc) {
    return  _.extend(Object.create(instanceMethods), doc);
  }
});


// collection class methods/attributes
_.extend(GenotoxEvidence, {
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
    ],
    tabular: function(tbl_id) {
        var data, header, i, len, reference, row, v, vals;
        vals = GenotoxEvidence.find({tbl_id: tbl_id}, {sort: {sortIdx: 1}}).fetch();
        header = ["Genotoxicity ID", "Reference", "Data class", "Agent", "Plylogenetic class", "Test system", "Non-mammalian species", "Non-mammalian strain", "Mammalian species", "Mammalian strain", "Tissue/Cell line", "Species", "Strain", "Sex", "Tissue, animal", "Tissue, human", "Cell type", "Exposure description", "Endpoint", "Endpoint test", "Dosing route", "Dosing duration", "Dosing regime", "Doses tested", "Units", "Dual results?", "Result", "Result, metabolic activation", "Result, no metabolic activation", "LED/HID", "Significance", "Comments"];
        data = [header];
        for (i = 0, len = vals.length; i < len; i++) {
            v = vals[i];
            reference = Reference.findOne({_id: v.referenceID}).name;
            row = [v._id, reference, v.dataClass, v.agent, v.phylogeneticClass, v.testSystem, v.speciesNonMamm, v.strainNonMamm, v.testSpeciesMamm, v.speciesMamm, v.tissueCellLine, v.species, v.strain, v.sex, v.tissueAnimal, v.tissueHuman, v.cellType, v.exposureDescription, v.endpoint, v.endpointTest, v.dosingRoute, v.dosingDuration, v.dosingRegimen, v.dosesTested, v.units, v.dualResult, v.result, v.led, v.resultMetabolic, v.resultNoMetabolic, v.significance, v.comments];
            data.push(row);
        }
        return data;
    },
    testCrosswalk: {
        "Non-mammalian": {
            "Acellular systems": {
                "Genotox": {
                    "DNA damage": ["DNA adducts", "DNA strand breaks", "DNA cross-links", "Intercalation", "Other"]
                }
            },
            "Prokaryote (bacteria)": {
                "Genotox": {
                    "DNA damage": ["DNA strand breaks", "DNA cross-links", "Other"],
                    "Mutation": ["Reverse mutation", "Forward mutation", "Other"],
                    "DNA repair": ["Other"]
                }
            },
            "Lower eukaryote (yeast, mold)": {
                "Genotox": {
                    "DNA damage": ["DNA strand breaks", "DNA cross-links", "Other"],
                    "Mutation": ["Reverse mutation", "Forward mutation", "Gene conversion", "Other"],
                    "Chromosomal damage": ["Chromosomal aberrations", "Aneuploidy", "Other"]
                }
            },
            "Insect": {
                "Genotox": {
                    "Mutation": ["Somatic mutation and recombination test (SMART)", "Sex-linked recessive lethal mutations", "Heritable translocation test", "Dominant lethal test", "Other"],
                    "Chromosomal damage": ["Aneuploidy", "Other"],
                    "DNA repair": ["Other"]
                }
            },
            "Plant systems": {
                "Genotox": {
                    "DNA damage": ["Unscheduled DNA synthesis", "Other"],
                    "Chromosomal damage": ["Chromosomal aberrations", "Micronuclei", "Sister Chromatid Exchange", "Aneuploidy", "Other"],
                    "Mutation": ["Reverse mutation", "Forward mutation", "Gene conversion", "Other"]
                }
            },
            "Other (fish, worm, bird, etc)": {
                "Genotox": {
                    "DNA damage": ["DNA adducts", "DNA strand breaks", "DNA cross-links", "DNA oxidation", "Unscheduled DNA synthesis", "Other"],
                    "Mutation": ["Oncogene", "Tumour suppressor", "Other"],
                    "Chromosomal damage": ["Chromosomal aberrations", "Micronuclei", "Sister Chromatid Exchange", "Aneuploidy", "Other"],
                    "DNA repair": ["Other"]
                }
            }
        },
        "Mammalian and human in vitro": {
            "Human": {
                "Genotox": {
                    "DNA damage": ["DNA adducts", "DNA strand breaks", "DNA cross-links", "DNA oxidation", "Unscheduled DNA synthesis", "Other"],
                    "Mutation": ["Oncogene", "Tumour suppressor", "Other"],
                    "Chromosomal damage": ["Chromosomal aberrations", "Micronuclei", "Sister Chromatid Exchange", "Aneuploidy", "Other"],
                    "DNA repair": ["Other"],
                    "Cell transformation": ["Other"]
                }
            },
            "Non-human mammalian": {
                "Genotox": {
                    "DNA damage": ["DNA adducts ", "DNA strand breaks", "DNA cross-links", "DNA oxidation", "Unscheduled DNA synthesis", "Other"],
                    "Mutation": ["tk", "hprt ", "ouabain resistance", "Other gene", "Chromosomal damage", "Chromosomal aberrations", "Micronuclei", "Sister Chromatid Exchange", "Aneuploidy", "Other"],
                    "Chromosomal damage": ["Chromosomal aberrations", "Micronuclei", "Sister Chromatid Exchange", "Aneuploidy", "Other"],
                    "DNA repair": ["Other"],
                    "Cell transformation": ["Other"]
                }
            }
        },
        "Animal in vivo": {
            "Genotox": {
                "DNA damage": ["DNA adducts", "DNA strand breaks", "DNA cross-links", "DNA oxidation", "Unscheduled DNA synthesis", "Other"],
                "Mutation": ["Mouse spot test", "Mouse specific locus test", "Dominant lethal test", "Transgenic animal tests ", "Other"],
                "Chromosomal damage": ["Chromosomal aberrations", "Micronuclei", "Sister Chromatid Exchange", "Aneuploidy", "Other"],
                "DNA repair": ["Other"]
            }
        },
        "Human in vivo": {
            "Genotox": {
                "DNA damage": ["DNA adducts", "DNA strand breaks", "DNA cross-links", "DNA oxidation", "Unscheduled DNA synthesis", "Other"],
                "Mutation": ["Oncogene", "Tumour suppressor", "Other"],
                "Chromosomal damage": ["Chromosomal aberrations", "Micronuclei", "Sister Chromatid Exchange", "Aneuploidy", "Other"],
                "DNA repair": ["Other"]
            }
        }
    },
    isGenotoxAcellular: function(dataClass, phylogeneticClass) {
        var dcls = "Non-mammalian",
            acell = "Acellular systems";
        return (dataClass === dcls) && (phylogeneticClass === acell);
    },
    getTestSystemDesc: function(d) {
        var txt;
        switch (d.dataClass) {
            case "Non-mammalian":
                if (GenotoxEvidence.isGenotoxAcellular(d.dataClass, d.phylogeneticClass)) {
                    txt = d.phylogeneticClass + "<br>" + d.testSystem;
                } else {
                    txt = d.phylogeneticClass + "<br>" + d.speciesNonMamm + "&nbsp;" + d.strainNonMamm;
                }
                break;
            case "Mammalian and human in vitro":
                txt = d.speciesMamm + "<br>" + d.tissueCellLine;
                break;
            case "Animal in vivo":
                txt = d.species + "&nbsp;" + d.strain + "&nbsp;" + d.sex + "<br>" + d.tissueAnimal;
                txt += "<br>" + d.dosingRoute + ";&nbsp;" + d.dosingDuration + ";&nbsp;" + d.dosingRegimen;
                break;
            case "Human in vivo":
                txt = d.tissueHuman + ", " + d.cellType + "<br>" + d.exposureDescription;
                break;
            default:
                console.log("unknown data-type: {#d.dataClass}");
        }
        return txt;
    },
    setNonMammalianExperimentText: function(d) {
        var txt = "" + d.agent;
        if ((d.led != null) && d.led !== "") txt += "\n" + d.led;
        txt += " " + d.units;
        if (d.dosesTested != null) txt += "\n[" + d.dosesTested + " " + d.units + "]";
        if (d.dosingDuration != null) txt += "\n" + d.dosingDuration;
        return txt;
    },
    setWordFields: function(d) {
        d.comments = d.comments || "";
        d.led = d.led || "";
        d.significance = d.significance || "";
        switch (d.dataClass) {
            case "Non-mammalian":
                if (GenotoxEvidence.isGenotoxAcellular(d.dataClass, d.phylogeneticClass)) {
                    d._testSystem = d.testSystem;
                } else {
                    d._testSystem = d.speciesNonMamm + " " + d.strainNonMamm;
                }
                d._experimental = GenotoxEvidence.setNonMammalianExperimentText(d);
                break;
            case "Mammalian and human in vitro":
                d.colA = d.testSpeciesMamm === "Human" ? d.testSpeciesMamm : d.speciesMamm;
        }

        if (d.dualResult) {
            d.resultA = d.resultNoMetabolic;
            d.resultB = d.resultMetabolic;
        } else {
            d.resultA = d.result;
            if (d.dataClass.indexOf('vitro') >= 0 || d.dataClass.indexOf('Non-mammalian') >= 0) {
                d.resultB = "";
            } else {
                d.resultB = "NA";
            }
        }
    }
});


var reqNonMamm = function() {
        var isRequired = (this.field('dataClass').value === "Non-mammalian") &&
                (this.value === "");
        if (isRequired) return "required";
    },
    reqAcellular = function() {
        var isRequired = (this.field('dataClass').value === "Non-mammalian") &&
                (this.field('phylogeneticClass').value === "Acellular systems") &&
                (this.value === "");
        if (isRequired) return "required";
    },
    reqNotAcellular = function() {
        var isRequired = (this.field('dataClass').value === "Non-mammalian") &&
                (this.field('phylogeneticClass').value !== "Acellular systems") &&
                (this.value === "");
        if (isRequired) return "required";
    },
    reqMammVitro = function() {
        var isRequired = (this.field('dataClass').value === "Mammalian and human in vitro") &&
                (this.value === "");
        if (isRequired) return "required";
    },
    reqAniVivo = function() {
        var isRequired = (this.field('dataClass').value === "Animal in vivo") &&
                (this.value === "");
        if (isRequired) return "required";
    },
    reqHumanVivo = function() {
        var isRequired = (this.field('dataClass').value === "Human in vivo") &&
                (this.value === "");
        if (isRequired) return "required";
    },
    reqExpVivo = function() {
        var isRequired = ((this.field('dataClass').value === "Animal in vivo") ||
                          (this.field('dataClass').value === "Non-mammalian" &&
                           this.field('phylogeneticClass').value === "Other (fish, worm, bird, etc)")) &&
                (this.value === "");
        if (isRequired) return "required";
    };

tblBuilderSchema.attachSchema(GenotoxEvidence, _.extend({
    // first row
    referenceID: {
        label: "Reference",
        type: SimpleSchema.RegEx.Id
    },
    dataClass: {
        label: "Data class",
        type: String,
        allowedValues: GenotoxEvidence.dataClass
    },
    agent: {
        label: "Agent",
        type: String,
        min: 1
    },

    // second row
    phylogeneticClass: {
        label: "Data class",
        type: String,
        allowedValues: GenotoxEvidence.phylogeneticClasses,
        optional: true,
        custom: reqNonMamm
    },
    testSystem: {
        label: "Test system",
        type: String,
        optional: true,
        custom: reqAcellular
    },
    speciesNonMamm: {
        label: "Species",
        type: String,
        optional: true,
        custom: reqNotAcellular
    },
    strainNonMamm: {
        label: "Strain",
        type: String,
        optional: true,
        custom: reqNotAcellular
    },
    testSpeciesMamm: {
        label: "Test species class",
        type: String,
        allowedValues: GenotoxEvidence.mammalianTestSpecies,
        optional: true,
        custom: reqMammVitro
    },
    speciesMamm: {
        label: "Species",
        type: String,
        optional: true,
        custom: reqMammVitro
    },
    tissueCellLine: {
        label: "Tissue, cell-line",
        type: String,
        optional: true,
        custom: reqMammVitro
    },
    species: {
        label: "Species",
        type: String,
        optional: true,
        custom: reqAniVivo
    },
    strain: {
        label: "Strain",
        type: String,
        optional: true,
        custom: reqAniVivo
    },
    sex: {
        label: "Sex",
        type: String,
        allowedValues: GenotoxEvidence.sexes,
        optional: true,
        custom: reqAniVivo
    },
    tissueAnimal: {
        label: "Tissue",
        type: String,
        optional: true,
        custom: reqAniVivo
    },
    tissueHuman: {
        label: "Tissue",
        type: String,
        optional: true,
        custom: reqHumanVivo
    },
    cellType: {
        label: "Cell type",
        type: String,
        optional: true
    },
    exposureDescription: {
        label: "Description of exposed and controls",
        type: String,
        optional: true,
        custom: reqHumanVivo
    },

    // third row
    endpoint: {
        label: "Endpoint",
        type: String,
        min: 1
    },
    endpointTest: {
        label: "Endpoint test",
        type: String,
        min: 1
    },
    dualResult: {
        label: "Dual result",
        type: Boolean,
        defaultValue: false
    },
    dosingDuration: {
        label: "Duration",
        type: String,
        optional: true,
        custom: reqExpVivo
    },
    dosingRoute: {
        label: "Route",
        type: String,
        optional: true,
        custom: reqAniVivo
    },
    dosingRegimen: {
        label: "Dosing regimen",
        type: String,
        optional: true,
        custom: reqAniVivo
    },

    // fourth row
    result: {
        label: "Result",
        type: String,
        allowedValues: GenotoxEvidence.resultOptions
    },
    led: {
        label: "LED or HID",
        type: String,
        optional: true
    },
    units: {
        label: "Dosing units",
        type: String,
        min: 1
    },
    resultMetabolic: {
        label: "Result (no metabolic activation)",
        type: String,
        allowedValues: GenotoxEvidence.resultOptions
    },
    resultNoMetabolic: {
        label: "Result (no metabolic activation)",
        type: String,
        allowedValues: GenotoxEvidence.resultOptions
    },
    dosesTested: {
        label: "Doses tested",
        type: String,
        optional: true,
        custom: reqExpVivo
    },
    significance: {
        label: "Significance",
        type: String,
        optional: true
    },

    // fifth row
    comments: {
        label: "Comments",
        type: String,
        optional: true
    }
}, tblBuilderSchema.base, tblBuilderSchema.table));
