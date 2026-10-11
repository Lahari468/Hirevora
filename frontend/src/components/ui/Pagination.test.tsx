import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pagination } from "./Pagination.js";

describe("Pagination", () => {
  it("disables Previous on the first page and Next on the last page", () => {
    render(<Pagination page={1} pageSize={10} total={25} onPageChange={vi.fn()} />);

    expect(screen.getByLabelText("Previous page")).toBeDisabled();
    expect(screen.getByLabelText("Next page")).not.toBeDisabled();
  });

  it("disables Next once on the last page and shows the correct range", () => {
    render(<Pagination page={3} pageSize={10} total={25} onPageChange={vi.fn()} />);

    expect(screen.getByText("Showing 21–25 of 25")).toBeInTheDocument();
    expect(screen.getByLabelText("Next page")).toBeDisabled();
    expect(screen.getByLabelText("Previous page")).not.toBeDisabled();
  });

  it("calls onPageChange with page + 1 when Next is clicked", async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={2} pageSize={10} total={50} onPageChange={onPageChange} />);

    await userEvent.click(screen.getByLabelText("Next page"));

    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("calls onPageChange with page - 1 when Previous is clicked", async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={2} pageSize={10} total={50} onPageChange={onPageChange} />);

    await userEvent.click(screen.getByLabelText("Previous page"));

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("shows '0 results' and still renders a Page 1 of 1 shell for an empty result set", () => {
    render(<Pagination page={1} pageSize={10} total={0} onPageChange={vi.fn()} />);

    expect(screen.getByText("0 results")).toBeInTheDocument();
    expect(screen.getByText("Page 1 of 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Previous page")).toBeDisabled();
    expect(screen.getByLabelText("Next page")).toBeDisabled();
  });
});
