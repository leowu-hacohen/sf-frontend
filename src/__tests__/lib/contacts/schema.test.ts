import {
  CONTACT_FIELDS,
  contactInputSchema,
  formDataToAddressRows,
  formDataToValues,
  zodFieldErrors,
} from "@/lib/contacts/schema";

function values(overrides: Record<string, string> = {}) {
  return {
    first_name: "Ada",
    last_name: "Lovelace",
    email: "Ada@Example.com",
    phone: "",
    company: "",
    job_title: "",
    address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    notes: "",
    photo_url: "",
    ...overrides,
  };
}

describe("contactInputSchema", () => {
  it("lowercases the email and nulls out the blanks", () => {
    const parsed = contactInputSchema.parse(values());

    expect(parsed.email).toBe("ada@example.com");
    expect(parsed.phone).toBeNull();
    expect(parsed.notes).toBeNull();
  });

  it("accepts an http(s) photo URL and nulls a blank one", () => {
    const photo = "https://i.pravatar.cc/150?img=47";
    expect(contactInputSchema.parse(values({ photo_url: photo })).photo_url).toBe(
      photo,
    );
    expect(contactInputSchema.parse(values()).photo_url).toBeNull();
  });

  it("rejects a photo URL that is not http(s)", () => {
    const result = contactInputSchema.safeParse(
      values({ photo_url: "javascript:alert(1)" }),
    );
    expect(result.success).toBe(false);
  });

  it("trims what the user typed", () => {
    expect(contactInputSchema.parse(values({ company: "  Acme  " })).company).toBe(
      "Acme",
    );
  });

  it("requires the three fields the API requires", () => {
    const result = contactInputSchema.safeParse(
      values({ first_name: " ", last_name: "", email: "" }),
    );

    expect(result.success).toBe(false);
    expect(zodFieldErrors(result.error!)).toEqual({
      first_name: "First name is required",
      last_name: "Last name is required",
      email: "Email is required",
    });
  });

  it("rejects a malformed email", () => {
    const result = contactInputSchema.safeParse(values({ email: "not-an-email" }));
    expect(zodFieldErrors(result.error!).email).toBe("Enter a valid email address");
  });

  it("enforces the API's length limits", () => {
    const result = contactInputSchema.safeParse(
      values({ first_name: "a".repeat(101) }),
    );

    expect(zodFieldErrors(result.error!)).toEqual({
      first_name: "First name must be 100 characters or fewer",
    });
  });

  it("enforces per-row length limits on addresses", () => {
    const result = contactInputSchema.safeParse({
      ...values(),
      addresses: [
        { type: "home", address: "", city: "", state: "", postal_code: "9".repeat(21), country: "" },
      ],
    });

    expect(result.success).toBe(false);
    expect(result.error!.issues[0].path).toEqual(["addresses", 0, "postal_code"]);
    expect(result.error!.issues[0].message).toBe(
      "Postal code must be 20 characters or fewer",
    );
  });
});

describe("formDataToValues", () => {
  it("pulls every known field out, defaulting to an empty string", () => {
    const formData = new FormData();
    formData.set("first_name", "Grace");
    formData.set("email", "grace@example.com");
    formData.set("ignored", "nope");

    const extracted = formDataToValues(formData);

    expect(extracted.first_name).toBe("Grace");
    expect(extracted.last_name).toBe("");
    expect(Object.keys(extracted).sort()).toEqual(
      CONTACT_FIELDS.map((field) => field.name).sort(),
    );
  });
});


describe("contactInputSchema", () => {
  it("does not resurrect the old flat address fields", () => {
    const parsed = contactInputSchema.parse(values());
    expect(parsed).not.toHaveProperty("address");
    expect(parsed).not.toHaveProperty("city");
    expect(parsed).not.toHaveProperty("state");
    expect(parsed).not.toHaveProperty("postal_code");
    expect(parsed).not.toHaveProperty("country");
  });
});

describe("addresses", () => {
  it("accepts typed address rows and nulls their blanks", () => {
    const parsed = contactInputSchema.parse({
      ...values(),
      addresses: [{ type: "work", address: " 1 Market St ", city: "", state: "", postal_code: "", country: "" }],
    });

    expect(parsed.addresses).toEqual([
      {
        type: "work",
        address: "1 Market St",
        city: null,
        state: null,
        postal_code: null,
        country: null,
      },
    ]);
  });

  it("rejects an unknown address type", () => {
    const result = contactInputSchema.safeParse({
      ...values(),
      addresses: [{ type: "vacation" }],
    });
    expect(result.success).toBe(false);
  });
});

describe("formDataToAddressRows", () => {
  it("rebuilds rows from indexed field names, tolerating gaps", () => {
    const formData = new FormData();
    formData.set("addresses[0][type]", "home");
    formData.set("addresses[0][city]", "London");
    // index 1 was removed client-side; index 2 survives
    formData.set("addresses[2][type]", "work");
    formData.set("addresses[2][city]", "San Francisco");

    const rows = formDataToAddressRows(formData);

    expect(rows).toHaveLength(2);
    expect(rows[0].type).toBe("home");
    expect(rows[0].city).toBe("London");
    expect(rows[1].type).toBe("work");
    expect(rows[1].city).toBe("San Francisco");
  });

  it("returns an empty list when no address inputs are present", () => {
    expect(formDataToAddressRows(new FormData())).toEqual([]);
  });
});
