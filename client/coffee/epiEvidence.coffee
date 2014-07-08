Session.setDefault('epiDescriptiveShowNew', false)
Session.setDefault('epiDescriptiveEditingId', null)
Session.setDefault('epiDescriptiveShowAll', false)
Session.setDefault('epiResultEditingId', null)

# EPI DESCRIPTIVE TABLE --------------------------------------------------------
Template.epiDescriptiveTbl.helpers

    showNew: ->
        Session.get("epiDescriptiveShowNew")

    isEditing: ->
        Session.equals('epiDescriptiveEditingId', @_id)

    getEpiDescriptives: ->
        EpiDescriptive.find({}, {sort: {sortIdx: 1}})

    showRow: (isHidden) ->
        Session.get('epiDescriptiveShowAll') or !isHidden

    isShowAll: ->
        Session.get('epiDescriptiveShowAll')

    showPlots: ->
        Session.get('epiRiskShowPlots')

Template.epiDescriptiveTbl.events
    'click #show-create': (evt, tmpl) ->
        Session.set("epiDescriptiveShowNew", true)
        Deps.flush() # update DOM before focus
        share.activateInput(tmpl.find("input[name=referenceID]"))

    'click #downloadExcel': (evt, tmpl) ->
        tbl_id = Session.get('Tbl')._id
        Meteor.call 'epiEvidenceDownload', tbl_id, (err, response) ->
            share.returnExcelFile(response, "epi.xlsx")

    'click #toggleShowAllRows': (evt, tmpl) ->
        val = not Session.get('epiDescriptiveShowAll')
        Session.set('epiDescriptiveShowAll', val)

    'click #epiRiskShowPlots': (evt, tmpl) ->
        val = not Session.get('epiRiskShowPlots')
        Session.set('epiRiskShowPlots', val)
        share.toggleRiskPlot()

    'click #reorderRows': (evt, tmpl) ->
        val = not Session.get('reorderRows')
        Session.set('reorderRows', val)
        share.toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'))

    'click #wordReport': (evt, tmpl) ->
        tbl_id = Session.get('Tbl')._id
        Meteor.call 'epiWordReport', tbl_id, (err, response) ->
            share.returnWordFile(response, "report.docx")

Template.epiDescriptiveTbl.rendered = ->
    share.toggleRiskPlot()
    new Sortable(@.find('#sortable'),
        handle: ".dhOuter",
        onUpdate: share.moveRowCheck,
        Cls: EpiDescriptive )
    share.toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'))


# EPI DESCRIPTIVE ROW ----------------------------------------------------------
Template.epiDescriptiveRow.helpers

    getResults: (evt, tmpl) ->
        return EpiResult.find({parent_id: @_id}, {sort: {sortIdx: 1}})

Template.epiDescriptiveRow.events

    'click #toggle-hidden': (evt, tmpl) ->
        EpiDescriptive.update(@_id, {$set: {isHidden: !@isHidden}})

    'click #show-edit': (evt, tmpl) ->
        Session.set("epiDescriptiveEditingId", @_id)
        Deps.flush() # update DOM before focus
        share.activateInput($("input[name=referenceID]")[0])

    'click #copy-as-new': (evt, tmpl) ->
        Session.set("epiDescriptiveShowNew", true)
        Deps.flush() # update DOM before focus
        share.activateInput($("input[name=referenceID]")[0])
        share.copyAsNew(@)

    'click .addEpiResult': (evt, tmpl) ->
        # remove exiting modal, add new one, and inject scope
        div = tmpl.find('#epiResultDiv')
        $(div).empty()
        rendered = UI.renderWithData(Template.epiResultForm, {descriptive:@})
        UI.insert(rendered, div)

Template.epiDescriptiveRow.rendered = ->
    new Sortable(@.find('#sortableInner'),
        handle: ".dhInner",
        onUpdate: share.moveRowCheck,
        Cls: EpiResult)
    share.toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'))


# EPI DESCRIPTIVE FORM ---------------------------------------------------------
Template.epiDescriptiveForm.helpers

    getStudyDesignOptions: ->
        return epiStudyDesignOptions

