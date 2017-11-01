import {Meteor} from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Tracker } from 'meteor/tracker';

import { Router, RouteController } from 'meteor/iron:router';
import { Roles } from 'meteor/alanning:roles';
import { GAnalytics } from 'meteor/datariot:ganalytics';
import { accountsUIBootstrap3 } from 'meteor/ian:accounts-ui-bootstrap-3';

import Tables from '/imports/collections/tables';
import {
    getHTMLTitleTbl,
    getHTMLTitleBase,
} from '/imports/api/client/utilities';


// global session variables
Session.setDefault('showQAflags', false);
Session.setDefault('isFullScreen', false);
Session.setDefault('reorderRows', false);
Session.setDefault('referenceNewObj', null);
Session.setDefault('sortsAndFilters', null);

// setup global subscriptions
let tablesHandler = null;
Tracker.autorun(function() {
    tablesHandler = Meteor.subscribe('tables', Meteor.userId());
});

let usersHandler = null;
Tracker.autorun(function(){
    if (Roles.userIsInRole(Meteor.userId(), ['staff'])) {
        usersHandler = Meteor.subscribe('adminUsers');
    } else {
        var tblId = null;
        try {
            tblId = Session.get('tablesEditingId') || Session.get('Tbl')._id;
        } catch(err){
            // pass
        }
        usersHandler = Meteor.subscribe('tblUsers', tblId);
    }
});


// setup router
var GARouter = RouteController.extend({
        onRun: function () {
            GAnalytics.pageview();
            this.next();
        },
    }),
    TblRouterController = GARouter.extend({
        waitOn: function(){
            return tablesHandler;
        },
        data: function() {
            /*
            If table is found, return table and continue.
            If user is not logged in, raise 403, which suggests login.
            If user is logged-in and table is not found, raise 404.
            */
            let tbl = Tables.findOne(this.params._id);
            if (tbl){
                return tbl;
            } else if(Meteor.userId()){
                this.render('Http404');
            } else {
                this.render('Http403');
            }
        },
        action: function() {
            if (this.ready()) {
                var tbl = this.data();
                Session.set('Tbl', tbl);
                Session.set('monographAgent', tbl.monographAgent);
                document.title = getHTMLTitleTbl();
                return this.render();
            } else {
                return this.render('isLoading');
            }
        },
        onStop: function() {
            Session.set('Tbl', null);
            Session.set('monographAgent', null);
            document.title = getHTMLTitleBase();
        },
    }),
    AdminRouteController = GARouter.extend({
        action: function () {
            if (Roles.userIsInRole(Meteor.userId(), ['staff'])){
                this.render();
                document.title = `${getHTMLTitleBase()} | Admin`;
            } else {
                this.render('Http403');
            }
        },
    });

Router.map(function() {

    this.route('home', {
        path: '/',
        controller: GARouter,
    });

    this.route('Http404', {
        path: '/404/',
        controller: GARouter,
    });

    this.route('volumeTableList', {
        path: '/volume/:volumeNumber',
        data: function() {
            return {volumeNumber: parseInt(this.params.volumeNumber, 10)};
        },
        controller: GARouter,
    });

    this.route('epiMain', {
        path: '/epidemiology/:_id',
        controller: TblRouterController,
    });

    this.route('ntpEpiMain', {
        path: '/ntp-epidemiology/:_id',
        controller: TblRouterController,
    });

    this.route('ntpEpiRatingMain', {
        path: '/ntp-epidemiology/:_id/rating',
        controller: TblRouterController,
    });

    this.route('vocMain', {
        path: '/ntp-epidemiology/:_id/variables-of-concern',
        controller: TblRouterController,
    });

    this.route('mechanisticMain', {
        path: '/mechanistic/:_id/',
        controller: TblRouterController,
    });

    this.route('exposureMain', {
        path: '/exposure/:_id',
        controller: TblRouterController,
    });

    this.route('animalMain', {
        path: '/animal/:_id',
        controller: TblRouterController,
    });

    this.route('ntpAnimalMain', {
        path: '/ntp-animal/:_id',
        controller: TblRouterController,
    });

    this.route('genotoxMain', {
        path: '/genotoxicity/:_id',
        controller: TblRouterController,
    });

    this.route('genotoxHumanExposureMain', {
        path: '/human-exposure/:_id',
        controller: TblRouterController,
    });

    this.route('referencesMain', {
        path: '/references/:monographAgent/',
        data: function() {
            return {monographAgent: this.params.monographAgent};
        },
        controller: GARouter,
    });

    this.route('referenceBatchUpload', {
        path: '/references/:monographAgent/upload/',
        data: function() {
            return {monographAgent: this.params.monographAgent};
        },
        controller: GARouter,
    });

    this.route('epiOrganSiteMain', {
        path: '/epidemiology/:volumeNumber/:monographAgent/epi-site',
        data: function() {
            return {
                volumeNumber: this.params.volumeNumber,
                monographAgent: this.params.monographAgent,
            };
        },
        controller: GARouter,
    });

    this.route('profileEdit', {
        path: '/user-profile/',
        controller: GARouter,
    });

    this.route('adminMain', {
        path: '/admin/',
        controller: AdminRouteController,
    });

    this.route('manageUsersMain', {
        path: '/admin/manage-users/',
        controller: AdminRouteController,
    });

    this.route('dbSearchMain', {
        path: '/admin/db-search/',
        controller: AdminRouteController,
    });

    this.route('ftpLinksMain', {
        path: '/admin/ftp-links/',
        controller: AdminRouteController,
    });

});

Router.configure({
    layoutTemplate: 'layout',
    notFoundTemplate: 'Http404',
    loadingTemplate: 'isLoading',
});

Router.plugin('dataNotFound', {notFoundTemplate: 'Http404'});


// return Home after sign-out
accountsUIBootstrap3.logoutCallback = function(error) {
    Router.go('home');
};
