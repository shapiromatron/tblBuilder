# -*- coding: utf-8 -*-
from textwrap import dedent

from docxUtils.reports import DOCXReport
from docxUtils.tables import TableMaker


class ExposureHtmlTable(DOCXReport):
    def create_content(self):
        self.setLandscape()
        doc = self.doc
        d = self.context

        txt = f'{d["table"]["volumeNumber"]} {d["table"]["monographAgent"]}: Exposure evidence'
        p = doc.paragraphs[0]
        p.text = txt
        p.style = "Title"
        doc.add_paragraph(d["table"]["name"])
        self.build_table()

    COLUMN_WIDTHS = (1.3, 0.9, 0.9, 1.0, 1.30, 0.9, 2.7)

    def build_row(self, d):

        row = 0
        rowspan = max(len(d["results"]), 1)
        tbl = TableMaker(
            self.COLUMN_WIDTHS, numHeaders=0, firstRowCaption=False, tblStyle="ntpTbl"
        )

        txt = d["reference"]["name"]
        tbl.new_td_txt(row, 0, txt, rowspan=rowspan)

        txt = dedent(
            f"""\
            {d["country"]}
            {d["collectionDate"]}"""
        )
        tbl.new_td_txt(row, 1, txt, rowspan=rowspan)

        occ = (
            dedent(
                f"""
                {d["occupationInfo"]}"""
            )
            if d["occupationInfo"]
            else ""
        )
        txt = f'{d["occupation"]}{occ}' if d["isOccupational"] else "N/A"
        tbl.new_td_txt(row, 2, txt, rowspan=rowspan)

        if len(d["results"]) == 0:
            tbl.new_td_txt(row, 3, "-")
            tbl.new_td_txt(row, 4, "-")
            tbl.new_td_txt(row, 5, "-")
        else:
            for i, d2 in enumerate(d["results"]):
                txt = dedent(
                    f"""\
                    {d2["samplingMatrix"]};
                    {d2["samplingApproach"]};
                    {d2["numberMeasurements"]};
                    {d2["measurementDuration"]}"""
                )
                tbl.new_td_txt(i, 3, txt)

                txt = dedent(
                    f"""\
                    {d2["agent"]}
                    {d2["exposureLevel"]} {d2["units"]}
                    {d2["exposureLevelDescription"]}"""
                )
                tbl.new_td_txt(i, 4, txt)

                txt = d2["exposureRangePrint"]
                tbl.new_td_txt(i, 5, txt)

        txt = d["comments"] or ""
        tbl.new_td_txt(row, 6, txt, rowspan=rowspan)

        return tbl

    def build_table(self):
        tbl = TableMaker(self.COLUMN_WIDTHS, numHeaders=2, tblStyle="ntpTbl")

        # write title
        txt = "Occupational exposure data"
        tbl.new_th(0, 0, txt, colspan=7)

        # write header
        tbl.new_th(1, 0, "Reference")
        tbl.new_th(1, 1, "Location,\ncollection date")
        tbl.new_th(1, 2, "Occupation description")
        tbl.new_th(1, 3, "Sampling matrix, approach,\nN, duration")
        tbl.new_th(1, 4, "Agent,\nexposure level")
        tbl.new_th(1, 5, "Exposure range")
        tbl.new_th(1, 6, "Comments/additional data")

        docx_tbl = tbl.render(self.doc)

        # write rows
        for d in self.context["exposures"]:
            inner_tbl = self.build_row(d)
            docx_tbl_inner = inner_tbl.render(self.doc)
            docx_tbl._cells.extend(docx_tbl_inner._cells)

    def get_template_fn(self):
        return "base.docx"
