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
Template.genotoxForm.helpers
    getGenotoxDataClass: ->
        return genotoxDataClass

    getPhylogeneticClasses: ->
        return phylogeneticClasses

    getMammalianTestSpecies: ->
        return mammalianTestSpecies

    getSexes: ->
        return sexes

    getGenotoxResultOptions: ->
        return genotoxResultOptions

toggleDataClassFields = (tmpl) ->
    # toggle between required fields for multiple data types
    selector = tmpl.find('select[name="dataClass"]')
    shows = ""
    hides = ""
    switch $(selector).find('option:selected')[0].value
        when "Non-mammalian in vitro"
            shows = ".non_mamm_vitro, .doses"
            hides = ".mamm_vitro, .ani_vivo, .human_vivo, .concs"
        when "Mammalian and human in vitro"
            shows = ".mamm_vitro, .doses"
            hides = ".non_mamm_vitro, .ani_vivo, .human_vivo, .concs"
        when "Animal in vivo"
            shows = ".ani_vivo, .concs"
            hides = ".non_mamm_vitro, .mamm_vitro, .human_vivo, .doses"
        when "Human in vivo, .concs"
            shows = ".human_vivo"
            hides = ".non_mamm_vitro, .mamm_vitro, .ani_vivo, .doses"
        else
            console.log("unknown data-type")

    $(tmpl.findAll(shows)).show()
    $(tmpl.findAll(hides)).hide()


togglePhyloFields = (tmpl) ->
    if tmpl.find('select[name="phylogeneticClass"]').value is "Acellular systems"
        $(tmpl.findAll('.isAcellular')).show()
        $(tmpl.findAll('.isntAcellular')).hide()
    else
        $(tmpl.findAll('.isAcellular')).hide()
        $(tmpl.findAll('.isntAcellular')).show()


toggleEndpointOptions = (tmpl) ->
    dataType = tmpl.find('select[name="dataClass"]').value
    phylo = tmpl.find('select[name="phylogeneticClass"]').value
    mamm = tmpl.find('select[name="testSpeciesMamm"]').value
    tox = "Genotox"  # todo: fix

    switch dataType
        when "Non-mammalian in vitro"
            obj = share.mechanisticTestCrosswalk[dataType][phylo][tox]
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

    selector = $(tmpl.find('select[name="endpoint"]'))
    existing = "option[value='#{ selector.val() }']"
    selector.html(options)
    found = selector.find(existing)
    if (found.length > 0)
        found.prop('selected', true)

    toggleEndpointTestOptions(tmpl)


toggleEndpointTestOptions = (tmpl) ->
    dataType = tmpl.find('select[name="dataClass"]').value
    phylo = tmpl.find('select[name="phylogeneticClass"]').value
    mamm = tmpl.find('select[name="testSpeciesMamm"]').value
    tox = "Genotox"  # todo: fix
    endpoint = tmpl.find('select[name="endpoint"]').value

    switch dataType
        when "Non-mammalian in vitro"
            vals = share.mechanisticTestCrosswalk[dataType][phylo][tox][endpoint]
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

    selector = $(tmpl.find('select[name="endpointTest"]'))
    existing = "option[value='#{ selector.val() }']"
    selector.html(options)
    found = selector.find(existing)
    if (found.length > 0)
        found.prop('selected', true)


toggleDualResult = (tmpl) ->
    dataType = tmpl.find('select[name="dataClass"]').value
    phylo = tmpl.find('select[name="phylogeneticClass"]').value
    duals = ["Acellular systems", "Prokaryote (bacteria)", "Lower eukaryote (yeast, mold)"]

    if dataType is "Non-mammalian in vitro" and phylo in duals
        $(tmpl.findAll('.isDualResult')).show()
        $(tmpl.findAll('.isntDualResult')).hide()
    else
        $(tmpl.findAll('.isDualResult')).hide()
        $(tmpl.findAll('.isntDualResult')).show()


# copy but override abstract object
genotoxFormExtension =

    'change select[name="dataClass"]': (evt, tmpl) ->
        toggleDataClassFields(tmpl)
        toggleEndpointOptions(tmpl)
        toggleDualResult(tmpl)

    'change select[name="phylogeneticClass"]': (evt, tmpl) ->
        togglePhyloFields(tmpl)
        toggleEndpointOptions(tmpl)
        toggleDualResult(tmpl)

    'change select[name="testSpeciesMamm"]': (evt, tmpl) ->
        toggleEndpointOptions(tmpl)

    'change select[name="endpoint"]': (evt, tmpl) ->
        toggleEndpointTestOptions(tmpl)


genotoxFormEvents = $.extend(true, {}, share.abstractFormEvents, genotoxFormExtension)
Template.genotoxForm.events(genotoxFormEvents)

Template.genotoxForm.rendered = ->
    toggleDataClassFields(@)
    togglePhyloFields(@)
    toggleEndpointOptions(@)
    toggleDualResult(@)
    share.toggleQA(@, @.data.isQA)
    $(@.findAll('.helpPopovers')).popover
            delay: {show: 500, hide: 100}
            trigger: "hover"
            placement: "auto"
