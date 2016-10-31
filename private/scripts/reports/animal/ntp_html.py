from docxUtils.reports import DOCXReport


class NtpAnimalHtmlTables(DOCXReport):
    """
    Attempt to recreate HTML table in a Word-report.
    """

    def create_content(self):
        doc = self.doc
        d = self.context

        self.setLandscape()

        txt = u"{} {}: Animal evidence".format(
            d["table"]["volumeNumber"],
            d["table"]["monographAgent"],
        )
        doc.add_heading(txt, level=1)
        doc.add_paragraph(d["table"]["name"])

    def get_template_fn(self):
        return "base.docx"
