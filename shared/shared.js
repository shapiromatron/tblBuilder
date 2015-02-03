Tables = new Meteor.Collection('tables');
Reference = new Meteor.Collection('reference');
MechanisticEvidence = new Meteor.Collection('mechanisticEvidence');
ExposureEvidence = new Meteor.Collection('exposureEvidence');
AnimalEvidence = new Meteor.Collection('animalEvidence');
AnimalEndpointEvidence = new Meteor.Collection('animalEndpointEvidence');
GenotoxEvidence = new Meteor.Collection('genotoxEvidence');
EpiDescriptive = new Meteor.Collection('epiDescriptive');
EpiResult = new Meteor.Collection('epiResult');
ReportTemplate = new Meteor.Collection('reportTemplate');

// Project-level shared-options
tblRoleOptions = ["projectManagers", "teamMembers", "reviewers"];
browserWhitelist = ["Chrome", "Firefox", "Mozilla"];

tblTypeOptions = [
    "Exposure Evidence",
    "Epidemiology Evidence",
    "Animal Bioassay Evidence",
    "Genetic and Related Effects",
    "Mechanistic Evidence Summary",
];


// Reference shared-options
referenceTypeOptions = ["PubMed", "Other"];


// Exposure evidence shared options
exposureScenarios = [
    "Occupational",
    "Environmental",
    "Integrated/mixed"
];

exposureScenariosOccupational = [
    "Occupational"
];

samplingApproaches = [
    "Personal",
    "Environmental",
    "Biological",
    "Other",
    "Not-specified"
];

exposureLevelDescriptions = [
    "Arithmetic mean",
    "Geometric mean",
    "Median",
    "Other",
    "Not-reported"
];


// Epidemiology evidence shared options
epiStudyDesignOptions = [
    "Cohort",
    "Nested Case-Control",
    "Case-Control",
    "Ecological"
];

CaseControlTypes = [
    "Case-Control",
    "Nested Case-Control"
];

exposureAssessmentTypeOptions = [
    "JEM",
    "questionnaire",
    "company records",
    "personal monitoring",
    "environmental monitoring",
    "modelling",
    "expert assessment",
    "other (specify in exposure assessment notes)"
];


// Mechanistic evidence shared options
mechanisticEvidenceSections = [
    {section: "toxicokinetics",     sectionDesc: "Toxicokinetics"},
    {section: "characteristics",    sectionDesc: "Key characteristics"},
    {section: "targetSites",        sectionDesc: "Toxicity confirming target tissue/site"},
    {section: "susceptibility",     sectionDesc: "Susceptibility"},
    {section: "other",              sectionDesc: "Additional relevant data"}
];

mechanisticEvidenceCategories = [
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
];

mechanisticEvidenceOptions = [
    "++",
    "+",
    "+/-",
    "-",
    "I"
];

// Genotoxicity shared-classes
genotoxDataClass = [
    "Non-mammalian",
    "Mammalian and human in vitro",
    "Animal in vivo",
    "Human in vivo"
];

phylogeneticClasses = [
    "Acellular systems",
    "Prokaryote (bacteria)",
    "Lower eukaryote (yeast, mold)",
    "Insect",
    "Plant systems",
    "Other (fish, worm, bird, etc)"
];

mammalianTestSpecies = [
    "Human",
    "Non-human mammalian"
];

sexes = [
    "Male",
    "Female",
    "Male and female"
];

genotoxResultOptions = [
    " + ",
    "(+)",
    "+/-",
    "(-)",
    " - ",
    "Not tested"
];


// animal-evidence -options
animalStudyDesigns = [
    "Full carcinogenicity",
    "Initiation-promotion (tested as initiator)",
    "Initiation-promotion (tested as promoter)",
    "Co-carcinogenicity",
    "Carcinogenicity with other modifying factor"
];

animalSexes = [
    "M",
    "F",
    "M+F (combined)",
    "NR"
];
