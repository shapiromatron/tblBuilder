Session.setDefault('epiDescriptiveShowNew', false)
Session.setDefault('epiDescriptiveEditingId', null)
Session.setDefault('epiDescriptiveShowAll', false)
Session.setDefault('epiResultEditingId', null)

# EPI ANALYSIS TABLE -----------------------------------------------------------
Template.epiAnalysisTbl.rendered = ->
    self = @
    data = share.getFlattenedEpiData(Session.get("Tbl")._id)
    # build default columns to display
    columns = []
    for field in data.shift()
        columns.push({"title": field, "visible": field in share.defaultEpiVisible})

    # create the dataTable object
    tbl = $(self.find('#analysisTbl'))
    tbl.dataTable({
        "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],
        "dom": 'RC<"clear">lfrtip',
        "scrollY":        "600px",
        "scrollCollapse": true,
        "paging":         false,
        "data": data,
        "columns": columns
    })

# not used, sort fine without so-far
$.extend $.fn.dataTableExt.oSort,
    # Author-year citation field
    "authorYear-pre": (s) ->
        # Change citation from "Smith et al. 1972" to "1972 Smith" for sorting
        res = s.match(/(\w+).*(\d{4})/)
        if res? then return "#{res[2]} #{res[1]}"
        else return s

    "authorYear-asc": (a, b) ->
        return ((a < b) ? -1 : ((a > b) ? 1 : 0))

    "authorYear-desc": (a, b) ->
        return ((a < b) ? 1 : ((a > b) ?  -1 : 0))

    # Risk field
    "riskSort-pre": (s) ->
        # get the first numeric value in risk string
        res = s.match(/([\d\.]+)/)
        return parseFloat(res[1])

    "riskSort-asc": (a, b) ->
        return ((a < b) ? -1 : ((a > b) ? 1 : 0))

    "riskSort-desc": (a, b) ->
        return ((a < b) ? 1 : ((a > b) ?  -1 : 0))


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
        Tracker.flush() # update DOM before focus
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
        div = tmpl.find('#modalHolder')
        Blaze.renderWithData(Template.reportTemplateModal, {}, div)

    'click #toggleQAflags': (evt, tmpl) ->
        val = not Session.get('showQAflags')
        Session.set('showQAflags', val)

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

    getStudyDesign: (evt, tmpl) ->
        if @studyDesign is "Nested Case-Control" then return "#{@studyDesign}<br>"

Template.epiDescriptiveRow.events

    'click #toggle-hidden': (evt, tmpl) ->
        EpiDescriptive.update(@_id, {$set: {isHidden: !@isHidden}})

    'click #show-edit': (evt, tmpl) ->
        Session.set("epiDescriptiveEditingId", @_id)
        Tracker.flush() # update DOM before focus
        share.activateInput($("input[name=referenceID]")[0])

    'click #copy-as-new': (evt, tmpl) ->
        Session.set("epiDescriptiveShowNew", true)
        Tracker.flush() # update DOM before focus
        share.activateInput($("input[name=referenceID]")[0])
        share.copyAsNew(@)

    'click .addEpiResult': (evt, tmpl) ->
        # remove exiting modal, add new one, and inject scope
        div = tmpl.find('#epiResultDiv')
        $(div).empty()
        Blaze.renderWithData(Template.epiResultForm, {descriptive:@}, div)

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

    getExposureAssessmentTypeOptions: ->
        return exposureAssessmentTypeOptions

