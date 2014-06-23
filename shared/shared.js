Tables = new Meteor.Collection('tables');
EpiCohort = new Meteor.Collection('epiCohort');
EpiCaseControl = new Meteor.Collection('epiCaseControl');
EpiRiskEstimate = new Meteor.Collection('epiRiskEstimate');
Reference = new Meteor.Collection('reference');

tblTypeOptions = ["Epidemiology - Cohort", "Epidemiology - Case Control"];
referenceTypeOptions = ["PubMed", "Other"];
