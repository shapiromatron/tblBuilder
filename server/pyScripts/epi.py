import sys
import json
from StringIO import StringIO

from docx import Document

def getContext(context):
    return json.loads(context)

def createReport(context):
    document = Document()
    document.add_heading(context.get("test", "None!"), 0)
    return document

def writeReport(document):
    docx = StringIO()
    document.save(docx)
    docx.seek(0)
    print docx.read().encode('base64')


if __name__ == "__main__":
    context = getContext(sys.argv[1].decode('utf8'))
    report = createReport(context)
    writeReport(report)
