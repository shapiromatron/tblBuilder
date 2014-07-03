
Template.epiResultsForm.rendered = ->
    $(@.findAll('.helpPopovers')).popover
            delay: {show: 500, hide: 100}
            trigger: "hover"
            placement: "auto"

Template.epiResultsForm.destroyed = ->
    $(@.findAll('.helpPopovers')).popover('destroy')


Template.epiResultsForm.events
    'click #epiRiskEstimate-add': (evt, tmpl) ->
        tbody = tmpl.find('.riskEstimateTbody')
        rendered = UI.renderWithData(Template.riskEstimateForm, {})
        UI.insert(rendered, tbody)


Template.riskEstimateForm.events
    'click #epiRiskEstimate-delete': (evt, tmpl) ->
        tmpl.__component__.dom.remove()
