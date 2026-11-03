import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import { APP_UPDATES } from "@/data/updates";

function Where() {
  const loc = useLocation();
  return <p data-testid="where">{loc.pathname + loc.search}</p>;
}

describe("sininho", () => {
  it("anuncia a novidade e leva para a página que fala sobre ela", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/"]}>
        <NotificationBell />
        <Routes><Route path="*" element={<Where />} /></Routes>
      </MemoryRouter>
    );
    await user.click(screen.getByRole("button"));
    expect(screen.getByText(APP_UPDATES.title)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: APP_UPDATES.link.label }));
    expect(screen.getByTestId("where")).toHaveTextContent("/wiki?secao=news");
  });
});
