import { Template } from 'meteor/templating';

import tblBuilderCollections from '/imports/api/shared';

// bind templates client-side only
tblBuilderCollections.evidenceLookup['epiDescriptive'].nested_template = Template.epiResultForm;
tblBuilderCollections.evidenceLookup['animalEvidence'].nested_template = Template.animalEndpointForm;
tblBuilderCollections.evidenceLookup['ntpEpiDescriptive'].nested_template = Template.ntpEpiResultForm;