Template.epiDescriptiveForm.events
    'change select[name="studyDesign"]': (evt, tmpl) ->
        toggleCCfields(tmpl)

    'click #create': (evt, tmpl) ->
        obj = share.newValues(tmpl.find('#epiDescriptiveForm'))
        obj['tbl_id'] = Session.get('Tbl')._id
        obj['sortIdx'] = 1e10  # temporary, make sure to place at bottom
        EpiDescriptive.insert(obj)
        Session.set("epiDescriptiveShowNew", false)

    'click #create-cancel': (evt, tmpl) ->
        Session.set("epiDescriptiveShowNew", false)

    'click #update': (evt, tmpl) ->
        vals = share.updateValues(tmpl.find('#epiDescriptiveForm'), @)
        EpiDescriptive.update(@_id, {$set: vals})
        Session.set("epiDescriptiveEditingId", null)

    'click #update-cancel': (evt, tmpl) ->
        Session.set("epiDescriptiveEditingId", null)

    'click #delete': (evt, tmpl) ->
        EpiDescriptive.remove(@_id)
        Session.set("epiDescriptiveEditingId", null)

    'click #addEpiResult': (evt, tmpl) ->
        # remove exiting modal, add new one, and inject scope
        div = tmpl.find('#epiResultDiv')
        rendered = UI.renderWithData(Template.epiResultForm, {descriptive:@})
        UI.insert(rendered, div)

Template.epiDescriptiveForm.rendered = ->
    toggleCCfields(@)
    $(@.findAll('.helpPopovers')).popover
            delay: {show: 500, hide: 100}
            trigger: "hover"
            placement: "auto"

toggleCCfields = (tmpl) ->
    # toggle between if Cohort or Case-Control fields are present
    selector = tmpl.find('select[name="studyDesign"]')
    studyD = $(selector).find('option:selected')[0].value
    if studyD is "Case-Control"
        $(tmpl.findAll('.isNotCCinput')).hide()
        $(tmpl.findAll('.isCCinput')).show()
    else
        $(tmpl.findAll('.isCCinput')).hide()
        $(tmpl.findAll('.isNotCCinput')).show()

# EPI RESULTS TBL --------------------------------------------------------------
Template.epiResultTbl.helpers

    showRow: (isHidden) ->
        Session.get('epiDescriptiveShowAll') or !isHidden

    showPlots: ->
        Session.get("epiRiskShowPlots")

Template.epiResultTbl.events

    'click #inner-show-edit': (evt, tmpl) ->
        div = tmpl.find('#epiResultDiv')
        data = tmpl.__component__.parent.data()
        Session.set('epiResultEditingId', data._id)
        rendered = UI.renderWithData(Template.epiResultForm, data)
        UI.insert(rendered, div)

    'click #inner-toggle-hidden': (evt, tmpl) ->
        data = tmpl.__component__.parent.data()
        EpiResult.update(data._id, {$set: {isHidden: !data.isHidden}})

    'click #inner-copy-as-new': (evt, tmpl) ->
        div = tmpl.find('#epiResultDiv')
        data = tmpl.__component__.parent.data()
        data.descriptive = {_id: data.parent_id}
        rendered = UI.renderWithData(Template.epiResultForm, data)
        UI.insert(rendered, div)


# EPI RESULTS FORM -------------------------------------------------------------
Template.epiResultForm.helpers

    isNew: ->
        return Session.get('epiResultEditingId') is null

removeSelf = (tmpl) ->
    # completely remove self from DOM, including template
    $(tmpl.find('#epiResultsModal')).on 'hidden.bs.modal', ->
        tmpl.__component__.dom.remove()

    $(tmpl.find('#epiResultsModal')).modal('hide')

getRiskRows = (tmpl, obj) ->
    delete obj.exposureCategory
    delete obj.riskHigh
    delete obj.riskMid
    delete obj.riskLow
    delete obj.riskEstimated
    obj.riskEstimates = []
    tbody = tmpl.find('.riskEstimateTbody')
    for row in $(tbody).find('tr')
        obj.riskEstimates.push(share.newValues(row))

