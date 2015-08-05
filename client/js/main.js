// set session-variables
Session.setDefault('adminUserEditingId', null);
Session.setDefault("adminUserShowNew", false);

Session.setDefault('monographAgent', null);
Session.setDefault('showQAflags', false);
Session.setDefault('isFullScreen', false);

Session.setDefault('reportTemplateEditingId', null);
Session.setDefault("reportTemplateShowNew", false);
Session.setDefault('reorderRows', false);

Session.setDefault('referenceShowNew', false);
Session.setDefault('referenceEditingId', null);
Session.setDefault("referenceNewObj", null);

Session.setDefault('mechanisticEditingId', null);
Session.setDefault('mechanisticNewChild', null);
Session.setDefault('mechanisticAllCollapsed', true);

Session.setDefault('evidenceShowNew', false);
Session.setDefault('evidenceEditingId', null);
Session.setDefault('nestedEvidenceEditingId', null);
Session.setDefault('evidenceShowAll', false);
Session.setDefault('evidenceType', null);

// setup subscriptions
var tablesHandler = null;
Meteor.subscribe('reportTemplate');
Tracker.autorun(function() {
  tablesHandler = Meteor.subscribe('tables', Meteor.userId());
});


// setup router
var TblRouterController = RouteController.extend({
  waitOn: function(){
    return tablesHandler;
  },
  data: function() {
    return Tables.findOne(this.params._id);
  },
  action: function() {
    if (this.ready()) {
      var tbl = this.data();
      Session.set('Tbl', tbl);
      Session.set('monographAgent', tbl.monographAgent);
      shared.getHTMLTitleTbl();
      return this.render();
    } else {
      return this.render("isLoading");
    }
  },
  onStop: function() {
    Session.set('Tbl', null);
    Session.set('monographAgent', null);
    shared.getHTMLTitleBase();
  }
}),
AdminRouteController = RouteController.extend({
  action: function () {
    if (Roles.userIsInRole(Meteor.userId(), ['staff'])){
      this.render();
    } else {
      this.render('404');
    }
  }
});

Router.map(function() {

  this.route('home', {
    path: '/',
  });

  this.route('epiMain', {
    path: '/epidemiology/:_id',
    controller: TblRouterController
  });

  this.route('epiAnalysisMain', {
    path: '/epidemiology/:_id/analysis',
    controller: TblRouterController
  });

  this.route('mechanisticMain', {
    path: '/mechanistic/:_id/',
    controller: TblRouterController
  });

  this.route('exposureMain', {
    path: '/exposure/:_id',
    controller: TblRouterController
  });

  this.route('animalMain', {
    path: '/animal/:_id',
    controller: TblRouterController
  });

  this.route('genotoxMain', {
    path: '/genotoxicity/:_id',
    controller: TblRouterController
  });

  this.route('referencesMain', {
    path: '/references/:monographAgent/',
    data: function() {
      return {monographAgent: this.params.monographAgent};
    }
  });

  this.route('referenceBatchUpload', {
    path: '/references/:monographAgent/upload/',
    data: function() {
      return {monographAgent: this.params.monographAgent};
    }
  });

  this.route('epiOrganSiteMain', {
    path: '/epidemiology/:volumeNumber/:monographAgent/epi-site',
    data: function() {
      return {
        volumeNumber: this.params.volumeNumber,
        monographAgent: this.params.monographAgent
      };
    }
  });

  this.route('profileEdit', {
    path: '/user-profile/'
  });

  this.route('adminMain', {
    path: '/admin/',
    controller: AdminRouteController
  });
});

Router.configure({
  layoutTemplate: 'layout',
  notFoundTemplate: '404',
  loadingTemplate: 'isLoading'
});

Router.plugin('dataNotFound', {notFoundTemplate: '404'});
