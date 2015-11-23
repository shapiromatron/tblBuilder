Template.ntpEpiRatingMain.helpers(clientShared.abstractMainHelpers);
Template.ntpEpiRatingMain.onCreated(function() {
    Session.set('evidenceType', 'ntpEpiDescriptive');
    this.subscribe('ntpEpiDescriptive', Session.get('Tbl')._id);
});
Template.ntpEpiRatingMain.onDestroyed(function() {
    Session.set('evidenceType', null);
});


Template.ntpEpiRatingTable.helpers(clientShared.abstractTblHelpers);
Template.ntpEpiRatingTable.onRendered(function(){
    this.$('.ntpEpiRatingTd').popover({
        trigger: "hover",
        placement: "top",
        delay: {show: 0, hide: 100},
        container: "body",
    });
});
Template.ntpEpiRatingTable.onDestroyed(function(){
    this.$('.ntpEpiRatingTd').popover('destroy');
});
