Template.epiMain.helpers(clientShared.abstractMainHelpers);
Template.epiMain.onCreated(function() {
    Session.set('evidenceType', 'epiDescriptive');
    Session.set('evidenceShowNew', false);
    Session.set('evidenceShowAll', false);
    Session.set('evidenceEditingId', null);
    Session.set('nestedEvidenceEditingId', null);
    this.subscribe('epiDescriptive', Session.get('Tbl')._id);
});
Template.epiMain.onDestroyed(function() {
    Session.set('evidenceType', null);
    Session.set('evidenceShowNew', false);
    Session.set('evidenceShowAll', false);
    Session.set('evidenceEditingId', null);
    Session.set('nestedEvidenceEditingId', null);
    Session.set('sortsAndFilters', null);
});


Template.epiDescriptiveTbl.helpers(_.extend({
    getReportTypes: function() {
        var reports = [
            {
                "type": "EpiHtmlTblRecreation",
                "fn": "epi-results",
                "text": "Download Word: HTML table recreation",
            },
        ];
        return reports;
    },
}, clientShared.abstractTblHelpers));
Template.epiDescriptiveTbl.onRendered(function() {
    clientShared.toggleRiskPlot();
    clientShared.initDraggables(this.find('#sortable'), ".dhOuter", EpiDescriptive);
    clientShared.toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'));
});


Template.epiDescriptiveRow.helpers(_.extend({
    getCol2: function() {
        var html = "", rrCase, rrCtrl;
        if (this.isCaseControl()) {
            rrCase = utilities.getPercentOrText(this.responseRateCase);
            rrCtrl = utilities.getPercentOrText(this.responseRateControl);
            if (rrCase.length > 0) rrCase = ` (${rrCase})`;
            if (rrCtrl.length > 0) rrCtrl = ` (${rrCtrl})`;

            html += `<strong>Cases: </strong>${this.populationSizeCase}${rrCase}; ${this.sourceCase}<br>`;
            html += `<strong>Controls: </strong>${this.populationSizeControl}${rrCtrl}; ${this.sourceControl}`;
        } else {
            html += `${this.populationSize}; ${this.eligibilityCriteria}`;
        }

        html += "<br><strong>Exposure assess. method: </strong>";

        if (this.exposureAssessmentType.toLowerCase().search("other") >= 0) {
            html += "other";
        } else {
            html += "" + this.exposureAssessmentType;
        }

        if (this.exposureAssessmentNotes != null) html += `; ${this.exposureAssessmentNotes}`;
        if (this.outcomeDataSource != null) html += `<br>${this.outcomeDataSource}`;

        return html;
    },
}, clientShared.abstractRowHelpers));
Template.epiDescriptiveRow.events(clientShared.abstractRowEvents);
Template.epiDescriptiveRow.onRendered(function() {
    clientShared.initDraggables(this.find('#sortableInner'), ".dhInner", EpiResult);
    clientShared.toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'));
});


var getEligibilityCriteria = function(tmpl, obj, data) {
    // two different fields with this name; one for case and one for cohort
    tmpl.findAll('textarea[name="eligibilityCriteria"]').forEach(function(fld){
        if (fld.value.length > 0) obj.eligibilityCriteria = fld.value;
    });
    return obj;
};
Template.epiDescriptiveForm.helpers({
    createPreValidate: function(tmpl, obj, data) {
        return getEligibilityCriteria(tmpl, obj, data);
    },
    updatePreValidate: function(tmpl, obj, data) {
        return getEligibilityCriteria(tmpl, obj, data);
    },
});
Template.epiDescriptiveForm.events(_.extend({
    'change select[name="studyDesign"]': function(evt, tmpl) {
        return toggleCCfields(tmpl);
    },
}, clientShared.abstractFormEvents));
Template.epiDescriptiveForm.onRendered(function() {
    toggleCCfields(this);
    clientShared.toggleQA(this, this.data.isQA);
    clientShared.initPopovers(this);
});
Template.epiDescriptiveForm.onDestroyed(function() {
    clientShared.destroyPopovers(this);
});


