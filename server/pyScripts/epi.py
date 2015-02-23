import os, sys
import json

from docx import Document

def getContext(inpfn):
    if os.path.exists(inpfn):
        with open(inpfn, 'r') as f:
            context = f.read()
        return json.loads(context)

def createReport(context):
    document = Document()
    document.add_heading(context.get("input", "None!"), 0)
    return document

def writeReport(document, outfn):
    if os.path.exists(outfn):
        os.remove(outfn)

    document.save(outfn)


if __name__ == "__main__":
    inpfn = sys.argv[1]
    outfn = sys.argv[2]
    context = getContext(inpfn)
    report = createReport(context)
    writeReport(report, outfn)