Template.epiDescriptiveForm.events
    'change select[name="studyDesign"]': (evt, tmpl) ->
        toggleCCfields(tmpl)

    'click #create': (evt, tmpl) ->
        obj = share.newValues(tmpl.find('#epiDescriptiveForm'))
        obj['tbl_id'] = Session.get('Tbl')._id
        obj['sortIdx'] = 1e10  # temporary, make sure to place at bottom
        isValid = EpiDescriptive.simpleSchema().namedContext().validate(obj)
        if isValid
            EpiDescriptive.insert(obj)
            Session.set("epiDescriptiveShowNew", false)
        else
            errorDiv = share.createErrorDiv(EpiDescriptive.simpleSchema().namedContext())
            $(tmpl.find("#errors")).html(errorDiv)

    'click #create-cancel': (evt, tmpl) ->
        Session.set("epiDescriptiveShowNew", false)

    'click #update': (evt, tmpl) ->
        vals = share.updateValues(tmpl.find('#epiDescriptiveForm'), @)
        vals.studyDesign = tmpl.find('select[name="studyDesign"]').value  # add for conditional schema-logic
        modifier = {$set: vals}
        isValid = EpiDescriptive.simpleSchema().namedContext().validate(modifier, {modifier: true})
        if isValid
            EpiDescriptive.update(@_id, {$set: vals})
            Session.set("epiDescriptiveEditingId", null)
        else
            errorDiv = share.createErrorDiv(EpiDescriptive.simpleSchema().namedContext())
            $(tmpl.find("#errors")).html(errorDiv)

    'click #update-cancel': (evt, tmpl) ->
        Session.set("epiDescriptiveEditingId", null)

    'click #delete': (evt, tmpl) ->
        EpiDescriptive.remove(@_id)
        Session.set("epiDescriptiveEditingId", null)

    'click #addEpiResult': (evt, tmpl) ->
        # remove exiting modal, add new one, and inject scope
        div = tmpl.find('#epiResultDiv')
        Blaze.renderWithData(Template.epiResultForm, {descriptive:@}, div)

    'click #setQA,#unsetQA': (evt, tmpl) ->
        Meteor.call 'adminToggleQAd', this._id, "epiDescriptive", (err, response) ->
            if response then share.toggleQA(tmpl, response.QAd)

Template.epiDescriptiveForm.rendered = ->
    toggleCCfields(@)
    share.toggleQA(@, @.data.isQA)
    $(@.findAll('.helpPopovers')).popover
            delay: {show: 500, hide: 100}
            trigger: "hover"
            placement: "auto"

toggleCCfields = (tmpl) ->
    # toggle between if Cohort or Case-Control fields are present
    selector = tmpl.find('select[name="studyDesign"]')
    studyD = $(selector).find('option:selected')[0].value
    if studyD in CaseControlTypes
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

    getCovariatesList: (obj) ->
        obj.covariates.join(", ")

    riskFormat: (obj) ->
        return share.riskFormatter(obj)

    displayTrendTest: ->
        return @trendTest?

Template.epiResultTbl.events

    'click #inner-show-edit': (evt, tmpl) ->
        div = tmpl.find('#epiResultDiv')
        Session.set('epiResultEditingId', tmpl.data._id)
        Blaze.renderWithData(Template.epiResultForm, {}, div)

    'click #inner-toggle-hidden': (evt, tmpl) ->
        data = tmpl.view.parentView.dataVar.curValue
        EpiResult.update(data._id, {$set: {isHidden: !data.isHidden}})

    'click #inner-copy-as-new': (evt, tmpl) ->
        div = tmpl.find('#epiResultDiv')
        data = tmpl.view.parentView.dataVar.curValue
        data.descriptive = {_id: data.parent_id}
        Blaze.renderWithData(Template.epiResultForm, data, div)


# EPI RESULTS FORM -------------------------------------------------------------
Template.epiResultForm.helpers

    isNew: ->
        return Session.get('epiResultEditingId') is null

    getResult: () ->
        # get data to render into form, either using a reactive data-source if
        # editing an existing result, or by using initial-data specified from
        # a creation view
        initial = @
        existing = EpiResult.findOne({_id: Session.get('epiResultEditingId')})
        return existing || initial

removeModal = (tmpl, options) ->

    onHidden = () ->
        # remove template from DOM completely
        $(tmpl.view._domrange.members).remove()
        Blaze.remove(tmpl.view)
        if options? and options.remove?
            EpiResult.remove(options.remove)

    $(tmpl.find('#epiResultsModal'))
        .on('hidden.bs.modal', onHidden)
        .modal('hide')


getRiskRows = (tmpl, obj) ->
    delete obj.exposureCategory
    delete obj.numberExposed
    delete obj.riskMid
    delete obj.riskLow
    delete obj.riskHigh
    delete obj.riskEstimated
    delete obj.inTrendTest
    obj.riskEstimates = []
    tbody = tmpl.find('.riskEstimateTbody')
    for row in $(tbody).find('tr')
        obj.riskEstimates.push(share.newValues(row))

