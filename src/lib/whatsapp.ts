const WHATSAPP_NUMBER = "918136828150"; // +91 81368 28150 - Enquire via WhatsApp

export function getWhatsAppEnquiryUrl(productName: string, price: number): string {
  const text = encodeURIComponent(
    `Hi, I'm interested in the "${productName}" priced at $${price}`
  );
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

export function getWhatsAppGeneralUrl(): string {
  return `https://wa.me/${WHATSAPP_NUMBER}`;
}
