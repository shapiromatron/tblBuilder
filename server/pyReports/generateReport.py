import sys
import json

import reports


if __name__ == "__main__":
    report_name = sys.argv[1]
    context = json.loads(sys.argv[2].decode('utf8'))
    try:
        Reporter = getattr(reports, report_name)
        report = Reporter(context)
        docx = report.build_report()
        print docx.read().encode('base64')
    except AttributeError:
        raise ValueError("Report name not found.")
