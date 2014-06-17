Router.map(function(){
  this.route('my_lists', {path: '/'});
  this.route('in_vitro', {path: '/in_vitro'});
  this.route('epiCohortMain', {
    path: '/epi-cohort/:_id',
    data: function(){ return MyTbls.findOne(this.params._id);},
    action: function(){Session.set('MyTbl_id', this.params._id); this.render();}
  });
  this.route('epiCaseControlMain', {
    path: '/epi-case-control/:_id',
    data: function(){ return MyTbls.findOne(this.params._id);},
    action: function(){Session.set('MyTbl_id', this.params._id); this.render();}
  });
  this.route('404', {path: '*'});
});
