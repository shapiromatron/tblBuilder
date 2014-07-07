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
        console.log('ajs to fix')
        tbl_id = tmpl.data._id
        # Meteor.call 'epiCohortExcelDownload', tbl_id, (err, response) ->
        #     share.returnExcelFile(response, "epiCohort.xlsx")

    'click #toggleShowAllRows': (evt, tmpl) ->
        val = not Session.get('epiDescriptiveShowAll')
        Session.set('epiDescriptiveShowAll', val)

    'click #epiRiskShowPlots': (evt, tmpl) ->
        console.log('ajs to fix')
        val = not Session.get('epiRiskShowPlots')
        Session.set('epiRiskShowPlots', val)
        share.toggleRiskPlot()

    'click #reorderRows': (evt, tmpl) ->
        val = not Session.get('reorderRows')
        Session.set('reorderRows', val)
        share.toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'))

Template.epiDescriptiveTbl.rendered = ->
    # share.toggleRiskPlot()
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
        console.log('ajs need to fix')
        Session.set("epiDescriptiveShowNew", true)
        Deps.flush() # update DOM before focus
        share.activateInput($("input[name=referenceID]")[0])
        share.copyAsNew(@)

    'click .addEpiResult': (evt, tmpl) ->
        # remove exiting modal, add new one, and inject scope
        window.tmpl=tmpl
        div = tmpl.find('#epiResultDiv')
        $(div).empty()
        window.tmpl = tmpl
        rendered = UI.renderWithData(Template.epiResultForm, {descriptive:@})
        UI.insert(rendered, div)


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
        $(div).empty()
        window.tmpl = tmpl
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

# EPI RESULTS FORM -------------------------------------------------------------
Template.epiResultForm.helpers

    isNew: ->
        return Session.get('epiResultEditingId') is null

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
        $('#epiResultsModal').modal('toggle')

    'click #inner-update': (evt, tmpl) ->
        vals = share.updateValues(tmpl.find('#epiResultForm'), @)
        getRiskRows(tmpl, obj)
        EpiResult.update(@_id, {$set: vals})
        Session.set("epiResultEditingId", null)

    'click #inner-update-cancel': (evt, tmpl) ->
        Session.set("epiResultEditingId", null)

    'click #inner-delete': (evt, tmpl) ->
        EpiResult.remove(@_id)
        Session.set("epiResultEditingId", null)

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
