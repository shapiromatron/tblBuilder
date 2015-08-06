Template.navBar.helpers({
  getTitle: function() {
    return Meteor.settings["public"].context.toUpperCase();
  }
});
Template.navBar.rendered = function() {
  document.title = utilities.getHTMLTitleBase();
};
