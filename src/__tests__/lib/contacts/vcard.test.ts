import { buildVCard } from "@/lib/contacts/vcard";
import type { Contact } from "@/lib/contacts/types";

function contact(overrides: Partial<Contact> = {}): Contact {
  return {
    id: 1,
    first_name: "Ada",
    last_name: "Lovelace",
    full_name: "Ada Lovelace",
    email: "ada@example.com",
    phone: "+1 555 0100",
    company: "Analytical Engines, Ltd.",
    job_title: "Programmer",
    photo_url: null,
    notes: null,
    addresses: [],
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("buildVCard", () => {
  it("emits a CRLF-delimited 3.0 card with name, email, phone", () => {
    const card = buildVCard(contact());
    const lines = card.split("\r\n");

    expect(lines[0]).toBe("BEGIN:VCARD");
    expect(lines[1]).toBe("VERSION:3.0");
    expect(lines).toContain("N:Lovelace;Ada;;;");
    expect(lines).toContain("FN:Ada Lovelace");
    expect(lines).toContain("EMAIL;TYPE=INTERNET:ada@example.com");
    expect(lines).toContain("TEL;TYPE=CELL:+1 555 0100");
    expect(lines[lines.length - 1]).toBe("END:VCARD");
  });

  it("escapes commas and semicolons in field values", () => {
    const card = buildVCard(contact({ company: "Acme; Inc, West" }));
    expect(card).toContain("ORG:Acme\\; Inc\\, West");
  });

  it("maps home and work addresses to typed ADR lines, other to untyped", () => {
    const card = buildVCard(
      contact({
        addresses: [
          { id: 1, type: "home", address: "1 Main St", city: "London", state: null, postal_code: "N1", country: "UK" },
          { id: 2, type: "other", address: "PO Box 9", city: null, state: null, postal_code: null, country: null },
        ],
      }),
    );

    expect(card).toContain("ADR;TYPE=HOME:;;1 Main St;London;;N1;UK");
    expect(card).toContain("ADR:;;PO Box 9;;;;");
  });

  it("omits lines for fields the contact does not have", () => {
    const card = buildVCard(
      contact({ phone: null, company: null, job_title: null }),
    );
    expect(card).not.toContain("TEL");
    expect(card).not.toContain("ORG");
    expect(card).not.toContain("TITLE");
  });

  it("never includes notes, which are oversized and private", () => {
    const card = buildVCard(contact({ notes: "n".repeat(10_000) }));
    expect(card).not.toContain("NOTE");
    expect(card.length).toBeLessThan(300);
  });

  it("normalizes CRLF and lone CR to the \\n escape", () => {
    const card = buildVCard(contact({ company: "Line one\r\nLine two\rEnd" }));
    expect(card).toContain("ORG:Line one\\nLine two\\nEnd");
    expect(card).not.toMatch(/\rEnd/);
  });
});