Template.epiResultForm.events
    'click #inner-addRiskRow': (evt, tmpl) ->
        tbody = tmpl.find('.riskEstimateTbody')
        rendered = UI.renderWithData(Template.riskEstimateForm, {})
        UI.insert(rendered, tbody)

    'click #inner-create': (evt, tmpl) ->
        obj = share.newValues(tmpl.find('#epiResultForm'))
        getRiskRows(tmpl, obj)
        obj['tbl_id'] = Session.get('Tbl')._id
        obj['parent_id'] = tmpl.data.descriptive._id
        obj['sortIdx'] = 1e10  # temporary, make sure to place at bottom
        EpiResult.insert(obj)
        removeSelf(tmpl)

    'click #inner-create-cancel': (evt, tmpl) ->
        removeSelf(tmpl)

    'click #inner-update': (evt, tmpl) ->
        vals = share.updateValues(tmpl.find('#epiResultForm'), @)
        getRiskRows(tmpl, vals)
        EpiResult.update(@_id, {$set: vals})
        Session.set("epiResultEditingId", null)
        removeSelf(tmpl)

    'click #inner-update-cancel': (evt, tmpl) ->
        Session.set("epiResultEditingId", null)
        removeSelf(tmpl)

    'click #inner-delete': (evt, tmpl) ->
        EpiResult.remove(@_id)
        Session.set("epiResultEditingId", null)
        removeSelf(tmpl)

Template.epiResultForm.rendered = ->
    $(@.find('#epiResultsModal')).modal('toggle')
    $(@.findAll('.helpPopovers')).popover
            delay: {show: 500, hide: 100}
            trigger: "hover"
            placement: "auto"


# EPI RISK ESTIMATE FORM ROW ---------------------------------------------------
Template.riskEstimateForm.events
    'click #epiRiskEstimate-delete': (evt, tmpl) ->
        tmpl.__component__.dom.remove()


# EPI RISK FOREST PLOT ---------------------------------------------------------
Template.forestPlot.rendered = ->
    data = @.data.value
    svg = d3.select(@.find('svg'))
    svg.attr('viewBox', "0 0 #{svg.node().clientWidth} #{svg.node().clientHeight}")
    xscale = d3.scale.log().range([0, svg.node().clientWidth]).domain([0.05, 50]).clamp(true)
    yscale = d3.scale.linear().range([0, svg.node().clientHeight]).domain([0, 1]).clamp(true)
    riskStr = "#{data.riskMid} (#{data.riskLow}-#{data.riskHigh})"
    group = svg.append('g').attr('class', 'riskBar')

    group.selectAll()
        .data([data])
        .enter()
        .append("circle")
        .attr("cx", (d,i) -> xscale(d.riskMid))
        .attr("cy", (d,i) -> yscale(0.5))
        .attr("r", 5)
        .append("svg:title")
        .text(riskStr);

    if data.riskLow? and data.riskHigh?

        group.selectAll()
            .data([data])
            .enter()
            .append("line")
            .attr("x1", (d,i) -> xscale(d.riskLow))
            .attr("x2", (d,i) -> xscale(d.riskHigh))
            .attr("y1", yscale(0.5))
            .attr("y2", yscale(0.5))
            .append("svg:title")
            .text(riskStr);

        group.selectAll()
            .data([data])
            .enter()
            .append("line")
            .attr("x1", (d,i) -> xscale(d.riskHigh))
            .attr("x2", (d,i) -> xscale(d.riskHigh))
            .attr("y1", yscale(0.25))
            .attr("y2", yscale(0.75))
            .append("svg:title")
            .text(riskStr);

        group.selectAll()
            .data([data])
            .enter()
            .append("line")
            .attr("x1", (d,i) -> xscale(d.riskLow) )
            .attr("x2", (d,i) -> xscale(d.riskLow) )
            .attr("y1", yscale(0.25))
            .attr("y2", yscale(0.75))
            .append("svg:title")
            .text(riskStr);
