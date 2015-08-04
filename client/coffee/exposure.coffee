
Meteor.startup ->

    # EXPOSURE MAIN ------------------------------------------------------------------
    Template.exposureMain.helpers(clientShared.abstractMainHelpers)

    Template.exposureMain.rendered = ->
        Session.set('evidenceShowNew', false)
        Session.set('evidenceEditingId', null)
        Session.set('evidenceShowAll', false)
        Session.set('evidenceType', 'exposure')


    # EXPOSURE TABLE ---------------------------------------------------------------
    Template.exposureTbl.helpers(clientShared.abstractTblHelpers)
    Template.exposureTbl.events(clientShared.abstractTblEvents)

    Template.exposureTbl.rendered = ->
        new Sortable(@.find('#sortable'),
            handle: ".dhOuter",
            onUpdate: clientShared.moveRowCheck,
            Cls: ExposureEvidence )
        clientShared.toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'))


    # EXPOSURE ROW -----------------------------------------------------------------
    Template.exposureRow.helpers

        isOccupational: ->
            return @exposureScenario in exposureScenariosOccupational


    Template.exposureRow.events(clientShared.abstractRowEvents)


    # EXPOSURE FORM ----------------------------------------------------------------

    Template.exposureForm.helpers

        getExposureScenario: ->
            return exposureScenarios

        getSamplingApproach: ->
            return samplingApproaches

        getExposureLevelDescription: ->
            return exposureLevelDescriptions


    toggleOccFields = (tmpl) ->
        # toggle between occupational and environmental exposure inputs
        selector = tmpl.find('select[name="exposureScenario"]')
        scen = $(selector).find('option:selected')[0].value
        if scen in exposureScenariosOccupational
            $(tmpl.findAll('.isOcc')).show()
            $(tmpl.findAll('.isNotOcc')).hide()
        else
            $(tmpl.findAll('.isOcc')).hide()
            $(tmpl.findAll('.isNotOcc')).show()

    # copy but override abstract object
    exposureFormExtension =

        'change select[name="exposureScenario"]': (evt, tmpl) ->
            toggleOccFields(tmpl)


    exposureFormEvents = $.extend(true, {}, clientShared.abstractFormEvents, exposureFormExtension)
    Template.exposureForm.events(exposureFormEvents)

    Template.exposureForm.rendered = ->
        toggleOccFields(@)
        clientShared.toggleQA(@, @.data.isQA)
        $(@.findAll('.helpPopovers')).popover
                delay: {show: 500, hide: 100}
                trigger: "hover"
                placement: "auto"
