"use client";

import { useId, useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { ADDRESS_FIELDS } from "@/lib/contacts/schema";
import { ADDRESS_TYPES, type Address } from "@/lib/contacts/types";

type RowValues = Record<string, string>;

/**
 * The dynamic address rows of the contact form. Inputs are named
 * `addresses[<i>][<field>]` so the server action can rebuild the list from
 * plain FormData; row state here only controls how many rows render.
 */
export default function AddressesEditor({
  initial,
  error,
}: {
  initial: Address[] | RowValues[];
  error?: string;
}) {
  const labelId = useId();
  // Monotonic per-row keys so React state survives removing a middle row.
  const nextKey = useRef(0);
  const toRow = (values: RowValues) => ({ key: (nextKey.current += 1), values });
  const [rows, setRows] = useState(() =>
    initial.map((address) =>
      toRow(
        Object.fromEntries(
          ["type", ...ADDRESS_FIELDS.map((field) => field.name)].map((name) => [
            name,
            String((address as RowValues)[name] ?? ""),
          ]),
        ),
      ),
    ),
  );

  return (
    <fieldset className="space-y-4" aria-labelledby={labelId}>
      <div className="flex items-end justify-between border-b border-hairline pb-2">
        <div>
          <h2
            id={labelId}
            className="font-display text-sm font-semibold text-foreground"
          >
            Addresses
          </h2>
          <p className="text-[13px] text-muted-foreground">
            A contact can have several, like one home and one work.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setRows((current) => [...current, toRow({ type: "home" })])}
        >
          <Plus className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          Add address
        </Button>
      </div>

      {error ? (
        <p role="alert" className="text-[13px] text-destructive">
          {error}
        </p>
      ) : null}

      {rows.length === 0 ? (
        <p className="rounded-md border border-dashed border-border px-3 py-4 text-center text-[13px] text-muted-foreground">
          No addresses yet. This contact will be saved without one.
        </p>
      ) : null}

      {rows.map((row, index) => (
        <div
          key={row.key}
          className="space-y-4 rounded-lg border border-border bg-card p-4"
        >
          <div className="flex items-center justify-between gap-2">
            <label className="flex items-center gap-2 text-[13px] text-muted-foreground">
              Type
              <select
                name={`addresses[${index}][type]`}
                defaultValue={row.values.type || "home"}
                className="rounded-md border border-border bg-input px-2 py-1.5 text-sm text-foreground transition-colors focus:border-primary"
              >
                {ADDRESS_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type[0].toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label={`Remove address ${index + 1}`}
              onClick={() =>
                setRows((current) => current.filter((r) => r.key !== row.key))
              }
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              Remove
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {ADDRESS_FIELDS.map((field) => (
              <div
                key={field.name}
                className={"wide" in field && field.wide ? "sm:col-span-2" : undefined}
              >
                <label
                  htmlFor={`address-${row.key}-${field.name}`}
                  className="mb-1.5 block text-[13px] font-medium text-foreground"
                >
                  {field.label}
                </label>
                <input
                  id={`address-${row.key}-${field.name}`}
                  type="text"
                  name={`addresses[${index}][${field.name}]`}
                  defaultValue={row.values[field.name] ?? ""}
                  maxLength={field.maxLength}
                  placeholder={field.placeholder}
                  className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-primary focus:bg-input"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </fieldset>
  );
}
