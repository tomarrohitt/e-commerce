import PDFDocument from "pdfkit";

export interface InvoiceItem {
  name: string;
  description?: string;
  quantity: number;
  price: number;
  tax?: number;
  discount?: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}

export interface CompanyInfo {
  name: string;
  logo?: string;
  address: Address;
  phone?: string;
  email?: string;
  website?: string;
  taxId?: string;
}

export interface InvoiceData {
  orderId: string;
  date: string;
  dueDate?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  totalAmount: number;
  subtotal?: number;
  tax?: number;
  discount?: number;
  shippingCost?: number;
  items: InvoiceItem[];
  address: Address;
  notes?: string;
  paymentMethod?: string;
  paymentStatus?: "Paid" | "Pending" | "Overdue";
  currency?: string;
}

export interface InvoiceOptions {
  company?: CompanyInfo;
  colors?: {
    primary: string;
    secondary: string;
    text: string;
    lightGray: string;
  };
}

export class PdfGenerator {
  private static readonly DEFAULT_COMPANY: CompanyInfo = {
    name: "E-Commerce Co.",
    address: {
      street: "123 Cloud Avenue",
      city: "Tech City",
      state: "TC",
      zipCode: "90210",
      country: "USA",
    },
    phone: "+1 (555) 123-4567",
    email: "support@ecommerce.com",
    website: "www.ecommerce.com",
    taxId: "TAX-123456789",
  };

  private static readonly DEFAULT_COLORS = {
    primary: "#9333ea",
    secondary: "#c084fc",
    text: "#1f2937",
    lightGray: "#f3f4f6",
  };

