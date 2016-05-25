import { SimpleSchema } from 'meteor/aldeed:simple-schema';


export default {
    organSite: {
        label: 'Organ site details',
        type: String,
        popoverText: 'Optional to further specify details, e.g ICD code, subtype',
        typeaheadMethod: 'searchNtpOrganSite',
    },
    parent_id: {
        type: SimpleSchema.RegEx.Id,
        denyUpdate: true,
    },
};
