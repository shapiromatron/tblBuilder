# GENOTOX MAIN -----------------------------------------------------------------
Template.genotoxMain.rendered = ->
    Session.set('evidenceShowNew', false)
    Session.set('evidenceEditingId', null)
    Session.set('evidenceShowAll', false)
    Session.set('evidenceType', 'genotox')


# GENOTOX TABLE ----------------------------------------------------------------
Template.genotoxTbl.helpers(share.abstractTblHelpers)
Template.genotoxTbl.events(share.abstractTblEvents)

Template.genotoxTbl.rendered = ->
    new Sortable(@.find('#sortable'),
        handle: ".dhOuter",
        onUpdate: share.moveRowCheck,
        Cls: GenotoxEvidence )
    share.toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'))


# GENOTOX ROW ------------------------------------------------------------------
Template.genotoxRow.events(share.abstractRowEvents)


# GENOTOX FORM -----------------------------------------------------------------
toggleDataClassFields = (tmpl) ->
    # toggle between required fields for multiple data types
    selector = tmpl.find('select[name="dataClass"]')
    shows = ""
    hides = ""
    switch $(selector).find('option:selected')[0].value
        when "Non-mammalian in vitro"
            shows = ".non_mamm_vitro"
            hides = ".mamm_vitro, .ani_vivo, .human_vivo"
        when "Mammalian and human in vitro"
            shows = ".mamm_vitro"
            hides = ".non_mamm_vitro, .ani_vivo, .human_vivo"
        when "Animal in vivo"
            shows = ".ani_vivo"
            hides = ".non_mamm_vitro, .mamm_vitro, .human_vivo"
        when "Human in vivo"
            shows = ".human_vivo"
            hides = ".non_mamm_vitro, .mamm_vitro, .ani_vivo"
        else
            console.log("unknown data-type")

    $(tmpl.findAll(shows)).show()
    $(tmpl.findAll(hides)).hide()

toggleEndpointOptions = (tmpl) ->
    dataType = tmpl.find('select[name="dataClass"]').value
    pheno = tmpl.find('select[name="phylogeneticClass"]').value
    mamm = tmpl.find('select[name="testSpeciesMamm"]').value
    tox = "Genotox"  # todo: fix

    switch dataType
        when "Non-mammalian in vitro"
            obj = share.mechanisticTestCrosswalk[dataType][pheno][tox]
        when "Mammalian and human in vitro"
            obj = share.mechanisticTestCrosswalk[dataType][mamm][tox]
        when "Animal in vivo"
            obj = share.mechanisticTestCrosswalk[dataType][tox]
        when "Human in vivo"
            obj = share.mechanisticTestCrosswalk[dataType][tox]
        else
            console.log("unknown data-type")

    vals = (key for key, v of obj)
    options = for val in vals
        "<option value='#{val}'>#{val}</option>"

    # todo: apply selected value
    $(tmpl.find('select[name="endpoint"]')).html(options)

    toggleEndpointTestOptions(tmpl)


toggleEndpointTestOptions =  (tmpl) ->
    # todo: fetch existing value and mark selected
    dataType = tmpl.find('select[name="dataClass"]').value
    pheno = tmpl.find('select[name="phylogeneticClass"]').value
    mamm = tmpl.find('select[name="testSpeciesMamm"]').value
    tox = "Genotox"
    endpoint = tmpl.find('select[name="endpoint"]').value

    switch dataType
        when "Non-mammalian in vitro"
            vals = share.mechanisticTestCrosswalk[dataType][pheno][tox][endpoint]
        when "Mammalian and human in vitro"
            vals = share.mechanisticTestCrosswalk[dataType][mamm][tox][endpoint]
        when "Animal in vivo"
            vals = share.mechanisticTestCrosswalk[dataType][tox][endpoint]
        when "Human in vivo"
            vals = share.mechanisticTestCrosswalk[dataType][tox][endpoint]
        else
            console.log("unknown data-type")

    options = for val in vals
        "<option value='#{val}'>#{val}</option>"

    # todo: apply selected value
    $(tmpl.find('select[name="endpointTest"]')).html(options)


# copy but override abstract object
genotoxFormExtension =

    'change select[name="dataClass"]': (evt, tmpl) ->
        toggleDataClassFields(tmpl)
        toggleEndpointOptions(tmpl)

    'change select[name="phylogeneticClass"]': (evt, tmpl) ->
        toggleEndpointOptions(tmpl)

    'change select[name="testSpeciesMamm"]': (evt, tmpl) ->
        toggleEndpointOptions(tmpl)

    'change select[name="endpoint"]': (evt, tmpl) ->
        toggleEndpointTestOptions(tmpl)


genotoxFormEvents = $.extend(true, {}, share.abstractFormEvents, genotoxFormExtension)
Template.genotoxForm.events(genotoxFormEvents)

Template.genotoxForm.rendered = ->
    toggleDataClassFields(@)
    toggleEndpointOptions(@)
    share.toggleQA(@, @.data.isQA)
    $(@.findAll('.helpPopovers')).popover
            delay: {show: 500, hide: 100}
            trigger: "hover"
            placement: "auto"
