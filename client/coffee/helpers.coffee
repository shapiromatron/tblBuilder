Session.setDefault('reorderRows', false)

Template.formLegendPulldown.rendered = ->
    # prevent pull-down from closing when clicking special characters
    $(@.findAll('pre')).click (e) ->
        e.preventDefault()
        e.stopPropagation()

Template.optFullScreen.helpers
    isFullScreen : () ->
        return Session.get("isFullScreen")

Template.optFullScreen.events
    'click #toggleFullScreen': (evt, tmpl) ->
        evt.preventDefault()
        Session.set("isFullScreen", (!Session.get("isFullScreen")))

Template.optRiskPlot.helpers
    showPlots : () ->
        return Session.get("epiRiskShowPlots")

Template.optRiskPlot.events
    'click #epiRiskShowPlots': (evt, tmpl) ->
        evt.preventDefault()
        Session.set('epiRiskShowPlots', (!Session.get('epiRiskShowPlots')))
        clientShared.toggleRiskPlot()

Template.optRiskPlot.onCreated () ->
    Session.setDefault('epiRiskShowPlots', false)
