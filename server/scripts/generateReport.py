import os
import sys
import json

import reports


def generate_report(root_path, report_type, context):
    try:
        Reporter = getattr(reports, report_type)
    except AttributeError:
        raise ValueError("Report name not found.")

    report = Reporter(root_path, context)
    docx = report.build_report()
    return docx.read().encode('base64')


if __name__ == "__main__":

    root_path = os.path.dirname(os.path.abspath(__file__))

    if len(sys.argv)>1:
        report_type = sys.argv[1]
        context = json.loads(sys.argv[2].decode('utf8'))
        b64 = generate_report(root_path, report_type, context)
        print b64
    else:
        for line in sys.stdin:
            payload = json.loads(line)
            report_type = payload.get("report_type")
            context = payload.get("context")
            b64 = generate_report(root_path, report_type, context)
            print json.dumps({"report": b64})
