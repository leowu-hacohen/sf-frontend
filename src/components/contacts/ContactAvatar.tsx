"use client";

import { useState, type CSSProperties } from "react";
import { avatarHue, initials } from "@/lib/contacts/format";
import type { Contact } from "@/lib/contacts/types";

const SIZES = {
  sm: "h-8 w-8 text-[11px]",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
} as const;

/**
 * Contact photo when `photo_url` is set and loads; otherwise the initials
 * bubble, tinted with a hue derived from the contact's email.
 */
export default function ContactAvatar({
  contact,
  size = "md",
}: {
  contact: Pick<Contact, "first_name" | "last_name" | "email" | "photo_url">;
  size?: keyof typeof SIZES;
}) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const showPhoto = contact.photo_url && !photoFailed;

  const style = {
    "--avatar-hue": avatarHue(contact.email),
  } as CSSProperties;

  return (
    <span
      aria-hidden="true"
      style={style}
      className={`contact-avatar inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full font-display font-semibold ${SIZES[size]}`}
    >
      {showPhoto ? (
        // Plain <img>, not next/image: photo hosts are user-supplied, so there
        // is no allow-list to give the optimizer's remotePatterns.
        <img
          src={contact.photo_url ?? undefined}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
          onError={() => setPhotoFailed(true)}
        />
      ) : (
        initials(contact)
      )}
    </span>
  );
}
