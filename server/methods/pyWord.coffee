Future = Meteor.npmRequire('fibers/future')
PythonShell = Meteor.npmRequire('python-shell')


pyWordHelper = (script, context, fut) ->
    # Helper function to run a python script and return the result.
    options =
        scriptPath: Meteor.settings.python_scripts_path
        args: [context]
        pythonPath: Meteor.settings.python_path

    cb = (err, res) ->
        if err
            console.log("An error occurred: ")
            console.log(err)
            return undefined
        return res.join("")

    PythonShell.run(script, options, (err, res) -> fut.return(cb(err, res)))


Meteor.methods

    pyWordReport: (tbl_id) ->
        @unblock()
        fut = new Future()
        context = JSON.stringify({test: "Go-carts are ♀♂ fun.", array: [1,23,123123,11321]})
        pyWordHelper("epi.py", context, fut)
        return fut.wait()
