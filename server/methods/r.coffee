r = Meteor.npmRequire('rserve-client')
Future = Meteor.npmRequire('fibers/future')

rClientHelper = (cmd, fut) ->
    result = undefined
    r.connect Meteor.settings.r_host, Meteor.settings.r_port, (err, client) ->
        client.evaluate cmd, (err, res) ->
            if (err)
                console.log(err)
            else
                result = JSON.parse(res)

            client.end()
            return fut.return(result)

extractValues = (_id) ->
    res = AnimalEndpointEvidence.findOne(_id)
    v = {
        "ns": [],
        "incs": []
    }
    for grp in res.endpointGroups
        matches = grp.incidence.match(/([\d]+)\/([\d]+)/)
        if matches.length < 3 then return undefined
        v.ns.push(parseInt(matches[2], 10))
        v.incs.push(parseInt(matches[1], 10))

    return v

Meteor.methods

    getAnimalBioassayStatistics: (_id) ->
        @unblock()
        fut = new Future()
        script = Meteor.settings.scripts_path + "/R/stats.R"
        data = extractValues(_id)
        if data
            data = JSON.stringify(data)
        else
            return fut.return(undefined)

        cmd = """
        source('#{script}')
        a<-getStats('#{data}')
        """
        rClientHelper(cmd, fut)
        return fut.wait()
