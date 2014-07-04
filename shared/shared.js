Tables = new Meteor.Collection('tables');
EpiCohort = new Meteor.Collection('epiCohort');
EpiCaseControl = new Meteor.Collection('epiCaseControl');
EpiRiskEstimate = new Meteor.Collection('epiRiskEstimate');
Reference = new Meteor.Collection('reference');
MechanisticEvidence = new Meteor.Collection('mechanisticEvidence');
EpiDescriptive = new Meteor.Collection('epiDescriptive');
EpiResult = new Meteor.Collection('epiResult');

tblTypeOptions = ["Epidemiology - Cohort",
                  "Epidemiology - Case Control",
                  "Mechanistic Evidence Summary",
                  "Epidemiology Evidence"];

tblRoleOptions = ["projectManagers", "teamMembers", "reviewers"];

referenceTypeOptions = ["PubMed", "Other"];

epiStudyDesignOptions = ["Cohort", "Case-Control"];

mechanisticEvidenceSections = [
    {section: "toxicokinetics", sectionDesc: "Toxicokinetics"},
    {section: "mechanisms",     sectionDesc: "Major mechanisms"},
    {section: "targetSites",    sectionDesc: "Toxicity confirming target tissue/site"},
    {section: "susceptibility", sectionDesc: "Susceptibility"},
    {section: "other",          sectionDesc: "Additional relevant data"}
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
