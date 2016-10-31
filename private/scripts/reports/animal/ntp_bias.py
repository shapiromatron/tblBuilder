from docxUtils.reports import DOCXReport


class NtpAnimalBias(DOCXReport):
    """
    NTP animal potential bias report.
    """

    def create_content(self):
        doc = self.doc
        d = self.context

        self.setLandscape()

        txt = u"{} {}: potential bias".format(
            d["table"]["volumeNumber"],
            d["table"]["monographAgent"],
        )
        doc.add_heading(txt, level=1)
        doc.add_paragraph(d["table"]["name"])

    def get_template_fn(self):
        return "base.docx"
