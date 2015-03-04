Session.setDefault('epiResultEditingId', null) # required?

# EPI MAIN ------------------------------------------------------------------
Template.epiMain.rendered = ->
    Session.set('evidenceShowNew', false)
    Session.set('evidenceEditingId', null)
    Session.set('evidenceShowAll', false)
    Session.set('evidenceType', 'epi')

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
epiDescriptiveTblHelpers =

    getReportTypes: ->
        reports = []
        switch Meteor.settings.public.context
            when "ntp"
                reports = [
                    {"type": "NtpEpiDescriptive", "fn": "epi-descriptive", "text": "Download Word: study descriptions"},
                    {"type": "NtpEpiResults",     "fn": "epi-result",      "text": "Download Word: results by organ-site"},
                ]
            when "iarc"
                reports = []
            else
                console.log("Unknown site context.")
        return reports

    showPlots: ->
        Session.get('epiRiskShowPlots')

epiDescriptiveTblEvents =

    'click #epiRiskShowPlots': (evt, tmpl) ->
        val = not Session.get('epiRiskShowPlots')
        Session.set('epiRiskShowPlots', val)
        share.toggleRiskPlot()

    'click .wordReport': (evt, tmpl) ->
        tbl_id = Session.get('Tbl')._id
        report_type = evt.target.dataset.type
        fn = evt.target.dataset.fn + ".docx"
        Meteor.call "pyWordReport", tbl_id, report_type, (err, response) ->
            if (response) then return share.b64toWord(response, fn)
            return alert("An error occurred.")


_.extend(epiDescriptiveTblHelpers, share.abstractTblHelpers)
_.extend(epiDescriptiveTblEvents, share.abstractTblEvents)

Template.epiDescriptiveTbl.helpers epiDescriptiveTblHelpers
Template.epiDescriptiveTbl.events epiDescriptiveTblEvents

Template.epiDescriptiveTbl.rendered = ->
    share.toggleRiskPlot()
    new Sortable(@.find('#sortable'),
        handle: ".dhOuter",
        onUpdate: share.moveRowCheck,
        Cls: EpiDescriptive )
    share.toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'))


# EPI DESCRIPTIVE ROW ----------------------------------------------------------
epiDescriptiveRowHelpers =

    getCol2: ->
        html = ""

        if @studyDesign in CaseControlTypes
            # add percentages to display if numeric
            rrCase = @responseRateCase
            if (@responseRateCase.search(/(\d)+/) >= 0) then rrCase += "%"
            rrCtrl = @responseRateControl
            if (@responseRateControl.search(/(\d)+/) >= 0) then rrCtrl += "%"
            html += "<strong>Cases: </strong>#{@populationSizeCase} (#{rrCase}); #{@sourceCase}<br>"
            html += "<strong>Controls: </strong>#{@populationSizeControl} (#{rrCtrl}); #{@sourceControl}"
        else
            html += "#{@populationSize}; #{@eligibilityCriteria}"

        html += "<br><strong>Exposure assess. method: </strong>"
        if @exposureAssessmentType.toLowerCase().search("other") >= 0
            html += "other"
        else
            html += "#{@exposureAssessmentType}"

        if @exposureAssessmentNotes?
            html += "; #{@exposureAssessmentNotes}"

        if @outcomeDataSource?
            html += "<br>#{@outcomeDataSource}"

        return html

    getStudyDesign: (evt, tmpl) ->
        if @studyDesign is "Nested Case-Control" then return "#{@studyDesign}<br>"

_.extend(epiDescriptiveRowHelpers, share.abstractRowHelpers)

Template.epiDescriptiveRow.helpers(epiDescriptiveRowHelpers)
Template.epiDescriptiveRow.events(share.abstractRowEvents)

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

    createPreValidate: (tmpl, obj, data) ->
        return getEligibilityCriteria(tmpl, obj, data)

    updatePreValidate: (tmpl, obj, data) ->
        return getEligibilityCriteria(tmpl, obj, data)


getEligibilityCriteria = (tmpl, obj, data) ->
    # There are two eligibility criteria fields in HTML document; we want to
    # use whichever field is being input (case-control or cohort)
    fields = tmpl.findAll('textarea[name="eligibilityCriteria"]')
    for fld in fields
        if fld.value.length>0 then val = fld.value
    if data.eligibilityCriteria isnt val then obj.eligibilityCriteria = val
    return obj

