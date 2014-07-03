# Epidemiology Descriptive Form

toggleCCfields = (tmpl) ->
    window.tmpl=tmpl
    selector = tmpl.find('select[name="studyDesign"]')
    studyD = $(selector).find('option:selected')[0].value
    if studyD is "Case-Control"
        $(tmpl.findAll('.isNotCCinput')).hide()
        $(tmpl.findAll('.isCCinput')).show()
    else
        $(tmpl.findAll('.isCCinput')).hide()
        $(tmpl.findAll('.isNotCCinput')).show()

Template.epiDescriptiveForm.helpers
    getStudyDesignOptions: ->
        return epiStudyDesignOptions

Template.epiDescriptiveForm.events
    'change select[name="studyDesign"]': (evt, tmpl) ->
        toggleCCfields(tmpl)


Template.epiDescriptiveForm.rendered = ->
    toggleCCfields(@)
    $(@.findAll('.helpPopovers')).popover
            delay: {show: 500, hide: 100}
            trigger: "hover"
            placement: "auto"

Template.epiDescriptiveForm.destroyed = ->
    $(@.findAll('.helpPopovers')).popover('destroy')


# Epidemiology Results Form
Template.epiResultsForm.events
    'click #epiRiskEstimate-add': (evt, tmpl) ->
        tbody = tmpl.find('.riskEstimateTbody')
        rendered = UI.renderWithData(Template.riskEstimateForm, {})
        UI.insert(rendered, tbody)

Template.epiResultsForm.rendered = ->
    $(@.findAll('.helpPopovers')).popover
            delay: {show: 500, hide: 100}
            trigger: "hover"
            placement: "auto"

Template.epiResultsForm.destroyed = ->
    $(@.findAll('.helpPopovers')).popover('destroy')


# Epidemiology Risk Estimates Row
Template.riskEstimateForm.events
    'click #epiRiskEstimate-delete': (evt, tmpl) ->
        tmpl.__component__.dom.remove()
