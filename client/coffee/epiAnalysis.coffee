# EPI ORGAN-SITE VIEW ----------------------------------------------------------
epiOrganSiteMainHelpers =

    getOrganSiteOptions: () ->
        return _.chain(EpiResult.find().fetch())
                .pluck("organSite")
                .uniq()
                .sort()
                .map((d) -> return "<option>#{d}</option>")
                .value()

    object_list: () ->
        tmpl = Template.instance()
        organSites = tmpl.organSites.get()
        results = EpiResult.find({"organSite": {$in: organSites}}).fetch()
        results.forEach((d) -> d.desc = EpiDescriptive.findOne(d.parent_id))
        return results

    showPlots: ->
        Session.get("epiRiskShowPlots")


_.extend(
    epiOrganSiteMainHelpers,
    share.abstractMainHelpers
)
Template.epiOrganSiteMain.helpers(epiOrganSiteMainHelpers)


Template.epiOrganSiteMain.events

    'change #organSiteSelector': (evt, tmpl) ->
        tmpl.organSites.set($(evt.target).val() or [])
        share.toggleRiskPlot()


Template.epiOrganSiteMain.created = () ->
    @subscribe('epiCollective', @data.volumeNumber, @data.monographAgent)
    @organSites = new ReactiveVar([])
