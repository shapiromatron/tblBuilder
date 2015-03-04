import os
import sys
import json

import reports

if __name__ == "__main__":

    fn = os.path.join(os.path.dirname(os.path.abspath(__file__)), "base.docx")
    report_name = sys.argv[1]
    context = json.loads(sys.argv[2].decode('utf8'))

    try:
        Reporter = getattr(reports, report_name)
    except AttributeError:
        raise ValueError("Report name not found.")

    report = Reporter(fn, context)
    docx = report.build_report()
    print docx.read().encode('base64')
