import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EditableTitle } from "../editable-title";

describe("EditableTitle", () => {
  it("renders the title text", () => {
    render(<EditableTitle value="My Task" onSave={vi.fn()} />);
    expect(screen.getByText("My Task")).toBeInTheDocument();
  });

  it("enters edit mode on click", () => {
    render(<EditableTitle value="My Task" onSave={vi.fn()} />);
    fireEvent.click(screen.getByText("My Task"));
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveValue("My Task");
  });

  it("calls onSave when pressing Enter with new value", () => {
    const onSave = vi.fn();
    render(<EditableTitle value="My Task" onSave={onSave} />);
    fireEvent.click(screen.getByText("My Task"));

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Updated Task" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onSave).toHaveBeenCalledWith("Updated Task");
  });

  it("does not call onSave when value is unchanged", () => {
    const onSave = vi.fn();
    render(<EditableTitle value="My Task" onSave={onSave} />);
    fireEvent.click(screen.getByText("My Task"));

    const input = screen.getByRole("textbox");
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onSave).not.toHaveBeenCalled();
  });

  it("cancels editing on Escape", () => {
    const onSave = vi.fn();
    render(<EditableTitle value="My Task" onSave={onSave} />);
    fireEvent.click(screen.getByText("My Task"));

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Changed" } });
    fireEvent.keyDown(input, { key: "Escape" });

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText("My Task")).toBeInTheDocument();
  });

  it("does not enter edit mode when disabled", () => {
    render(<EditableTitle value="My Task" onSave={vi.fn()} disabled />);
    fireEvent.click(screen.getByText("My Task"));
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});
