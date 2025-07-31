import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Order } from '@/lib/supabase/formations-types'

interface InvoiceData {
  order: Order
  invoiceNumber: string
  invoiceDate: Date
}

export class InvoiceGenerator {
  private doc: jsPDF
  private readonly pageWidth = 210 // A4 width in mm
  private readonly pageHeight = 297 // A4 height in mm
  private readonly margin = 20
  private readonly primaryColor = '#4F46E5' // Indigo-600
  private readonly secondaryColor = '#0891B2' // Cyan-600
  
  // Informations de l'entreprise
  private readonly company = {
    name: 'ONM Conseils',
    address: '14 quai Kléber',
    postalCode: '67000',
    city: 'Strasbourg',
    country: 'France',
    siret: '892 456 789 00012',
    tva: 'FR 45 892456789',
    email: 'contact@masterclass-onm.com',
    phone: '+33 3 88 12 34 56',
    website: 'www.masterclass-onm.com'
  }

  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
  }

  public generateInvoice(data: InvoiceData): Blob {
    const { order, invoiceNumber, invoiceDate } = data
    
    // Header avec logo et informations entreprise
    this.drawHeader(invoiceNumber, invoiceDate)
    
    // Informations client
    this.drawClientInfo(order)
    
    // Tableau des articles
    this.drawItemsTable(order)
    
    // Totaux
    this.drawTotals(order)
    
    // Footer avec mentions légales
    this.drawFooter()
    
    // Retourner le PDF sous forme de Blob
    return this.doc.output('blob')
  }

  private drawHeader(invoiceNumber: string, invoiceDate: Date) {
    // Fond dégradé en haut
    this.doc.setFillColor(79, 70, 229) // Indigo
    this.doc.rect(0, 0, this.pageWidth, 50, 'F')
    
    // Logo ONM (utiliser un cercle avec les initiales pour l'instant)
    this.doc.setFillColor(255, 255, 255)
    this.doc.circle(this.margin + 15, 25, 12, 'F')
    this.doc.setTextColor(79, 70, 229)
    this.doc.setFontSize(16)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('ONM', this.margin + 15, 28, { align: 'center' })
    
    // Titre FACTURE
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(28)
    this.doc.text('FACTURE', this.pageWidth - this.margin, 25, { align: 'right' })
    
    // Numéro et date de facture
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(`N° ${invoiceNumber}`, this.pageWidth - this.margin, 35, { align: 'right' })
    this.doc.text(`Date : ${invoiceDate.toLocaleDateString('fr-FR')}`, this.pageWidth - this.margin, 40, { align: 'right' })
    
    // Informations de l'entreprise
    let yPos = 65
    this.doc.setTextColor(0, 0, 0)
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(this.company.name, this.margin, yPos)
    
    yPos += 7
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.setTextColor(100, 100, 100)
    this.doc.text(this.company.address, this.margin, yPos)
    yPos += 5
    this.doc.text(`${this.company.postalCode} ${this.company.city}`, this.margin, yPos)
    yPos += 5
    this.doc.text(this.company.country, this.margin, yPos)
    
    yPos += 8
    this.doc.text(`SIRET : ${this.company.siret}`, this.margin, yPos)
    yPos += 5
    this.doc.text(`TVA Intracommunautaire : ${this.company.tva}`, this.margin, yPos)
    
    // Contact
    yPos += 8
    this.doc.text(`Email : ${this.company.email}`, this.margin, yPos)
    yPos += 5
    this.doc.text(`Tél : ${this.company.phone}`, this.margin, yPos)
    yPos += 5
    this.doc.text(`Web : ${this.company.website}`, this.margin, yPos)
  }

  private drawClientInfo(order: Order) {
    const yStart = 65
    const xStart = this.pageWidth / 2 + 20
    
    // Cadre pour les infos client
    this.doc.setDrawColor(79, 70, 229)
    this.doc.setLineWidth(0.5)
    this.doc.roundedRect(xStart - 5, yStart - 5, 85, 50, 3, 3)
    
    this.doc.setTextColor(79, 70, 229)
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('FACTURÉ À', xStart, yStart)
    
    let yPos = yStart + 8
    this.doc.setTextColor(0, 0, 0)
    this.doc.setFontSize(11)
    this.doc.text(`${order.user?.first_name} ${order.user?.last_name}`, xStart, yPos)
    
    if (order.user?.company) {
      yPos += 6
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(order.user.company, xStart, yPos)
    }
    
    yPos += 6
    this.doc.setFontSize(10)
    this.doc.setTextColor(100, 100, 100)
    this.doc.text(order.user?.email || '', xStart, yPos)
    
    if (order.user?.phone) {
      yPos += 5
      this.doc.text(order.user.phone, xStart, yPos)
    }
    
    if (order.user?.address) {
      yPos += 5
      this.doc.text(order.user.address, xStart, yPos)
    }
  }

  private drawItemsTable(order: Order) {
    const startY = 130
    
    // En-têtes du tableau
    const headers = [
      { header: 'Description', dataKey: 'description' },
      { header: 'Quantité', dataKey: 'quantity' },
      { header: 'Prix unitaire HT', dataKey: 'priceHT' },
      { header: 'TVA', dataKey: 'tva' },
      { header: 'Total HT', dataKey: 'totalHT' }
    ]
    
    // Données du tableau
    const data = order.items?.map(item => {
      const priceHT = item.price_at_time / 1.20 // Prix TTC -> HT (TVA 20%)
      const totalHT = priceHT * item.quantity
      
      return {
        description: `${item.session?.formation?.title}\n${item.session?.city} - ${new Date(item.session?.start_date || '').toLocaleDateString('fr-FR')}`,
        quantity: item.quantity.toString(),
        priceHT: `${priceHT.toFixed(2)} €`,
        tva: '20%',
        totalHT: `${totalHT.toFixed(2)} €`
      }
    }) || []
    
    // Générer le tableau avec autoTable
    autoTable(this.doc, {
      startY: startY,
      head: [headers.map(h => h.header)],
      body: data.map(row => [
        row.description,
        row.quantity,
        row.priceHT,
        row.tva,
        row.totalHT
      ]),
      theme: 'plain',
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: 'bold',
        halign: 'left'
      },
      bodyStyles: {
        fontSize: 10,
        textColor: [0, 0, 0],
        cellPadding: 5
      },
      columnStyles: {
        0: { cellWidth: 80 }, // Description
        1: { cellWidth: 20, halign: 'center' }, // Quantité
        2: { cellWidth: 35, halign: 'right' }, // Prix unitaire HT
        3: { cellWidth: 20, halign: 'center' }, // TVA
        4: { cellWidth: 30, halign: 'right' } // Total HT
      },
      alternateRowStyles: {
        fillColor: [245, 245, 250]
      },
      margin: { left: this.margin }
    })
  }

  private drawTotals(order: Order) {
    const finalY = (this.doc as any).lastAutoTable.finalY + 10
    const xStart = this.pageWidth - 80
    
    // Calculer les montants
    const totalHT = order.subtotal_amount / 1.20
    const tva = order.subtotal_amount - totalHT
    const discount = order.discount_amount
    const totalTTC = order.total_amount
    
    // Ligne de séparation
    this.doc.setDrawColor(200, 200, 200)
    this.doc.line(xStart - 10, finalY, this.pageWidth - this.margin, finalY)
    
    let yPos = finalY + 10
    this.doc.setFontSize(11)
    
    // Total HT
    this.doc.setTextColor(100, 100, 100)
    this.doc.text('Total HT', xStart, yPos)
    this.doc.setTextColor(0, 0, 0)
    this.doc.text(`${totalHT.toFixed(2)} €`, this.pageWidth - this.margin, yPos, { align: 'right' })
    
    // TVA
    yPos += 7
    this.doc.setTextColor(100, 100, 100)
    this.doc.text('TVA (20%)', xStart, yPos)
    this.doc.setTextColor(0, 0, 0)
    this.doc.text(`${tva.toFixed(2)} €`, this.pageWidth - this.margin, yPos, { align: 'right' })
    
    // Remise si applicable
    if (discount > 0) {
      yPos += 7
      this.doc.setTextColor(100, 100, 100)
      this.doc.text('Remise', xStart, yPos)
      this.doc.setTextColor(34, 197, 94) // Green
      this.doc.text(`-${discount.toFixed(2)} €`, this.pageWidth - this.margin, yPos, { align: 'right' })
    }
    
    // Total TTC
    yPos += 10
    this.doc.setDrawColor(79, 70, 229)
    this.doc.setLineWidth(1)
    this.doc.line(xStart - 10, yPos - 3, this.pageWidth - this.margin, yPos - 3)
    
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setTextColor(79, 70, 229)
    this.doc.text('TOTAL TTC', xStart, yPos + 5)
    this.doc.text(`${totalTTC.toFixed(2)} €`, this.pageWidth - this.margin, yPos + 5, { align: 'right' })
    
    // Statut de paiement
    yPos += 15
    this.doc.setFontSize(12)
    if (order.payment_status === 'paid') {
      this.doc.setTextColor(34, 197, 94) // Green
      this.doc.text('✓ PAYÉ', this.pageWidth - this.margin, yPos, { align: 'right' })
      if (order.payment_date) {
        yPos += 5
        this.doc.setFontSize(10)
        this.doc.setTextColor(100, 100, 100)
        this.doc.text(`Le ${new Date(order.payment_date).toLocaleDateString('fr-FR')}`, this.pageWidth - this.margin, yPos, { align: 'right' })
      }
    } else {
      this.doc.setTextColor(239, 68, 68) // Red
      this.doc.text('EN ATTENTE DE PAIEMENT', this.pageWidth - this.margin, yPos, { align: 'right' })
    }
  }

  private drawFooter() {
    const footerY = this.pageHeight - 40
    
    // Ligne de séparation
    this.doc.setDrawColor(200, 200, 200)
    this.doc.line(this.margin, footerY, this.pageWidth - this.margin, footerY)
    
    // Mentions légales
    let yPos = footerY + 8
    this.doc.setFontSize(8)
    this.doc.setTextColor(150, 150, 150)
    this.doc.setFont('helvetica', 'normal')
    
    const mentions = [
      'En cas de retard de paiement, une pénalité de 3 fois le taux d\'intérêt légal sera appliquée.',
      'Indemnité forfaitaire pour frais de recouvrement : 40,00 €',
      'Organisme de formation enregistré sous le numéro 44 67 06789 67 auprès du préfet de région Grand Est',
      'Exonéré de TVA — Art. 261.4.4° a du CGI'
    ]
    
    mentions.forEach(mention => {
      this.doc.text(mention, this.pageWidth / 2, yPos, { align: 'center' })
      yPos += 4
    })
    
    // Numéro de page
    this.doc.setFontSize(10)
    this.doc.text(`Page 1/1`, this.pageWidth / 2, this.pageHeight - 10, { align: 'center' })
  }
  
  // Méthode utilitaire pour générer un numéro de facture
  public static generateInvoiceNumber(order: Order): string {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const orderNumber = order.order_number.padStart(6, '0')
    
    return `ONM-${year}${month}-${orderNumber}`
  }
}