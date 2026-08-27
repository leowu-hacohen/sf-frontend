import { fireEvent, render, screen } from "@testing-library/react";
import ContactAvatar from "@/components/contacts/ContactAvatar";
import { makeContact } from "../mocks/handlers";

describe("ContactAvatar", () => {
  it("shows initials when the contact has no photo", () => {
    const { container } = render(<ContactAvatar contact={makeContact()} />);

    expect(container).toHaveTextContent("AL");
    expect(container.querySelector("img")).not.toBeInTheDocument();
  });

  it("shows the photo when photo_url is set", () => {
    render(
      <ContactAvatar
        contact={makeContact({ photo_url: "https://i.pravatar.cc/150?img=47" })}
      />,
    );

    expect(screen.getByRole("presentation", { hidden: true })).toHaveAttribute(
      "src",
      "https://i.pravatar.cc/150?img=47",
    );
  });

  it("falls back to initials when the photo fails to load", () => {
    const { container } = render(
      <ContactAvatar
        contact={makeContact({ photo_url: "https://example.com/broken.png" })}
      />,
    );

    fireEvent.error(container.querySelector("img")!);

    expect(container).toHaveTextContent("AL");
    expect(container.querySelector("img")).not.toBeInTheDocument();
  });

  it("retries when the contact gets a new photo URL after a failure", () => {
    const { container, rerender } = render(
      <ContactAvatar
        contact={makeContact({ photo_url: "https://example.com/broken.png" })}
      />,
    );
    fireEvent.error(container.querySelector("img")!);
    expect(container.querySelector("img")).not.toBeInTheDocument();

    rerender(
      <ContactAvatar
        contact={makeContact({ photo_url: "https://example.com/fixed.png" })}
      />,
    );

    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "https://example.com/fixed.png",
    );
  });
});
