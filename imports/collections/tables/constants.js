import { Meteor } from 'meteor/meteor';


var getTableTypes = function(){
    if (Meteor.settings['public'].context === 'ntp'){
        return [
            'Exposure Evidence',
            'NTP Epidemiology Evidence',
            'Animal Bioassay Evidence',
            'Genetic and Related Effects',
            'Mechanistic Evidence Summary',
        ];
    } else {
        return [
            'Exposure Evidence',
            'Epidemiology Evidence',
            'Animal Bioassay Evidence',
            'Genetic and Related Effects',
            'Mechanistic Evidence Summary',
        ];
    }
};

let typeOptions = getTableTypes(),
    roleOptions = [
        'projectManagers',
        'teamMembers',
        'reviewers',
    ],
    routePaths = {
        'Mechanistic Evidence Summary': 'mechanisticMain',
        'Epidemiology Evidence': 'epiMain',
        'NTP Epidemiology Evidence': 'ntpEpiMain',
        'Exposure Evidence': 'exposureMain',
        'Animal Bioassay Evidence': 'animalMain',
        'Genetic and Related Effects': 'genotoxMain',
    },
    statusOptions = {
        'unknown':     'statusUnknown',
        'not started': 'statusNotStarted',
        'in progress': 'statusInProgress',
        'complete':    'statusComplete',
        'QA ongoing':  'statusQAOngoing',
        'QA complete': 'statusQAComplete',
    };

export { typeOptions };
export { roleOptions };
export { routePaths };
export { statusOptions };
