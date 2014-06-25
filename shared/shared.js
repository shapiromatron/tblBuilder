Tables = new Meteor.Collection('tables');
EpiCohort = new Meteor.Collection('epiCohort');
EpiCaseControl = new Meteor.Collection('epiCaseControl');
EpiRiskEstimate = new Meteor.Collection('epiRiskEstimate');
Reference = new Meteor.Collection('reference');
MechanisticEvidence = new Meteor.Collection('mechanisticEvidence');

tblTypeOptions = ["Epidemiology - Cohort",
                  "Epidemiology - Case Control",
                  "Mechanistic Evidence Summary"];

referenceTypeOptions = ["PubMed", "Other"];
