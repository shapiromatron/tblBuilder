import zerorpc
from docx import Document
from StringIO import StringIO
import time

import logging
logging.basicConfig()

class HelloRPC(object):

    def hello(self, name):
        time.sleep(5)
        return "Hello, %s" % name

    def createReport(self, context):
        document = Document()
        document.add_heading("big old title", 0)
        docx_file = StringIO()
        document.save(docx_file)
        docx_file.seek(0)
        return docx_file.read().encode('base64')


s = zerorpc.Server(HelloRPC())
s.bind("tcp://127.0.0.1:4242")
s.run()
