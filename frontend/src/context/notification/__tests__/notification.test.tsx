// @vitest-environment jsdom
import React from "react";
import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NotificationProvider, useNotification } from "../notificationContext";

const Consumer: React.FC = () => {
  const notify = useNotification();
  return (
    <button type="button" onClick={() => notify("Falhou", "error")}>
      disparar
    </button>
  );
};

describe("NotificationProvider", () => {
  it("exibe a mensagem quando notify e chamado", async () => {
    render(
      <NotificationProvider>
        <Consumer />
      </NotificationProvider>
    );

    expect(screen.queryByText("Falhou")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "disparar" }));

    await waitFor(() => {
      expect(screen.getByText("Falhou")).toBeInTheDocument();
    });
  });

  it("useNotification lanca erro fora do provider", () => {
    const Orphan: React.FC = () => {
      useNotification();
      return null;
    };
    expect(() => render(<Orphan />)).toThrow();
  });
});
