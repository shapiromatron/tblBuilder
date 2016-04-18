import {Meteor} from 'meteor/meteor';
import { check } from 'meteor/check';

import _ from 'underscore';

import organSiteCategories from '/imports/organSiteCategories';

import Reference from '/imports/api/shared/reference';
import ExposureEvidence from '/imports/api/shared/exposure';
import AnimalEvidence from '/imports/api/shared/animalEvidence';
import AnimalEndpointEvidence from '/imports/api/shared/animalResult';
import EpiDescriptive from '/imports/api/shared/epiDescriptive';
import EpiResult from '/imports/api/shared/epiResult';
import NtpEpiDescriptive from '/imports/api/shared/ntpEpiDescriptive';
import NtpEpiResult from '/imports/api/shared/ntpEpiResult';
import GenotoxEvidence from '/imports/api/shared/genotox';


var textSearchRegex = function(str, opts){
        str = str.escapeRegex();
        if (opts && opts.atBeginning) str = '^' + str;
        return new RegExp(str, 'i');
    },
    singleFieldTextSearch = function(Collection, field, qrystr, tbl_id) {
        var options, query, queryset, values;
        check(qrystr, String);
        query = {};
        query[field] = {$regex: textSearchRegex(qrystr)};
        if (tbl_id != null) {query['tbl_id'] = tbl_id;}
        options = {fields: {}, limit: 1000, sort: []};
        options.fields[field] = 1;
        options.sort.push(field);
        queryset = Collection.find(query, options).fetch();
        values = _.pluck(queryset, field);
        return _.uniq(values, true);
    },
    listFieldTextSearch = function(Collection, field, qrystr) {
        var qs,
            regex,
            qry = {},
            opts = {fields: {}, limit: 1000};

        check(qrystr, String);
        regex = textSearchRegex(qrystr);
        qry[field] = {$in: [regex]};
        opts.fields[field] = 1;

        qs = Collection.find(qry, opts).fetch();
        return _.chain(qs)
                .pluck(field)
                .flatten()
                .uniq(false)
                .filter(function(v){return v.match(regex);})
                .value();
    },
    searchElementInArrayObj = function(Collection, array_field, pluck_field, qrystr){
        var qs,
            regex,
            qry = {},
            opts = {fields: {}, limit: 1000},
            field = array_field + '.' + pluck_field;

        check(qrystr, String);
        regex = textSearchRegex(qrystr, {'atBeginning': true});
        qry[field] = {$in: [regex]};
        opts.fields[field] = 1;
        qs = Collection.find(qry, opts).fetch();
        return _.chain(qs)
                .pluck(array_field)
                .flatten()
                .pluck(pluck_field)
                .flatten()
                .uniq(false)
                .filter(function(v){return v.match(regex);})
                .value();
    },
    extraUnitsSearch = function(Collection, query){
        var extra, vals;
        vals = singleFieldTextSearch(Collection, 'units', query);
        if (query[0] === 'u') {
            extra = singleFieldTextSearch(Collection, 'units', query.replace('u', 'μ'));
            vals = _.union(extra, vals);
        }
        if (query[0] === 'p') {
            extra = singleFieldTextSearch(Collection, 'units', query.replace('p', 'ρ'));
            vals = _.union(extra, vals);
        }
        return vals;
    };


