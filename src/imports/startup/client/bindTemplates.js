import { Template } from 'meteor/templating';

import tblBuilderCollections from '/imports/collections';

// bind templates client-side only
tblBuilderCollections.evidenceLookup['exposureEvidence'].nested_template = Template.exposureResultForm;
tblBuilderCollections.evidenceLookup['epiDescriptive'].nested_template = Template.epiResultForm;
tblBuilderCollections.evidenceLookup['animalEvidence'].nested_template = Template.animalEndpointForm;
tblBuilderCollections.evidenceLookup['ntpEpiDescriptive'].nested_template = Template.ntpEpiResultForm;
tblBuilderCollections.evidenceLookup['ntpAnimalEvidence'].nested_template = Template.ntpAnimalEndpointEvidenceForm;
tblBuilderCollections.evidenceLookup['genotoxHumanExposureEvidence'].nested_template = Template.genotoxHumanExposureResultForm;
