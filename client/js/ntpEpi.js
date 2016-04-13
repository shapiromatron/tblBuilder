Template.ntpEpiMain.helpers(clientShared.abstractMainHelpers);
Template.ntpEpiMain.onCreated(function() {
    Session.set('evidenceType', 'ntpEpiDescriptive');
    Session.set('evidenceShowNew', false);
    Session.set('evidenceShowAll', false);
    Session.set('evidenceEditingId', null);
    Session.set('nestedEvidenceEditingId', null);
    this.subscribe('ntpEpiDescriptive', Session.get('Tbl')._id);
});
Template.ntpEpiMain.onDestroyed(function() {
    Session.set('evidenceType', null);
    Session.set('evidenceShowNew', false);
    Session.set('evidenceShowAll', false);
    Session.set('evidenceEditingId', null);
    Session.set('nestedEvidenceEditingId', null);
    Session.set('sortsAndFilters', null);
});


Template.ntpEpiDescTbl.helpers(clientShared.abstractTblHelpers);
Template.ntpEpiDescTbl.onRendered(function() {
    clientShared.toggleRiskPlot();
    clientShared.initDraggables(this.find('#sortable'), '.dhOuter', NtpEpiDescriptive);
    clientShared.toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'));
});


Template.ntpEpiDescriptiveRow.helpers(_.extend({
    getCol2: function() {
        var html = '', rrCases, rrCtrls;
        if (this.isCaseControl()) {
            rrCases = utilities.getPercentOrText(this.responseRateCase);
            rrCtrls = utilities.getPercentOrText(this.responseRateControl);
            if (rrCases.length > 0) rrCases = ` (${rrCases})`;
            if (rrCtrls.length > 0) rrCtrls = ` (${rrCtrls})`;

            html += `<strong>Cases: </strong>${this.populationSizeCases}${rrCases}; ${this.selectionDescriptionCases}<br>`;
            html += `<strong>Controls: </strong>${this.populationSizeControls}${rrCtrls}; ${this.selectionDescriptionControls}`;
        } else {
            html += `${this.cohortPopulationSize}; ${this.populationEligibility}`;
        }

        html += '<br><strong>Exposure assess. method: </strong>';

        if (this.exposureAssessmentType.toLowerCase().search('other') >= 0) {
            html += 'other';
        } else {
            html += '' + this.exposureAssessmentType;
        }

        if (this.exposureAssessmentNotes != null) html += `; ${this.exposureAssessmentNotes}`;
        if (this.outcomeDataSource != null) html += `<br>${this.outcomeDataSource}`;

        return html;
    },
}, clientShared.abstractRowHelpers));
Template.ntpEpiDescriptiveRow.events(clientShared.abstractRowEvents);
Template.ntpEpiDescriptiveRow.onRendered(function() {
    clientShared.initDraggables(this.find('#sortableInner'), '.dhInner', NtpEpiResult);
    clientShared.toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'));
});


var toggleRequiredFields = function(tmpl, duration){
    duration = duration || 1000;
    var design = tmpl.find('select[name=studyDesign]').value,
        shows, hides;
    switch (design){
    case 'Cohort':
        shows = ['.isCohort', '.isntCC'];
        hides = ['.isntCohort', 'isNCC'];
        break;
    case 'Case-Control':
        shows = ['.isntCohort'];
        hides = ['.isCohort', '.isntCC', 'isNCC'];
        break;
    case 'Nested Case-Control':
    case 'Ecological':
        shows = ['.isntCohort', '.isntCC', 'isNCC'];
        hides = ['.isCohort'];
        break;
    default:
        console.log(`unknown study-design: ${design}`);
    }
    tmpl.$(hides.join(',')).fadeOut(duration, function(){
        tmpl.$(shows.join(',')).fadeIn(duration);
    });
};
Template.ntpEpiDescriptiveForm.helpers({
    allAccordiansShown: function(){
        return Template.instance().allAccordiansShown.get();
    },
});
Template.ntpEpiDescriptiveForm.events(_.extend({
    'change select[name="studyDesign"]': function(evt, tmpl) {
        return toggleRequiredFields(tmpl);
    },
    'click #toggleAccordian': function(evt, tmpl){
        tmpl.allAccordiansShown.set(!tmpl.allAccordiansShown.get());
        var action = (tmpl.allAccordiansShown.get()) ? 'show' : 'hide';
        $(tmpl.findAll('.collapse')).collapse(action);
    },
}, clientShared.abstractFormEvents));
Template.ntpEpiDescriptiveForm.onCreated(function(){
    this.allAccordiansShown = new ReactiveVar(false);
});
Template.ntpEpiDescriptiveForm.onRendered(function() {
    clientShared.toggleQA(this, this.data.isQA);
    clientShared.initPopovers(this);
    toggleRequiredFields(this, 1e-6);
});
Template.ntpEpiDescriptiveForm.onDestroyed(function() {
    clientShared.destroyPopovers(this);
});


Template.ntpEpiResultTbl.helpers(_.extend({
    showPlots: function() {
        return Session.get('epiRiskShowPlots');
    },
    displayTrendTest: function() {
        return this.trendTest != null;
    },
    displayEffectUnits: function(d) {
        return d.effectUnits != null;
    },
}, clientShared.abstractNestedTableHelpers));
Template.ntpEpiResultTbl.events(clientShared.abstractNestedTableEvents);


Template.ntpEpiResultForm.helpers(clientShared.abstractNestedFormHelpers);
Template.ntpEpiResultForm.events(_.extend({
    'click #inner-addRiskRow': function(evt, tmpl) {
        var tbody = tmpl.find('.riskEstimateTbody');
        Blaze.renderWithData(Template.riskEstimateForm, {}, tbody);
    },
}, clientShared.abstractNestedFormEvents));
Template.ntpEpiResultForm.onRendered(function() {
    var object = NtpEpiResult.findOne({_id: Session.get('nestedEvidenceEditingId')});
    if (object != null) clientShared.toggleQA(this, object.isQA);
    $('#modalDiv').modal('toggle');
    clientShared.initPopovers(this);
});
Template.ntpEpiResultForm.onDestroyed(function() {
    clientShared.destroyPopovers(this);
});


var vocHelpers = {
    getVocSchema: function(){
        return NtpEpiResult.variableOfConcernSchema.schema();
    },
    isNew: function(){
        return Session.get('nestedEvidenceEditingId') === null;
    },
};

Template.variablesOfConcern.helpers(vocHelpers);
Template.variablesOfConcern.events({
    'click #addVocRow': function(evt, tmpl) {
        var tbody = tmpl.find('tbody');
        Blaze.renderWithData(Template.variablesOfConcernForm, {}, tbody);
    },
});
Template.variablesOfConcern.onRendered(function() {
    clientShared.initPopovers(this);
});
Template.variablesOfConcern.onDestroyed(function() {
    clientShared.destroyPopovers(this);
});


Template.variablesOfConcernForm.helpers(vocHelpers);
Template.variablesOfConcernForm.events({
    'click #delete': function(evt, tmpl) {
        Blaze.remove(tmpl.view);
        $(tmpl.view._domrange.members).remove();
    },
    'click #moveUp': function(evt, tmpl) {
        var tr = $(tmpl.firstNode);
        tr.insertBefore(tr.prev());
    },
    'click #moveDown': function(evt, tmpl) {
        var tr = $(tmpl.firstNode);
        tr.insertAfter(tr.next());
    },
});
