import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { invoice_id } = await req.json();

    // Fetch invoice
    const invoice = await base44.entities.Invoice.filter({ id: invoice_id });
    if (!invoice.length) {
      return Response.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const inv = invoice[0];
    const charity = await base44.entities.Charity.filter({ id: inv.charity_id });

    // Generate PDF
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('INVOICE', 20, 20);
    
    // Charity Info
    doc.setFontSize(10);
    doc.text(charity[0].name, 20, 35);
    doc.text(charity[0].website || '', 20, 42);
    
    // Invoice Details
    doc.setFontSize(12);
    doc.text(inv.invoice_number, 150, 35);
    doc.setFontSize(10);
    doc.text(`Issued: ${inv.issued_date}`, 150, 42);
    doc.text(`Due: ${inv.due_date}`, 150, 49);
    
    // Line Items
    doc.setFont(undefined, 'bold');
    doc.text('Description', 20, 70);
    doc.text('Amount', 150, 70);
    
    doc.setFont(undefined, 'normal');
    doc.text(inv.description || 'Service charges', 20, 80);
    doc.text(`£${inv.amount.toFixed(2)}`, 150, 80);
    
    // Total
    doc.setFont(undefined, 'bold');
    doc.text(`TOTAL: £${inv.amount.toFixed(2)}`, 150, 100);
    
    // Status
    doc.setFontSize(9);
    doc.text(`Status: ${inv.status.toUpperCase()}`, 20, 120);
    
    // Footer
    doc.setFontSize(8);
    doc.text('Thank you for your business', 20, 280);

    const pdfBytes = doc.output('arraybuffer');
    
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=invoice-${inv.invoice_number}.pdf`
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});