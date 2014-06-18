MyTbls = new Meteor.Collection('myTbls');

var tblAction = function(){
    var id = this.params._id;
    if(userCanView(id)){
      Session.set('MyTbl_id', id);
      this.render();
    } else {
      Router.go('403');
    }
  },
  userCanView = function(tbl_id){
    // check to ensure that the current user is both authenticated and part of
    // the project team before allowing to view
    var tbl = MyTbls.findOne(tbl_id),
        user = Meteor.user();
    if(tbl && user){
      var id = user._id,
          valid_ids = tbl.user_roles.map(function(v){return v.user_id;});
      return ((id === tbl.user_id) || (valid_ids.indexOf(id)>=0));
    }
    return false;
  };

Router.map(function(){
  this.route('my_lists', {path: '/'});
  this.route('epiCohortMain', {
    path: '/epi-cohort/:_id',
    data: function(){ return MyTbls.findOne(this.params._id);},
    action: tblAction});
  this.route('epiCaseControlMain', {
    path: '/epi-case-control/:_id',
    data: function(){ return MyTbls.findOne(this.params._id);},
    action: tblAction});
  this.route('403', {path: '403'});
  this.route('404', {path: '*'});
});
