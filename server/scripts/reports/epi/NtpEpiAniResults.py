from ..utils import TableMaker, DOCXReport


class NtpEpiAniResults(DOCXReport):

    def build_res_tbl(self, caption, studies):

        colWidths = [1.5, 1.5, 1.5, 1.0, 1.0, 1.0, 2.5]
        styles = {
            "title": "RoCTabletitle",
            "header": "RoCColumnheading",
            "body": "RoCTablebody",
            "subheading" : None
        }
        tbl = TableMaker(colWidths, styles=styles, numHeaders=2, tblStyle="ntpTbl")

        # write title
        tbl.new_tbl_title(caption)

        # write header
        tbl.new_th(1, 0, "Reference & year, animal, study duration")
        tbl.new_th(1, 1, "Substance & purity")
        tbl.new_th(1, 2, "Dosing regimen")
        tbl.new_th(1, 3, "Dose levels")
        tbl.new_th(1, 4, "# animals at sacrifice")
        tbl.new_th(1, 5, "Tumor incidence (n/N) (%)")
        tbl.new_th(1, 6, "Comments, strengths, and limitations")

        # write additional rows
        rows = 2
        for st in studies:

            # get row-span for each study
            for res in st["results"]:
                res["_rowspan"] = len(res["riskEstimates"])+1
                if res["hasTrendTest"]:
                    res["_rowspan"] += 1

            st_rowspan = sum(res["_rowspan"] for res in st["results"])

            # Column A
            runs = [
                tbl.new_run(st["reference"]["name"], b=True),
                tbl.new_run(st.get("eligibilityCriteria", "")),
                tbl.new_run(st.get("enrollmentDates", "")),
            ]
            tbl.new_td_run(rows, 0, runs, rowspan=st_rowspan)

            # Column B
            runs = [
                tbl.new_run(st["location"]),
                tbl.new_run(st["coexposuresList"]),
            ]
            tbl.new_td_run(rows, 1, runs, rowspan=st_rowspan)

            # Column C
            runs = [
                tbl.new_run(st.get("exposureAssessmentNotes", ""))
            ]
            tbl.new_td_run(rows, 2, runs, rowspan=st_rowspan)

            # Columns D, E, F
            irows = rows
            covariates = []
            for res in st["results"]:
                runs = [
                    tbl.new_run(res.get("covariatesControlledText", ""), b=True, newline=False),
                ]
                tbl.new_td_run(irows, 3, runs, colspan=3, style="Tablesubheadings")

                for i, est in enumerate(res["riskEstimates"]):
                    tbl.new_td_txt(irows+i+1, 3, est["exposureCategory"])
                    tbl.new_td_txt(irows+i+1, 4, unicode(est["numberExposed"]))
                    txt = u"{}/{} ({}%)".format(est["riskLow"], est["riskHigh"], est["riskMid"])
                    tbl.new_td_txt(irows+i+1, 5, txt)

                if res["hasTrendTest"]:
                    runs = [
                        tbl.new_run("Trend-test ", newline=False),
                        tbl.new_run("P", i=True, newline=False),
                        tbl.new_run("-value: {}".format(res["trendTest"]), newline=False),
                    ]
                    tbl.new_td_run(irows+i+2, 3, runs, colspan=3)

                covariates.extend(res["covariates"])
                irows += res["_rowspan"]

            # Column G
            covariates = u", ".join(set(covariates))
            runs = [
                tbl.new_run(covariates),
                tbl.new_run("Strengths: ", b=True, newline=False),
                tbl.new_run(st["strengths"]),
                tbl.new_run("Limitations: ", b=True, newline=False),
                tbl.new_run(st["limitations"]),
                tbl.new_run("Other comments: ", b=True, newline=False),
                tbl.new_run(st["notes"], newline=False),
            ]
            tbl.new_td_run(rows, 6, runs, rowspan=st_rowspan)

            rows += st_rowspan

        tbl.render(self.doc)

    def create_content(self):
        doc = self.doc
        d = self.context

        self.setLandscape()

        # title
        txt = "{} {}: Results by organ-site".format(d["table"]["volumeNumber"], d["table"]["monographAgent"])
        p = doc.paragraphs[0]
        p.text = txt
        p.style = "Title"

        # build table for each organ-site
        for tbl in sorted(d["tables"], key=lambda v: v["caption"]):
            txt = "Table X: {}".format(tbl["caption"])
            self.build_res_tbl(txt, tbl["studies"])
            self.doc.add_page_break()

    def get_template_fn(self):
        return "baseRoC.docx"
