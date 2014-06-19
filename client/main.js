MyTbls = new Meteor.Collection('myTbls');

getMyTblsHandle = function(){
    var userId = Meteor.userId();
    if (userId)
        myTblsHandle = Meteor.subscribe('myTbls', userId);
    else
        myTblsHandle = null;
};

myTblsHandle = getMyTblsHandle();
Deps.autorun(getMyTblsHandle);


var tblWaitOn = function(){
    var id = this.params._id,
        tbl = MyTbls.findOne({_id: id});
    if(!tbl) Router.go('404');
    if(userCanView(tbl)){
      Session.set('MyTbl', tbl);
      this.render();
    } else {
      Router.go('403');
    }
  },
  userCanView = function(tbl){
    // check to ensure that the current user is both authenticated and part of
    // the project team before allowing to view
    var user = Meteor.user();
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
    data: function(){return MyTbls.findOne(this.params._id);},
    waitOn: tblWaitOn});
  this.route('profileEdit', {path: '/user-profile/'});
  this.route('epiCaseControlMain', {
    path: '/epi-case-control/:_id',
    data: function(){ return MyTbls.findOne(this.params._id);},
    waitOn: tblWaitOn});
  this.route('403', {path: '403'});
  this.route('404', {path: '*'});
});

Template._loginButtonsLoggedInDropdown.events({
  'click #login-buttons-edit-profile': function(event) {
    event.stopPropagation();
    Template._loginButtons.toggleDropdown();
    Router.go('profileEdit');
  }
});

Template.selectList.isSelected = function(current, selected){
  return current === selected;
};
