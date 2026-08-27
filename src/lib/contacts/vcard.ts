import type { Address, Contact } from "@/lib/contacts/types";

/** Escape a value per RFC 2426: backslash, newline, comma, and semicolon. */
function esc(value: string): string {
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

/** vCard 3.0 knows HOME and WORK; our "other" rows carry no type param. */
function adrLine(address: Address): string {
  const type =
    address.type === "home" || address.type === "work"
      ? `;TYPE=${address.type.toUpperCase()}`
      : "";
  const parts = [
    "",
    "",
    address.address ?? "",
    address.city ?? "",
    address.state ?? "",
    address.postal_code ?? "",
    address.country ?? "",
  ];
  return `ADR${type}:${parts.map(esc).join(";")}`;
}

/**
 * Build a vCard 3.0 for a contact so a phone camera can save it from a QR
 * code. Photo and notes are left out on purpose: a base64 image pushes the
 * payload far past what a scannable QR can hold, and notes can legally run to
 * 10,000 characters while also being the field least worth disclosing to the
 * QR-rendering service.
 */
export function buildVCard(contact: Contact): string {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${esc(contact.last_name)};${esc(contact.first_name)};;;`,
    `FN:${esc(contact.full_name)}`,
    `EMAIL;TYPE=INTERNET:${esc(contact.email)}`,
  ];
  if (contact.phone) lines.push(`TEL;TYPE=CELL:${esc(contact.phone)}`);
  if (contact.company) lines.push(`ORG:${esc(contact.company)}`);
  if (contact.job_title) lines.push(`TITLE:${esc(contact.job_title)}`);
  for (const address of contact.addresses) lines.push(adrLine(address));
  lines.push("END:VCARD");
  return lines.join("\r\n");
}
