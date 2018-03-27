"""
Generate Word reports using python. Two input values are required:

1) The report class name, for example: NtpAnimalHtmlTables
2) The JSON formatted context

Inputs can be passed either via the command line:

    source ~/.virtualenvs/tblBuilder/bin/activate
    cd ~/dev/tblBuilder/private/scripts
    python generateReport.py NtpAnimalHtmlTables ~/Desktop/debug.json

Or, by passing via stdin.


The output file will return via:
- when using command line, will be written to disk to input file path + ".docx"
- when passing via stdin, the output will be written to stdout w/ base64 encoding

"""
import os
import sys
import json
import base64
from textwrap import dedent

import reports

ROOT_PATH = os.path.dirname(os.path.abspath(__file__))


def generate_report(root_path, report_type, context):
    try:
        Reporter = getattr(reports, report_type)
    except AttributeError:
        raise ValueError(f"Report name not found: {report_type}")

    report = Reporter(root_path, context)
    docx = report.build_report()
    return docx


def run_command_line(report_type, fn):
    fn = os.path.expanduser(fn)
    outfn = fn + '.docx'
    with open(fn, 'r') as f:
        context = json.loads(f.read())
    sys.stdout.write(dedent(f'''\
        Generating report {report_type}
        '''))
    docx = generate_report(ROOT_PATH, report_type, context)
    with open(outfn, 'wb') as f:
        f.write(docx.getvalue())
    sys.stdout.write(dedent(f'''\
        Writing output to {report_type}
        '''))


def run_from_stdin():
    for line in sys.stdin:
        payload = json.loads(line)
        report_type = payload.get("report_type")
        context = payload.get("context")
        docx = generate_report(ROOT_PATH, report_type, context)
        b64 = base64.encodestring(docx.read()).decode('utf-8')
        print((json.dumps({"report": b64})))


if __name__ == "__main__":
    if len(sys.argv) > 1:
        if len(sys.argv) != 3:
            raise ValueError('2 inputs required: 1) class and 2) JSON path')
        run_command_line(sys.argv[1], sys.argv[2])
    else:
        run_from_stdin()
