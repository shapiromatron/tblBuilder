Template.navBar.helpers({
  getTitle: function() {
    return Meteor.settings["public"].context.toUpperCase();
  }
});
Template.navBar.rendered = function() {
  return shared.getHTMLTitleBase();
};