# copy but override abstract object
epiDescriptiveFormExtension =

    'change select[name="studyDesign"]': (evt, tmpl) ->
        toggleCCfields(tmpl)

    'click #addEpiResult': (evt, tmpl) ->
        # remove exiting modal, add new one, and inject scope
        div = tmpl.find('#epiResultDiv')
        Blaze.renderWithData(Template.epiResultForm, {descriptive:@}, div)

epiDescriptiveFormEvents = $.extend(true, {}, share.abstractFormEvents, epiDescriptiveFormExtension)
Template.epiDescriptiveForm.events(epiDescriptiveFormEvents)

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

epiResultTblHelpers =

    showPlots: ->
        Session.get("epiRiskShowPlots")

    getCovariatesList: (obj) ->
        obj.covariates.join(", ")

    riskFormat: (obj) ->
        return share.riskFormatter(obj)

    displayTrendTest: ->
        return @trendTest?

_.extend(epiResultTblHelpers, share.abstractNestedTableHelpers)

Template.epiResultTbl.helpers(epiResultTblHelpers)
Template.epiResultTbl.events(share.abstractNestedTableEvents)


# EPI RESULTS FORM -------------------------------------------------------------
Template.epiResultForm.helpers(share.abstractNestedFormHelpers)

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

# copy but override abstract object
epiResultFormExtension =

    'click #inner-addRiskRow': (evt, tmpl) ->
        tbody = tmpl.find('.riskEstimateTbody')
        Blaze.renderWithData(Template.riskEstimateForm, {}, tbody)

    'click #inner-create': (evt, tmpl) ->
        # override required to get riskRow information
        key = Session.get('evidenceType')
        NestedCollection = share.evidenceType[key].nested_collection
        obj = share.newValues(tmpl.find('#nestedModalForm'))
        getRiskRows(tmpl, obj)  # (override)
        obj['tbl_id'] = Session.get('Tbl')._id
        obj['parent_id'] = tmpl.data.parent._id
        obj['sortIdx'] = 1e10  # temporary, make sure to place at bottom
        obj['isHidden'] = false

        isValid = NestedCollection.simpleSchema().namedContext().validate(obj)
        if isValid
            NestedCollection.insert(obj)
            share.removeNestedFormModal(tmpl)
        else
            errorDiv = share.createErrorDiv(NestedCollection.simpleSchema().namedContext())
            $(tmpl.find("#errors")).html(errorDiv)

    'click #inner-update': (evt, tmpl) ->
        # override required to get riskRow information
        key = Session.get('evidenceType')
        NestedCollection = share.evidenceType[key].nested_collection
        vals = share.updateValues(tmpl.find('#nestedModalForm'), @)
        getRiskRows(tmpl, vals)  # (override)
        modifier = {$set: vals}

        isValid = NestedCollection.simpleSchema().namedContext().validate(modifier, {modifier: true})
        if isValid
            NestedCollection.update(@_id, modifier)
            Session.set("nestedEvidenceEditingId", null)
            share.removeNestedFormModal(tmpl)
        else
            errorDiv = share.createErrorDiv(NestedCollection.simpleSchema().namedContext())
            $(tmpl.find("#errors")).html(errorDiv)

epiResultFormEvents = $.extend(true, {}, share.abstractNestedFormEvents, epiResultFormExtension)
Template.epiResultForm.events(epiResultFormEvents)

Template.epiResultForm.rendered = ->
    epiResult = EpiResult.findOne({_id: Session.get('nestedEvidenceEditingId')})
    if epiResult?
        share.toggleQA(@, epiResult.isQA)
    $(@.find('#nestedModalDiv')).modal('toggle')
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
    width = parseInt(svg.node().getBoundingClientRect().width)
    height = parseInt(svg.node().getBoundingClientRect().height)
    svg.attr('viewBox', "0 0 #{width} #{height}")
    xscale = d3.scale.log().range([0, width]).domain([0.05, 50]).clamp(true)
    yscale = d3.scale.linear().range([0, height]).domain([0, 1]).clamp(true)
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