  static async generate(
    data: InvoiceData,
    options: InvoiceOptions = {}
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      const company = options.company || this.DEFAULT_COMPANY;
      const colors = options.colors || this.DEFAULT_COLORS;
      const currency = data.currency || "$";

      // Header
      this.generateHeader(doc, company, colors);

      // Invoice Info & Customer Details
      this.generateInvoiceInfo(doc, data, colors);

      // Items Table
      this.generateItemsTable(doc, data, colors, currency);

      // Totals
      this.generateTotals(doc, data, colors, currency);

      // Notes & Payment Info
      this.generateFooter(doc, data, company, colors);

      doc.end();
    });
  }

  private static generateHeader(
    doc: PDFKit.PDFDocument,
    company: CompanyInfo,
    colors: any
  ): void {
    // Company name and logo area
    doc
      .fillColor(colors.primary)
      .fontSize(28)
      .font("Helvetica-Bold")
      .text(company.name, 50, 50);

    // Invoice title on the right
    doc
      .fillColor(colors.primary)
      .fontSize(32)
      .font("Helvetica-Bold")
      .text("INVOICE", 400, 50, { align: "right" });

    // Company details
    doc
      .fillColor(colors.text)
      .fontSize(9)
      .font("Helvetica")
      .text(company.address.street, 50, 85)
      .text(
        `${company.address.city}, ${company.address.state} ${company.address.zipCode}`,
        50,
        97
      );

    if (company.address.country) {
      doc.text(company.address.country, 50, 109);
    }

    if (company.phone) {
      doc.text(`Phone: ${company.phone}`, 50, 121);
    }

    if (company.email) {
      doc.text(`Email: ${company.email}`, 50, 133);
    }

    if (company.taxId) {
      doc.text(`Tax ID: ${company.taxId}`, 50, 145);
    }

    doc.moveDown(3);
  }

  private static generateInvoiceInfo(
    doc: PDFKit.PDFDocument,
    data: InvoiceData,
    colors: any
  ): void {
    const startY = 190;

    // Invoice details box (left)
    doc.fillColor(colors.lightGray).rect(50, startY, 240, 100).fill();

    doc
      .fillColor(colors.primary)
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("Invoice Details", 60, startY + 10);

    doc
      .fillColor(colors.text)
      .fontSize(9)
      .font("Helvetica")
      .text(`Invoice Number:`, 60, startY + 30)
      .font("Helvetica-Bold")
      .text(data.orderId.toUpperCase(), 130, startY + 30)
      .font("Helvetica")
      .text(`Invoice Date:`, 60, startY + 45)
      .font("Helvetica-Bold")
      .text(data.date, 130, startY + 45);

    if (data.dueDate) {
      doc
        .font("Helvetica")
        .text(`Due Date:`, 60, startY + 60)
        .font("Helvetica-Bold")
        .text(data.dueDate, 150, startY + 60);
    }

    if (data.paymentStatus) {
      const statusColor =
        data.paymentStatus === "Paid"
          ? "#10b981"
          : data.paymentStatus === "Pending"
            ? "#f59e0b"
            : "#ef4444";

      doc
        .font("Helvetica")
        .text(`Status:`, 60, startY + 75)
        .fillColor(statusColor)
        .font("Helvetica-Bold")
        .text(data.paymentStatus, 150, startY + 75);
    }

    // Customer details box (right)
    doc.fillColor(colors.lightGray).rect(310, startY, 240, 100).fill();

    doc
      .fillColor(colors.primary)
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("Bill To", 320, startY + 10);

    doc
      .fillColor(colors.text)
      .fontSize(9)
      .font("Helvetica-Bold")
      .text(data.customerName, 320, startY + 30)
      .font("Helvetica")
      .text(data.customerEmail, 320, startY + 45);

    if (data.customerPhone) {
      doc.text(data.customerPhone, 320, startY + 58);
    }

    doc
      .text(data.address.street, 320, startY + 71)
      .text(
        `${data.address.city}, ${data.address.state} ${data.address.zipCode}`,
        320,
        startY + 83
      );

    doc.moveDown(4);
  }

  private static generateItemsTable(
    doc: PDFKit.PDFDocument,
    data: InvoiceData,
    colors: any,
    currency: string
  ): void {
    const tableTop = 330;
    const itemHeight = 30;

    // Table header
    doc.fillColor(colors.primary).rect(50, tableTop, 500, 25).fill();

    doc
      .fillColor("#ffffff")
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("Description", 60, tableTop + 8)
      .text("Qty", 340, tableTop + 8)
      .text("Price", 400, tableTop + 8)
      .text("Amount", 480, tableTop + 8);

    // Table rows
    let currentY = tableTop + 25;

    data.items.forEach((item, index) => {
      const isEven = index % 2 === 0;
      const lineTotal = item.price * item.quantity;

      // Alternating row background
      if (isEven) {
        doc
          .fillColor(colors.lightGray)
          .rect(50, currentY, 500, itemHeight)
          .fill();
      }

      doc
        .fillColor(colors.text)
        .fontSize(10)
        .font("Helvetica-Bold")
        .text(item.name, 60, currentY + 8, { width: 260 });

      if (item.description) {
        doc
          .fontSize(8)
          .font("Helvetica")
          .fillColor("#6b7280")
          .text(item.description, 60, currentY + 20, { width: 260 });
      }

      doc
        .fillColor(colors.text)
        .fontSize(10)
        .font("Helvetica")
        .text(item.quantity.toString(), 340, currentY + 8)
        .text(`${currency}${item.price.toFixed(2)}`, 400, currentY + 8)
        .font("Helvetica-Bold")
        .text(`${currency}${lineTotal.toFixed(2)}`, 480, currentY + 8);

      currentY += itemHeight;
    });

    doc.moveDown(2);
  }

  private static generateTotals(
    doc: PDFKit.PDFDocument,
    data: InvoiceData,
    colors: any,
    currency: string
  ): void {
    const rightAlign = 500; // Aligned with the right edge of standard content
    const labelAlign = 350; // Where "Subtotal:" starts
    let currentY = doc.y + 20;

    // Helper to safely format currency (handles Strings and Numbers)
    const formatMoney = (amount: number | string | undefined) => {
      const num = Number(amount || 0);
      return `${currency}${num.toFixed(2)}`;
    };

    doc.fontSize(10).font("Helvetica");

    // 1. Subtotal
    if (data.subtotal) {
      doc
        .fillColor(colors.text)
        .text("Subtotal:", labelAlign, currentY)
        .text(formatMoney(data.subtotal), rightAlign, currentY, {
          align: "right",
        });
      currentY += 20;
    }

    // 2. Discount (Green text if applied)
    if (data.discount && Number(data.discount) > 0) {
      doc
        .fillColor("#10b981") // Green
        .text("Discount:", labelAlign, currentY)
        .text(`- ${formatMoney(data.discount)}`, rightAlign, currentY, {
          align: "right",
        });
      currentY += 20;
    }

    // 3. Tax
    if (data.tax && Number(data.tax) > 0) {
      doc
        .fillColor(colors.text)
        .text("Tax / VAT:", labelAlign, currentY)
        .text(formatMoney(data.tax), rightAlign, currentY, { align: "right" });
      currentY += 20;
    }

    // 4. Shipping
    if (data.shippingCost && Number(data.shippingCost) > 0) {
      doc
        .text("Shipping:", labelAlign, currentY)
        .text(formatMoney(data.shippingCost), rightAlign, currentY, {
          align: "right",
        });
      currentY += 20;
    }

    // --- DIVIDER LINE ---
    currentY += 5;
    doc
      .strokeColor("#e5e7eb")
      .lineWidth(1)
      .moveTo(labelAlign, currentY)
      .lineTo(rightAlign + 50, currentY) // Extend slightly past the numbers
      .stroke();
    currentY += 15;

    // 5. Total Amount (Large & Bold)
    doc.font("Helvetica-Bold").fontSize(14).fillColor(colors.primary);

    doc.text("Total Amount:", labelAlign, currentY, { width: 120 });
    doc
      .fontSize(16)
      .text(formatMoney(data.totalAmount), rightAlign, currentY - 2, {
        align: "right",
      });

    currentY += 35;

    // 6. Payment Status Badge (Optional but professional)
    if (data.paymentStatus) {
      const statusColor =
        data.paymentStatus === "Paid"
          ? "#10b981" // Green
          : data.paymentStatus === "Overdue"
            ? "#ef4444" // Red
            : "#f59e0b"; // Orange (Pending)

      doc.fontSize(10).font("Helvetica-Bold").fillColor(colors.text);
      doc.text("Payment Status:", labelAlign, currentY);

      doc
        .fillColor(statusColor)
        .text(data.paymentStatus.toUpperCase(), rightAlign, currentY, {
          align: "right",
        });
      currentY += 15;
    }

    // 7. Payment Method (e.g. "Credit Card ending in 4242")
    if (data.paymentMethod) {
      doc.font("Helvetica").fillColor(colors.text);
      doc.text("Payment Method:", labelAlign, currentY);
      doc.text(data.paymentMethod, rightAlign, currentY, { align: "right" });
    }
  }

  private static generateFooter(
    doc: PDFKit.PDFDocument,
    data: InvoiceData,
    company: CompanyInfo,
    colors: any
  ): void {
    let footerY = doc.y + 40;
    const amountWidth = 160;

    // Notes section
    if (data.notes) {
      doc
        .fillColor(colors.primary)
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("Notes:", 50, footerY);

      doc
        .fillColor(colors.text)
        .fontSize(9)
        .font("Helvetica")
        .text(data.notes, 50, footerY + 15, { width: 500, align: "left" });

      footerY = doc.y + 20;
    }

    // Payment information
    if (data.paymentMethod) {
      doc
        .fillColor(colors.primary)
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("Payment Method:", 50, footerY);

      doc
        .fillColor(colors.text)
        .fontSize(9)
        .font("Helvetica")
        .text(data.paymentMethod, 50, footerY + 15);

      footerY = doc.y + 20;
    }

    // Bottom section
    const bottomY = 750;
    doc
      .strokeColor(colors.lightGray)
      .lineWidth(1)
      .moveTo(50, bottomY)
      .lineTo(550, bottomY)
      .stroke();

    doc
      .fillColor("#6b7280")
      .fontSize(9)
      .font("Helvetica")
      .text("Thank you for your business!", 50, bottomY + 10, {
        align: "center",
      })
      .text(
        `For questions, contact: ${company.email || "support@company.com"}`,
        50,
        bottomY + 25,
        { align: "center" }
      );
  }
}
