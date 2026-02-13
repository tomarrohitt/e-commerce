package invoice

import (
	"bytes"
	"fmt"
	"strings"
	"time"

	"github.com/jung-kurt/gofpdf"
	"github.com/tomarrohitt/invoice-go/internal/events"
)

type PDFGenerator struct {
	PrimaryColor []int
	TextColor    []int
	GrayColor    []int
}

func NewPDFGenerator() *PDFGenerator {
	return &PDFGenerator{
		PrimaryColor: []int{147, 51, 234},
		TextColor:    []int{31, 41, 55},
		GrayColor:    []int{243, 244, 246},
	}
}

func (g *PDFGenerator) Generate(event events.OrderPaidEvent, invoiceID string) ([]byte, error) {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.SetMargins(15, 15, 15)
	pdf.AddPage()

	g.generateHeader(pdf)
	g.generateInfoSection(pdf, event, invoiceID)
	g.generateTable(pdf, event)
	g.generateTotals(pdf, event)
	g.generateFooter(pdf)

	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

func (g *PDFGenerator) generateHeader(pdf *gofpdf.Fpdf) {
	pdf.SetFont("Arial", "B", 24)
	pdf.SetTextColor(g.PrimaryColor[0], g.PrimaryColor[1], g.PrimaryColor[2])
	pdf.Cell(0, 10, "E-Commerce Co.")

	pdf.SetFont("Arial", "", 9)
	pdf.SetTextColor(g.TextColor[0], g.TextColor[1], g.TextColor[2])
	pdf.SetXY(120, 25)
	pdf.Cell(18, 5, "Invoice No:")
	pdf.SetXY(120, 30)
	pdf.Cell(18, 5, "Date:")

	pdf.SetXY(15, 25)
	pdf.SetFont("Arial", "", 9)
	pdf.SetTextColor(g.TextColor[0], g.TextColor[1], g.TextColor[2])
	pdf.Text(15, 30, "123 Cloud Avenue, Tech City")
	pdf.Text(15, 35, "Phone: +1 (555) 123-4567")
	pdf.Text(15, 40, "Email: support@ecommerce.com")
	pdf.Ln(20)
}

func (g *PDFGenerator) generateInfoSection(pdf *gofpdf.Fpdf, event events.OrderPaidEvent, invoiceID string) {

	shortID := fmt.Sprintf("%s-%s", invoiceID[:8], invoiceID[len(invoiceID)-12:])

	pdf.SetFont("Arial", "", 9)
	pdf.SetTextColor(g.TextColor[0], g.TextColor[1], g.TextColor[2])
	pdf.SetXY(140, 25)
	pdf.Cell(0, 5, fmt.Sprintf("INV-%s", strings.ToUpper(shortID)))
	pdf.SetXY(140, 30)
	pdf.Cell(0, 5, time.Now().Format("Jan 02, 2006"))

	pdf.SetFillColor(g.GrayColor[0], g.GrayColor[1], g.GrayColor[2])
	pdf.Rect(15, 55, 180, 30, "F")

	pdf.SetXY(20, 60)
	pdf.SetFont("Arial", "B", 10)
	pdf.SetTextColor(g.PrimaryColor[0], g.PrimaryColor[1], g.PrimaryColor[2])
	pdf.Cell(0, 5, "Bill To")

	pdf.SetFont("Arial", "B", 9)
	pdf.SetTextColor(g.TextColor[0], g.TextColor[1], g.TextColor[2])
	pdf.SetXY(20, 68)
	pdf.Cell(0, 5, event.Data.UserName)
	pdf.SetFont("Arial", "", 9)
	pdf.SetXY(20, 74)
	pdf.Cell(0, 5, event.Data.UserEmail)

	pdf.Rect(15, 90, 90, 30, "F")
	pdf.SetXY(20, 95)
	pdf.SetFont("Arial", "B", 10)
	pdf.SetTextColor(g.PrimaryColor[0], g.PrimaryColor[1], g.PrimaryColor[2])
	pdf.Cell(0, 5, "Shipping Address")

	pdf.SetFont("Arial", "", 8)
	pdf.SetTextColor(g.TextColor[0], g.TextColor[1], g.TextColor[2])
	pdf.SetXY(20, 102)
	pdf.Cell(0, 4, event.Data.ShippingAddress.Name)
	pdf.SetXY(20, 106)
	pdf.Cell(0, 4, event.Data.ShippingAddress.Street)
	pdf.SetXY(20, 110)
	pdf.Cell(0, 4, fmt.Sprintf("%s, %s %s", event.Data.ShippingAddress.City, event.Data.ShippingAddress.State, event.Data.ShippingAddress.ZipCode))
	pdf.SetXY(20, 114)
	pdf.Cell(0, 4, event.Data.ShippingAddress.Country)

	pdf.Rect(105, 90, 90, 30, "F")
	pdf.SetXY(110, 95)
	pdf.SetFont("Arial", "B", 10)
	pdf.SetTextColor(g.PrimaryColor[0], g.PrimaryColor[1], g.PrimaryColor[2])
	pdf.Cell(0, 5, "Billing Address")

	pdf.SetFont("Arial", "", 8)
	pdf.SetTextColor(g.TextColor[0], g.TextColor[1], g.TextColor[2])
	pdf.SetXY(110, 102)
	pdf.Cell(0, 4, event.Data.BillingAddress.Name)
	pdf.SetXY(110, 106)
	pdf.Cell(0, 4, event.Data.BillingAddress.Street)
	pdf.SetXY(110, 110)
	pdf.Cell(0, 4, fmt.Sprintf("%s, %s %s", event.Data.BillingAddress.City, event.Data.BillingAddress.State, event.Data.BillingAddress.ZipCode))
	pdf.SetXY(110, 114)
	pdf.Cell(0, 4, event.Data.BillingAddress.Country)
}

func (g *PDFGenerator) generateTable(pdf *gofpdf.Fpdf, event events.OrderPaidEvent) {
	pdf.SetXY(15, 125)
	pdf.SetFillColor(g.PrimaryColor[0], g.PrimaryColor[1], g.PrimaryColor[2])
	pdf.SetTextColor(255, 255, 255)
	pdf.SetFont("Arial", "B", 10)

	pdf.CellFormat(80, 10, "Description", "0", 0, "L", true, 0, "")
	pdf.CellFormat(30, 10, "Qty", "0", 0, "C", true, 0, "")
	pdf.CellFormat(40, 10, "Price", "0", 0, "C", true, 0, "")
	pdf.CellFormat(30, 10, "Amount", "", 1, "R", true, 0, "")

	pdf.SetTextColor(g.TextColor[0], g.TextColor[1], g.TextColor[2])
	pdf.SetFont("Arial", "", 10)
	for i, item := range event.Data.Items {
		fill := i%2 == 0
		if fill {
			pdf.SetFillColor(g.GrayColor[0], g.GrayColor[1], g.GrayColor[2])
		} else {
			pdf.SetFillColor(255, 255, 255)
		}

		lineTotal := item.Price * float64(item.Quantity)
		pdf.CellFormat(80, 10, item.Name, "0", 0, "L", true, 0, "")
		pdf.CellFormat(30, 10, fmt.Sprintf("%d", item.Quantity), "0", 0, "C", true, 0, "")
		pdf.CellFormat(40, 10, fmt.Sprintf("$%.2f", item.Price), "0", 0, "C", true, 0, "")
		pdf.CellFormat(30, 10, fmt.Sprintf("$%.2f", lineTotal), "", 1, "R", true, 0, "")
	}
}

func (g *PDFGenerator) generateTotals(pdf *gofpdf.Fpdf, event events.OrderPaidEvent) {
	pdf.Ln(2)

	var startX float64 = 140
	var labelWidth float64 = 35
	var valueWidth float64 = 0

	pdf.SetFont("Arial", "", 10)
	pdf.SetTextColor(g.TextColor[0], g.TextColor[1], g.TextColor[2])
	pdf.SetX(startX)
	pdf.CellFormat(labelWidth, 8, "Subtotal:", "", 0, "L", false, 0, "")
	pdf.CellFormat(valueWidth, 8, fmt.Sprintf("$%.2f", event.Data.Subtotal), "", 1, "R", false, 0, "")

	pdf.SetX(startX)
	pdf.CellFormat(labelWidth, 8, "Tax:", "", 0, "L", false, 0, "")
	pdf.CellFormat(valueWidth, 8, fmt.Sprintf("$%.2f", event.Data.TaxedAmount), "", 1, "R", false, 0, "")

	pdf.SetDrawColor(g.GrayColor[0], g.GrayColor[1], g.GrayColor[2])
	pdf.Line(startX, pdf.GetY(), startX+labelWidth+valueWidth, pdf.GetY())

	pdf.SetFont("Arial", "B", 10)
	pdf.SetTextColor(g.PrimaryColor[0], g.PrimaryColor[1], g.PrimaryColor[2])
	pdf.SetX(startX)
	pdf.CellFormat(labelWidth, 8, "Total Amount:", "", 0, "L", false, 0, "")
	pdf.SetFont("Arial", "B", 10)
	pdf.CellFormat(valueWidth, 8, fmt.Sprintf("$%.2f", event.Data.TotalAmount), "", 1, "R", false, 0, "")
}

func (g *PDFGenerator) generateFooter(pdf *gofpdf.Fpdf) {
	pdf.SetAutoPageBreak(false, 0)

	pdf.SetY(-25)

	pdf.SetDrawColor(g.GrayColor[0], g.GrayColor[1], g.GrayColor[2])
	pdf.SetLineWidth(0.2)
	pdf.Line(15, pdf.GetY(), 195, pdf.GetY())

	pdf.Ln(2)

	pdf.SetFont("Arial", "I", 8)
	pdf.SetTextColor(128, 128, 128)

	pdf.CellFormat(0, 5, "Thank you for your business!", "", 1, "C", false, 0, "")
	pdf.CellFormat(0, 5, "For questions, contact: support@ecommerce.com", "", 1, "C", false, 0, "")

	pdf.SetAutoPageBreak(true, 15)
}
