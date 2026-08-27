import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddressesEditor from "@/components/contacts/AddressesEditor";
import { makeAddress } from "../mocks/handlers";

describe("AddressesEditor", () => {
  it("shows the empty state when the contact has no addresses", () => {
    render(<AddressesEditor initial={[]} />);
    expect(screen.getByText(/no addresses yet/i)).toBeInTheDocument();
  });

  it("renders one row per existing address", () => {
    render(
      <AddressesEditor
        initial={[
          makeAddress({ id: 1, type: "home", city: "London" }),
          makeAddress({ id: 2, type: "work", city: "San Francisco" }),
        ]}
      />,
    );

    expect(screen.getAllByLabelText("City")).toHaveLength(2);
    expect(screen.getByDisplayValue("London")).toBeInTheDocument();
    expect(screen.getByDisplayValue("San Francisco")).toBeInTheDocument();
  });

  it("adds and removes rows", async () => {
    const user = userEvent.setup();
    render(<AddressesEditor initial={[]} />);

    await user.click(screen.getByRole("button", { name: /add address/i }));
    await user.click(screen.getByRole("button", { name: /add address/i }));
    expect(screen.getAllByLabelText("City")).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: /remove address 1/i }));
    expect(screen.getAllByLabelText("City")).toHaveLength(1);
  });

  it("keeps a removed middle row from taking its neighbor's values", async () => {
    const user = userEvent.setup();
    render(
      <AddressesEditor
        initial={[
          makeAddress({ id: 1, city: "London" }),
          makeAddress({ id: 2, city: "Paris" }),
          makeAddress({ id: 3, city: "Zurich" }),
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: /remove address 2/i }));

    const cities = screen
      .getAllByLabelText("City")
      .map((input) => (input as HTMLInputElement).value);
    expect(cities).toEqual(["London", "Zurich"]);
  });
});
