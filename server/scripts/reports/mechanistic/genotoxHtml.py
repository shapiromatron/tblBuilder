from docxUtils.reports import DOCXReport
from docxUtils.tables import TableMaker


class GenotoxHtmlTables(DOCXReport):

    def buildNonMammInVitroTbl(self):
        colWidths = [1.2, 1.3, 1.1, 0.7, 0.7, 1, 2, 1]
        tbl = TableMaker(colWidths, numHeaders=2, tblStyle="ntpTbl")

        # write title
        txt = "Non-mammalian genotoxicty data"
        tbl.new_th(0, 0, txt, colspan=8)

        # write header
        tbl.new_th(1, 0, "Phylogenetic class")
        tbl.new_th(1, 1, "Test system\n(Species; strain)")
        tbl.new_th(1, 2, "Endpoint/\ntest")
        tbl.new_th(1, 3, "Results/\nResults without metabolic activation")
        tbl.new_th(1, 4, "Results with metabolic activation")
        tbl.new_th(1, 5, "Agent, Dose/units (LED or HID)")
        tbl.new_th(1, 6, "Comments")
        tbl.new_th(1, 7, "Reference")

        row = 2
        for d in self.context["nonMammalianInVitro"]:

            tbl.new_td_txt(row, 0, d["phylogeneticClass"])

            tbl.new_td_txt(row, 1, d["wrd_testSystem"])

            txt = u"{}/\n{}".format(d["endpoint"], d["endpointTest"])
            tbl.new_td_txt(row, 2, txt)

            tbl.new_td_txt(row, 3, d["wrd_resultA"])
            tbl.new_td_txt(row, 4, d["wrd_resultB"])
            tbl.new_td_txt(row, 5, d["wrd_experimental"])
            tbl.new_td_txt(row, 6, d["wrd_comments"])
            tbl.new_td_txt(row, 7, d["reference"]["name"])
            row += 1

        tbl.render(self.doc)
        self.doc.add_page_break()

    def buildMammInVitroTbl(self):
        colWidths = [1.2, 1.5, 1.5, 0.7, 0.7, 0.7, 1.7, 1]
        tbl = TableMaker(colWidths, numHeaders=2, tblStyle="ntpTbl")

        # write title
        txt = "Human and mammalian in vitro genotoxicty data"
        tbl.new_th(0, 0, txt, colspan=8)

        # write header
        tbl.new_th(1, 0, "Species")
        tbl.new_th(1, 1, "Tissue, cell line")
        tbl.new_th(1, 2, "Endpoint/\ntest")
        tbl.new_th(1, 3, "Results/\nResults without metabolic activation")
        tbl.new_th(1, 4, "Results with metabolic activation")
        tbl.new_th(1, 5, "Agent, Dose\n(LED or HID)")
        tbl.new_th(1, 6, "Comments")
        tbl.new_th(1, 7, "Reference")

        row = 2
        for d in self.context["mammalianInVitro"]:

            tbl.new_td_txt(row, 0, d["wrd_colA"])

            tbl.new_td_txt(row, 1, d["tissueCellLine"])

            txt = u"{}/\n{}".format(d["endpoint"], d["endpointTest"])
            tbl.new_td_txt(row, 2, txt)

            tbl.new_td_txt(row, 3, d["wrd_resultA"])
            tbl.new_td_txt(row, 4, d["wrd_resultB"])

            txt = u"{}/\n{} {}".format(d["agent"], d["wrd_led"], d["units"])
            tbl.new_td_txt(row, 5, txt)

            tbl.new_td_txt(row, 6, d["wrd_comments"])
            tbl.new_td_txt(row, 7, d["reference"]["name"])
            row += 1

        tbl.render(self.doc)
        self.doc.add_page_break()

    def buildAniVivoTbl(self):
        colWidths = [1.3, 0.9, 0.9, 0.5, 1.2, 1.4, 1.8, 1]
        tbl = TableMaker(colWidths, numHeaders=2, tblStyle="ntpTbl")

        # write title
        txt = "Animal in vivo genotoxicity data"
        tbl.new_th(0, 0, txt, colspan=8)

        # write header
        tbl.new_th(1, 0, "Species, strain, sex")
        tbl.new_th(1, 1, "Tissue")
        tbl.new_th(1, 2, "Endpoint/\ntest")
        tbl.new_th(1, 3, "Results")
        tbl.new_th(1, 4, "Agent, doses, and  LED/HID")
        tbl.new_th(1, 5, "Route, duration, dosing regimen")
        tbl.new_th(1, 6, "Comments")
        tbl.new_th(1, 7, "Reference")

        row = 2
        for d in self.context["animalInVivo"]:

            txt = u"{} {} {}".format(d["species"], d["strain"], d["sex"])
            tbl.new_td_txt(row, 0, txt)

            tbl.new_td_txt(row, 1, d["tissueAnimal"])

            txt = u"{}/\n{}".format(d["endpoint"], d["endpointTest"])
            tbl.new_td_txt(row, 2, txt)

            tbl.new_td_txt(row, 3, d["result"])

            txt = u"{}\n{}\nLED/HID: {} {}".format(d["agent"], d["dosesTested"], d["wrd_led"], d["units"])
            tbl.new_td_txt(row, 4, txt)

            txt = u"{}; {}; {}".format(d["dosingRoute"], d["dosingDuration"], d["dosingRegimen"])
            tbl.new_td_txt(row, 5, txt)

            tbl.new_td_txt(row, 6, d["wrd_comments"])
            tbl.new_td_txt(row, 7, d["reference"]["name"])
            row += 1

        tbl.render(self.doc)
        self.doc.add_page_break()

    def buildHumanVivoTbl(self):
        colWidths = [1.0, 1.1, 1.6, 1.5, 0.8, 2, 1]
        tbl = TableMaker(colWidths, numHeaders=2, tblStyle="ntpTbl")

        # write title
        txt = "Human in vivo genotoxicity data"
        tbl.new_th(0, 0, txt, colspan=7)

        # write header
        tbl.new_th(1, 0, "Tissue")
        tbl.new_th(1, 1, "Cell type\n(if specified)")
        tbl.new_th(1, 2, "Description of exposed and controls")
        tbl.new_th(1, 3, "Endpoint/\ntest")
        tbl.new_th(1, 4, "Response/ significance  ")
        tbl.new_th(1, 5, "Comments")
        tbl.new_th(1, 6, "Reference")

        row = 2
        for d in self.context["humanInVivo"]:
            tbl.new_td_txt(row, 0, d["tissueHuman"])
            tbl.new_td_txt(row, 1, d["cellType"])
            tbl.new_td_txt(row, 2, d["exposureDescription"])

            txt = u"{}/\n{}".format(d["endpoint"], d["endpointTest"])
            tbl.new_td_txt(row, 3, txt)

            txt = u"{} {}".format(d["result"], d["wrd_significance"])
            tbl.new_td_txt(row, 4, txt)

            tbl.new_td_txt(row, 5, d["comments"])
            tbl.new_td_txt(row, 6, d["reference"]["name"])
            row += 1

        tbl.render(self.doc)
        self.doc.add_page_break()

    def create_content(self):
        self.setLandscape()
        doc = self.doc
        d = self.context

        txt = u"{} {}: Genotoxicity evidence summary".format(
            d["table"]["volumeNumber"],
            d["table"]["monographAgent"],
        )
        p = doc.paragraphs[0]
        p.text = txt
        p.style = "Title"
        doc.add_paragraph(d["table"]["name"])
        self.buildNonMammInVitroTbl()
        self.buildMammInVitroTbl()
        self.buildAniVivoTbl()
        self.buildHumanVivoTbl()

    def get_template_fn(self):
        return "base.docx"
