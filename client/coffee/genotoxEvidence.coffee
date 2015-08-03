# GENOTOX MAIN -----------------------------------------------------------------
Template.genotoxMain.helpers(share.abstractMainHelpers)

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

Template.genotoxRow.helpers

    getCol1: () ->
        return @dataClass

    getCol2: () ->
        return shared.getGenotoxTestSystemDesc(@)

    getCol3: () ->
        return "#{@endpoint}/<br>#{@endpointTest}"

    getCol4: () ->
        if @dualResult
            txt = @resultNoMetabolic
        else
            txt = @result

        if @dataClass is "Human in vivo" and @significance
            txt +=  "&nbsp;" + @significance

        return txt

    getCol5: () ->
        if @dualResult
            txt = @resultMetabolic
        else
            if @dataClass.indexOf('vitro')>=0 or @dataClass.indexOf('Non-mammalian')>=0
                txt = ""
            else
                txt = "NA"

        return txt

    getCol6: () ->
        txt = @agent
        if @led
            txt += ",<br>#{@led} #{@units}"

        if @dosesTested?
            txt += ",<br>[#{@dosesTested}&nbsp;#{@units}]"

        if @dosingDuration
            txt += ", #{@dosingDuration}"

        return txt

    getCol7: () ->
        return @comments


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
    dataClass = tmpl.find('select[name="dataClass"]').value
    phylo = tmpl.find('select[name="phylogeneticClass"]').value
    shows = ""
    hides = ""
    switch dataClass
        when "Non-mammalian"
            shows = ".non_mamm, .doses, .vitro"
            hides = ".mamm_vitro, .ani_vivo, .human_vivo, .concs"
            if phylo is "Other (fish, worm, bird, etc)"
                shows += ", .expvivo"
            else
                hides += ", .expvivo"
        when "Mammalian and human in vitro"
            shows = ".mamm_vitro, .doses, .vitro"
            hides = ".non_mamm, .ani_vivo, .human_vivo, .concs, .expvivo"
        when "Animal in vivo"
            shows = ".ani_vivo, .concs, .expvivo"
            hides = ".non_mamm, .mamm_vitro, .human_vivo, .doses, .vitro"
        when "Human in vivo"
            shows = ".human_vivo, .concs"
            hides = ".non_mamm, .mamm_vitro, .ani_vivo, .doses, .vitro, .expvivo"
        else
            console.log("unknown data-type: {#dataClass}")

    $(tmpl.findAll(shows)).show()
    $(tmpl.findAll(hides)).hide()

togglePhyloFields = (tmpl) ->
    dataClass = tmpl.find('select[name="dataClass"]').value
    phylo = tmpl.find('select[name="phylogeneticClass"]').value

    if dataClass isnt "Non-mammalian"
        return

    if shared.isGenotoxAcellular(dataClass, phylo)
        $(tmpl.findAll('.isAcellular')).show()
        $(tmpl.findAll('.isntAcellular')).hide()
    else
        $(tmpl.findAll('.isAcellular')).hide()
        $(tmpl.findAll('.isntAcellular')).show()

toggleEndpointOptions = (tmpl) ->
    dataClass = tmpl.find('select[name="dataClass"]').value
    phylo = tmpl.find('select[name="phylogeneticClass"]').value
    mamm = tmpl.find('select[name="testSpeciesMamm"]').value
    tox = "Genotox"  # todo: fix

    switch dataClass
        when "Non-mammalian"
            obj = shared.mechanisticTestCrosswalk[dataClass][phylo][tox]
        when "Mammalian and human in vitro"
            obj = shared.mechanisticTestCrosswalk[dataClass][mamm][tox]
        when "Animal in vivo"
            obj = shared.mechanisticTestCrosswalk[dataClass][tox]
        when "Human in vivo"
            obj = shared.mechanisticTestCrosswalk[dataClass][tox]
        else
            console.log("unknown data-type: #{dataClass}")

    vals = (key for key, v of obj)
    options = for val in vals
        "<option value='#{val}'>#{val}</option>"

    selector = $(tmpl.find('select[name="endpoint"]'))
    if tmpl.data.isNew
        existing = "option[value='#{ selector.val() }']"
    else
        existing = "option[value='#{ tmpl.data.endpoint }']"

    selector.html(options)
    found = selector.find(existing)
    if (found.length > 0)
        found.prop('selected', true)

    toggleEndpointTestOptions(tmpl)

toggleEndpointTestOptions = (tmpl) ->
    dataClass = tmpl.find('select[name="dataClass"]').value
    phylo = tmpl.find('select[name="phylogeneticClass"]').value
    mamm = tmpl.find('select[name="testSpeciesMamm"]').value
    tox = "Genotox"  # todo: fix
    endpoint = tmpl.find('select[name="endpoint"]').value

    switch dataClass
        when "Non-mammalian"
            vals = shared.mechanisticTestCrosswalk[dataClass][phylo][tox][endpoint]
        when "Mammalian and human in vitro"
            vals = shared.mechanisticTestCrosswalk[dataClass][mamm][tox][endpoint]
        when "Animal in vivo"
            vals = shared.mechanisticTestCrosswalk[dataClass][tox][endpoint]
        when "Human in vivo"
            vals = shared.mechanisticTestCrosswalk[dataClass][tox][endpoint]
        else
            console.log("unknown data-type: {#dataClass}")

    options = for val in vals
        "<option value='#{val}'>#{val}</option>"

    selector = $(tmpl.find('select[name="endpointTest"]'))
    if tmpl.data.isNew
        existing = "option[value='#{ selector.val() }']"
    else
        existing = "option[value='#{ tmpl.data.endpointTest }']"

    selector.html(options)
    found = selector.find(existing)
    if (found.length > 0)
        found.prop('selected', true)

toggleDualResult = (tmpl) ->
    dual = $(tmpl.find('input[name="dualResult"]')).prop('checked')
    dataClass = tmpl.find('select[name="dataClass"]').value
    if dual and dataClass in ["Non-mammalian", "Mammalian and human in vitro"]
        $(tmpl.findAll('.isDualResult')).show()
        $(tmpl.findAll('.isntDualResult')).hide()
    else
        $(tmpl.findAll('.isDualResult')).hide()
        $(tmpl.findAll('.isntDualResult')).show()

# copy but override abstract object
genotoxFormExtension =

    'change select[name="dataClass"]': (evt, tmpl) ->
        toggleDataClassFields(tmpl)
        togglePhyloFields(tmpl)
        toggleEndpointOptions(tmpl)
        toggleDualResult(tmpl)

    'change select[name="phylogeneticClass"]': (evt, tmpl) ->
        toggleDataClassFields(tmpl)
        togglePhyloFields(tmpl)
        toggleEndpointOptions(tmpl)

    'click input[name="dualResult"]': (evt, tmpl) ->
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
            html: true
            placement: "auto"
