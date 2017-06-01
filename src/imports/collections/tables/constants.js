import { Meteor } from 'meteor/meteor';

import {isNtp} from '/imports/utilities'

var getTableTypes = function(){
    if (isNtp()){
        return [
            'Exposure Evidence',
            'NTP Epidemiology Evidence',
            'NTP Animal Bioassay Evidence',
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
        'NTP Animal Bioassay Evidence': 'ntpAnimalMain',
        'Genetic and Related Effects': 'genotoxMain',
    },
    unstartedStatuses = ['unknown', 'not started'],
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
export { unstartedStatuses };
export { statusOptions };