Template.epiResultForm.events
    'click #inner-addRiskRow': (evt, tmpl) ->
        tbody = tmpl.find('.riskEstimateTbody')
        Blaze.renderWithData(Template.riskEstimateForm, {}, tbody)

    'click #inner-create': (evt, tmpl) ->
        obj = share.newValues(tmpl.find('#epiResultForm'))
        getRiskRows(tmpl, obj)
        obj['tbl_id'] = Session.get('Tbl')._id
        obj['parent_id'] = tmpl.data.descriptive._id
        obj['sortIdx'] = 1e10  # temporary, make sure to place at bottom
        obj['isHidden'] = false
        isValid = EpiResult.simpleSchema().namedContext().validate(obj)
        if isValid
            EpiResult.insert(obj)
            removeModal(tmpl)
        else
            errorDiv = share.createErrorDiv(EpiResult.simpleSchema().namedContext())
            $(tmpl.find("#errors")).html(errorDiv)

    'click #inner-create-cancel': (evt, tmpl) ->
        removeModal(tmpl)

    'click #inner-update': (evt, tmpl) ->
        vals = share.updateValues(tmpl.find('#epiResultForm'), @)
        getRiskRows(tmpl, vals)
        modifier = {$set: vals}
        isValid = EpiResult.simpleSchema().namedContext().validate(modifier, {modifier: true})
        if isValid
            EpiResult.update(@_id, modifier)
            Session.set("epiResultEditingId", null)
            removeModal(tmpl)
        else
            errorDiv = share.createErrorDiv(EpiResult.simpleSchema().namedContext())
            $(tmpl.find("#errors")).html(errorDiv)

    'click #inner-update-cancel': (evt, tmpl) ->
        Session.set("epiResultEditingId", null)
        removeModal(tmpl)

    'click #inner-delete': (evt, tmpl) ->
        Session.set("epiResultEditingId", null)
        removeModal(tmpl, {"remove": @_id})

    'click #setQA,#unsetQA': (evt, tmpl) ->
        Meteor.call 'adminToggleQAd', this._id, "epiResult", (err, response) ->
            if response then share.toggleQA(tmpl, response.QAd)

Template.epiResultForm.rendered = ->
    share.toggleQA(@, @.data.isQA)
    $(@.find('#epiResultsModal')).modal('toggle')
    $(@.findAll('.helpPopovers')).popover
        delay: {show: 500, hide: 100}
        trigger: "hover"
        placement: "auto"


# EPI RISK ESTIMATE FORM ROW ---------------------------------------------------
Template.riskEstimateForm.events
    'click #epiRiskEstimate-delete': (evt, tmpl) ->
        Blaze.remove(tmpl.view)
        $(tmpl.view._domrange.members).remove()


# EPI RISK FOREST PLOT ---------------------------------------------------------
Template.forestPlot.rendered = ->
    data = @data.parent.riskEstimates[@data.index]
    svg = d3.select(@.find('svg'))
    svg.attr('viewBox', "0 0 #{svg.node().clientWidth} #{svg.node().clientHeight}")
    xscale = d3.scale.log().range([0, svg.node().clientWidth]).domain([0.05, 50]).clamp(true)
    yscale = d3.scale.linear().range([0, svg.node().clientHeight]).domain([0, 1]).clamp(true)
    riskStr = "Effect measure #{@data.parent.effectMeasure}: #{data.riskMid} (#{data.riskLow}-#{data.riskHigh})"
    group = svg.append('g').attr('class', 'riskBar')
    group.append("svg:title").text(riskStr)

    if data.riskMid?
        group.selectAll()
            .data([data])
            .enter()
            .append("circle")
            .attr("cx", (d,i) -> xscale(d.riskMid))
            .attr("cy", (d,i) -> yscale(0.5))
            .attr("r", 5)

    if data.riskLow? and data.riskHigh?

        group.selectAll()
            .data([data])
            .enter()
            .append("line")
            .attr("x1", (d,i) -> xscale(d.riskLow))
            .attr("x2", (d,i) -> xscale(d.riskHigh))
            .attr("y1", yscale(0.5))
            .attr("y2", yscale(0.5))

        group.selectAll()
            .data([data])
            .enter()
            .append("line")
            .attr("x1", (d,i) -> xscale(d.riskHigh))
            .attr("x2", (d,i) -> xscale(d.riskHigh))
            .attr("y1", yscale(0.25))
            .attr("y2", yscale(0.75))

        group.selectAll()
            .data([data])
            .enter()
            .append("line")
            .attr("x1", (d,i) -> xscale(d.riskLow) )
            .attr("x2", (d,i) -> xscale(d.riskLow) )
            .attr("y1", yscale(0.25))
            .attr("y2", yscale(0.75))
