var TblRouterController, tablesHandler = null;

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
Meteor.subscribe('reportTemplate');
Tracker.autorun(function() {
  tablesHandler = Meteor.subscribe('tables', Meteor.userId());
});

// setup router
TblRouterController = RouteController.extend({
  data: function() {
    return Tables.findOne(this.params._id);
  },
  action: function() {
    if (this.ready()) {
      if (Session.get('Tbl') === undefined) return this.render('404');
      shared.getHTMLTitleTbl();
      return this.render();
    } else {
      return this.render("isLoading");
    }
  },
  onStop: function() {
    Session.set('monographAgent', null);
    Session.set('Tbl', null);
    shared.getHTMLTitleBase();
  }
});

// map routes
Router.map(function() {

  this.route('home', {
    path: '/',
    action: function() {
      if (this.ready()) {
        return this.render();
      } else {
        return this.render("isLoading");
      }
    }
  });

  this.route('epiMain', {
    path: '/epidemiology/:_id',
    waitOn: function() {
      if (tablesHandler.ready()) {
        var tbl = Tables.findOne({_id: this.params._id});
        Session.set('Tbl', tbl);
        if (tbl) {
          Session.set('monographAgent', tbl.monographAgent);
          Meteor.subscribe('epiDescriptive', tbl._id);
        }
      }
    },
    controller: TblRouterController
  });

  this.route('epiAnalysisTbl', {
    path: '/epidemiology/:_id/analysis',
    waitOn: function() {
      if (tablesHandler.ready()) {
        var tbl = Tables.findOne({_id: this.params._id});
        Session.set('Tbl', tbl);
        if (tbl) {
          Session.set('monographAgent', tbl.monographAgent);
          Meteor.subscribe('epiDescriptive', tbl._id);
        }
      }
    },
    controller: TblRouterController
  });

  this.route('mechanisticMain', {
    path: '/mechanistic/:_id/',
    waitOn: function() {
      if (tablesHandler.ready()) {
        var tbl = Tables.findOne({_id: this.params._id});
        Session.set('Tbl', tbl);
        if (tbl) {
          Session.set('monographAgent', tbl.monographAgent);
          Meteor.subscribe('mechanisticEvidence', tbl._id);
        }
      }
    },
    controller: TblRouterController
  });

  this.route('exposureMain', {
    path: '/exposure/:_id',
    waitOn: function() {
      if (tablesHandler.ready()) {
        var tbl = Tables.findOne({_id: this.params._id});
        Session.set('Tbl', tbl);
        if (tbl) {
          Session.set('monographAgent', tbl.monographAgent);
          Meteor.subscribe('exposureEvidence', tbl._id);
        }
      }
    },
    controller: TblRouterController
  });

  this.route('animalMain', {
    path: '/animal/:_id',
    waitOn: function() {
      if (tablesHandler.ready()) {
        var tbl = Tables.findOne({_id: this.params._id});
        Session.set('Tbl', tbl);
        if (tbl) {
          Session.set('monographAgent', tbl.monographAgent);
          Meteor.subscribe('animalEvidence', tbl._id);
        }
      }
    },
    controller: TblRouterController
  });

  this.route('genotoxMain', {
    path: '/genotoxicity/:_id',
    waitOn: function() {
      if (tablesHandler.ready()) {
        var tbl = Tables.findOne({_id: this.params._id});
        Session.set('Tbl', tbl);
        if (tbl) {
          Session.set('monographAgent', tbl.monographAgent);
          Meteor.subscribe('genotoxEvidence', tbl._id);
        }
      }
    },
    controller: TblRouterController
  });

  this.route('referencesMain', {
    path: '/references/:monographAgent/',
    data: function() {
      return {monographAgent: this.params.monographAgent};
    },
    waitOn: function() {
      if (tablesHandler.ready()) {
        var monographAgent = this.params.monographAgent;
        Session.set('monographAgent', monographAgent);
        Meteor.subscribe('monographReference', monographAgent);
      }
    },
    action: function() {
      if (this.ready()) {
        return this.render();
      } else {
        return this.render("isLoading");
      }
    },
    onStop: function() {return Session.set('monographAgent', null);}
  });

  this.route('referenceBatchUpload', {
    path: '/references/:monographAgent/upload/',
    data: function() {
      return {monographAgent: this.params.monographAgent};
    },
    waitOn: function() {
      if (tablesHandler.ready()) {
        var monographAgent = this.params.monographAgent;
        Session.set('monographAgent', monographAgent);
        Meteor.subscribe('monographReference', monographAgent);
      }
    },
    action: function() {
      if (this.ready()) {
        return this.render();
      } else {
        return this.render("isLoading");
      }
    },
    onStop: function() {
      return Session.set('monographAgent', null);
    }
  });

  this.route('epiOrganSiteMain', {
    path: '/epidemiology/:volumeNumber/:monographAgent/epi-site',
    data: function() {
      return {
        volumeNumber: this.params.volumeNumber,
        monographAgent: this.params.monographAgent
      };
    },
    waitOn: function() {
      return tablesHandler.ready;
    },
    action: function() {
      if (this.ready()) {
        return this.render();
      } else {
        return this.render("isLoading");
      }
    },
    onStop: function() {
      return Session.set('epiTbls', null);
    }
  });

  this.route('profileEdit', {
    path: '/user-profile/'
  });

  this.route('isLoading', {
    path: '/loading/'
  });

  this.route('admin', {
    waitOn: function() {
      this.viewHandles = Meteor.subscribe('adminUsers');
      return this.viewHandles;
    },
    action: function() {
      if (this.ready()) {
        return this.render();
      } else {
        return this.render("isLoading");
      }
    },
    onStop: function() {
      return this.viewHandles.stop();
    }
  });
});

// router configuration
Router.configure({
  layoutTemplate: 'layout',
  notFoundTemplate: '404',
  loadingTemplate: 'isLoading'
});