Meteor.methods({
    searchUsers: function(str) {
        var query, querystr;
        check(str, String);
        querystr = textSearchRegex(str);
        query = {
            $or: [
                {'emails': {$elemMatch: {'address': {$regex: querystr}}}},
                {'profile.fullName': {$regex: querystr}},
                {'profile.affiliation': {$regex: querystr}},
            ],
        };
        return Meteor.users.find(query, {fields: {_id: 1, emails: 1, profile: 1}, limit: 20}).fetch();
    },
    searchReference: function(inputs) {
        var options, query, querystr, atBeginning;
        check(inputs, {qry: String, monographAgent: String});
        atBeginning = isNaN(parseInt(inputs.qry, 10));  // if text assume from start
        querystr = textSearchRegex(inputs.qry, {atBeginning: atBeginning});
        query = {
            $and: [{
                name: {$regex: querystr},
                monographAgent: {$in: [inputs.monographAgent]},
            }],
        };
        options = {limit: 50, sort: {name: 1}};
        return Reference.find(query, options).fetch();
    },
    searchOrganSiteCategories: function(query) {
        // cleanup query string
        check(query, String);
        query = query.toLocaleLowerCase().trim();

        // check matches
        let opts = _.filter(
            organSiteCategories.options,
            (d) => d.toLocaleLowerCase().indexOf(query) >= 0
        );

        // check synonyms
        let extra = _.chain(organSiteCategories.synonyms)
                     .keys()
                     .filter((d) => d.indexOf(query) >= 0)
                     .map((d) => organSiteCategories.synonyms[d])
                     .flatten()
                     .value();

        // merge matches and synonyms
        opts.push.apply(opts, extra);

        opts = _.uniq(opts);  // sorts during uniqueness algorithm

        return opts;
    },
    searchOrganSite: function(query) {
        return singleFieldTextSearch(EpiResult, 'organSite', query);
    },
    searchEffectUnits: function(query) {
        return singleFieldTextSearch(EpiResult, 'effectUnits', query);
    },
    searchEffectMeasure: function(query) {
        return singleFieldTextSearch(EpiResult, 'effectMeasure', query);
    },
    searchMonographAgent: function(query) {
        return singleFieldTextSearch(Tables, 'monographAgent', query);
    },
    searchCovariates: function(query) {
        return listFieldTextSearch(EpiResult, 'covariates', query);
    },
    searchCoexposures: function(query) {
        return listFieldTextSearch(EpiDescriptive, 'coexposures', query);
    },
    searchCountries: function(query) {
        return singleFieldTextSearch(ExposureEvidence, 'country', query);
    },
    searchAgents: function(query) {
        return singleFieldTextSearch(ExposureEvidence, 'agent', query);
    },
    searchSamplingMatrices: function(query) {
        return singleFieldTextSearch(ExposureEvidence, 'samplingMatrix', query);
    },
    searchUnits: function(query) {
        return extraUnitsSearch(ExposureEvidence, query);
    },
    searchGenotoxAgents: function(query) {
        return singleFieldTextSearch(GenotoxEvidence, 'agent', query);
    },
    searchGenotoxTestSystem: function(query) {
        return singleFieldTextSearch(GenotoxEvidence, 'testSystem', query);
    },
    searchSpeciesNonMamm: function(query) {
        return singleFieldTextSearch(GenotoxEvidence, 'speciesNonMamm', query);
    },
    searchStrainNonMamm: function(query) {
        return singleFieldTextSearch(GenotoxEvidence, 'strainNonMamm', query);
    },
    searchSpeciesMamm: function(query) {
        return singleFieldTextSearch(GenotoxEvidence, 'speciesMamm', query);
    },
    searchGenotoxSpecies: function(query) {
        return singleFieldTextSearch(GenotoxEvidence, 'species', query);
    },
    searchGenotoxStrain: function(query) {
        return singleFieldTextSearch(GenotoxEvidence, 'strain', query);
    },
    searchTissueCellLine: function(query) {
        return singleFieldTextSearch(GenotoxEvidence, 'tissueCellLine', query);
    },
    searchGenotoxTissueAnimal: function(query) {
        return singleFieldTextSearch(GenotoxEvidence, 'tissueAnimal', query);
    },
    searchGenotoxTissueHuman: function(query) {
        return singleFieldTextSearch(GenotoxEvidence, 'tissueHuman', query);
    },
    searchGenotoxCellType: function(query) {
        return singleFieldTextSearch(GenotoxEvidence, 'cellType', query);
    },
    searchGenotoxDosingRoute: function(query) {
        return singleFieldTextSearch(GenotoxEvidence, 'dosingRoute', query);
    },
    searchGenotoxDosingUnits: function(query) {
        return extraUnitsSearch(GenotoxEvidence, query);
    },
    searchAnimalSpecies: function(query) {
        return singleFieldTextSearch(AnimalEvidence, 'species', query);
    },
    searchAnimalStrain: function(query) {
        return singleFieldTextSearch(AnimalEvidence, 'strain', query);
    },
    searchAnimalAgent: function(query) {
        return singleFieldTextSearch(AnimalEvidence, 'agent', query);
    },
    searchAnimalPurity: function(query) {
        return singleFieldTextSearch(AnimalEvidence, 'purity', query);
    },
    searchAnimalVehicle: function(query) {
        return singleFieldTextSearch(AnimalEvidence, 'vehicle', query);
    },
    searchAnimalDosingRoute: function(query) {
        return singleFieldTextSearch(AnimalEvidence, 'dosingRoute', query);
    },
    searchAnimalStrengths: function(query) {
        return listFieldTextSearch(AnimalEvidence, 'strengths', query);
    },
    searchAnimalLimitations: function(query) {
        return listFieldTextSearch(AnimalEvidence, 'limitations', query);
    },
    searchAnimalTumourSite: function(query) {
        return singleFieldTextSearch(AnimalEndpointEvidence, 'tumourSite', query);
    },
    searchAnimalHistology: function(query) {
        return singleFieldTextSearch(AnimalEndpointEvidence, 'histology', query);
    },
    searchAnimalUnits: function(query) {
        return extraUnitsSearch(AnimalEndpointEvidence, query);
    },
    searchNtpEpiCaseControlMatching: function(query) {
        return listFieldTextSearch(NtpEpiDescriptive, 'caseControlMatching', query);
    },
    searchNtpEpiCaseControlDiffers: function(query) {
        return listFieldTextSearch(NtpEpiDescriptive, 'caseControlDiffers', query);
    },
    searchNtpCoexposures: function(query) {
        return listFieldTextSearch(NtpEpiDescriptive, 'coexposures', query);
    },
    searchNtpEpiRiskFactors: function(query) {
        return listFieldTextSearch(NtpEpiDescriptive, 'riskFactors', query);
    },
    searchNtpEpiVariablesOfConcern: function(query) {
        return searchElementInArrayObj(NtpEpiResult, 'variablesOfConcern', 'vocName', query);
    },
    searchNtpOrganSite: function(query) {
        return singleFieldTextSearch(NtpEpiResult, 'organSite', query);
    },
    searchNtpEffectMeasure: function(query) {
        return singleFieldTextSearch(NtpEpiResult, 'effectMeasure', query);
    },
    searchNtpEffectUnits: function(query) {
        return singleFieldTextSearch(NtpEpiResult, 'effectUnits', query);
    },
    searchNtpCovariates: function(query) {
        return listFieldTextSearch(NtpEpiResult, 'covariates', query);
    },
});