var toggleCCfields = function(tmpl) {
    var selector = tmpl.find('select[name="studyDesign"]'),
        studyD = $(selector).find('option:selected')[0].value;
    if (EpiDescriptive.isCaseControl(studyD)) {
        $(tmpl.findAll('.isNotCCinput')).hide();
        $(tmpl.findAll('.isCCinput')).show();
    } else {
        $(tmpl.findAll('.isCCinput')).hide();
        $(tmpl.findAll('.isNotCCinput')).show();
    }
};
Template.epiResultTbl.helpers(_.extend({
    showPlots: function() {
        return Session.get("epiRiskShowPlots");
    },
    displayTrendTest: function() {
        return this.trendTest != null;
    },
    displayEffectUnits: function(d) {
        return d.effectUnits != null;
    },
}, clientShared.abstractNestedTableHelpers));
Template.epiResultTbl.events(clientShared.abstractNestedTableEvents);


Template.organSiteTd.helpers({
    getRowspan: function() {
        var rows = this.riskEstimates.length;
        if (this.effectUnits != null) rows += 1;
        return rows;
    },
});


Template.epiResultForm.helpers(clientShared.abstractNestedFormHelpers);
Template.epiResultForm.events(_.extend({
    'click #inner-addRiskRow': function(evt, tmpl) {
        var tbody = tmpl.find('.riskEstimateTbody');
        Blaze.renderWithData(Template.riskEstimateForm, {}, tbody);
    },
}, clientShared.abstractNestedFormEvents));
Template.epiResultForm.onRendered(function() {
    var epiResult = EpiResult.findOne({_id: Session.get('nestedEvidenceEditingId')});
    if (epiResult != null) clientShared.toggleQA(this, epiResult.isQA);
    $('#modalDiv').modal('toggle');
    clientShared.initPopovers(this);
});
Template.epiResultForm.onDestroyed(function() {
    clientShared.destroyPopovers(this);
});


Template.riskEstimateForm.events({
    'click #epiRiskEstimate-delete': function(evt, tmpl) {
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


Template.forestPlot.events({
    'rerender svg': function(evt, tmpl){
        var data = tmpl.data.parent.riskEstimates[tmpl.data.index],
            svg = d3.select(tmpl.find('svg')).html(null),
            width = parseInt(svg.node().getBoundingClientRect().width),
            height = parseInt(svg.node().getBoundingClientRect().height),
            xscale = d3.scale.log()
                .range([0, width])
                .domain([Session.get('epiForestPlotMin'), Session.get('epiForestPlotMax')])
                .clamp(true),
            yscale = d3.scale.linear().range([0, height]).domain([0, 1]).clamp(true),
            group = svg.append('g').attr('class', 'riskBar'),
            riskStr = "Effect measure {0}: {1}".printf(
                tmpl.data.parent.effectMeasure, data.riskMid);

        if (data.riskLow && data.riskHigh){
            riskStr += " ({0}-{1})".printf(data.riskLow, data.riskHigh);
        }

        svg.attr('viewBox', "0 0 {0} {1}".printf(width, height));
        group.append("svg:title").text(riskStr);

        if (data.riskMid != null) {
            group.selectAll()
                .data([data])
                .enter()
                .append("circle")
                .attr("cx", function(d, i) {return xscale(d.riskMid);})
                .attr("cy", function(d, i) {return yscale(0.5);})
                .attr("r", 5);
        }

        if ((data.riskLow != null) && (data.riskHigh != null)) {
            group.selectAll()
                .data([data])
                .enter()
                .append("line")
                .attr("x1", function(d, i) {return xscale(d.riskLow);})
                .attr("x2", function(d, i) {return xscale(d.riskHigh);})
                .attr("y1", yscale(0.5))
                .attr("y2", yscale(0.5));

            group.selectAll()
                .data([data])
                .enter()
                .append("line")
                .attr("x1", function(d, i) {return xscale(d.riskHigh);})
                .attr("x2", function(d, i) {return xscale(d.riskHigh);})
                .attr("y1", yscale(0.25))
                .attr("y2", yscale(0.75));

            group.selectAll()
                .data([data])
                .enter()
                .append("line")
                .attr("x1", function(d, i) {return xscale(d.riskLow);})
                .attr("x2", function(d, i) {return xscale(d.riskLow);})
                .attr("y1", yscale(0.25))
                .attr("y2", yscale(0.75));
        }
    },
});
Template.forestPlot.onRendered(function() {
    this.$('svg').trigger('rerender');
});
