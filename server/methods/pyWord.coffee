fs = Meteor.npmRequire('fs')
exec = Meteor.npmRequire("child_process").exec
Fiber = Meteor.npmRequire('fibers')
Future = Meteor.npmRequire('fibers/future')
DocxGen = Meteor.npmRequire('docxtemplater')


downloadTemplate = (temp_docx) ->
    blob = fs.readFileSync(temp_docx, "binary")
    docx = new DocxGen(blob)
    return docx.getZip().generate({type: "string"})


Meteor.methods

    pyWordReport: (tbl_id) ->
        @unblock()

        py = Meteor.settings.python_path
        fn = Meteor.settings.python_scripts_path + "/epi.py"
        temp_path = Meteor.settings.temp_path
        temp_root = Math.random().toString(36).replace(/[^a-zA-Z0-9]+/g, '')
        temp_json = "#{temp_path}/#{temp_root}.json"
        temp_docx = "#{temp_path}/#{temp_root}.docx"

        cmd = "#{py} #{fn} #{temp_json} #{temp_docx}"

        fs.writeFileSync(temp_json, '{"input": "one"}')

        fut = new Future()
        exec cmd, (error, stdout, stderr) ->
            fib = new Fiber () ->
                fut.return(downloadTemplate(temp_docx))
            fib.run()

        return fut.wait()
