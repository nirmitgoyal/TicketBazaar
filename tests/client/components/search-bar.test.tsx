import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchBar } from "../../../client/src/components/search-bar";

describe("SearchBar Component", () => {
  test("should render search bar with placeholder", () => {
    render(<SearchBar onSearch={() => {}} />);

    expect(screen.getByPlaceholderText("Search events...")).toBeInTheDocument();
  });

  test("should render with initial query", () => {
    render(<SearchBar initialQuery="concert" onSearch={() => {}} />);

    const searchInput = screen.getByPlaceholderText(
      "Search events...",
    ) as HTMLInputElement;
    expect(searchInput.value).toBe("concert");
  });

  test("should call onSearch when search button is clicked", () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} />);

    const searchInput = screen.getByPlaceholderText(
      "Search events...",
    ) as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: "concert" } });

    const searchButton = screen.getByRole("button", { name: /search/i });
    fireEvent.click(searchButton);

    expect(mockOnSearch).toHaveBeenCalledWith("concert", expect.any(Object));
  });

  test("should call onSearch with empty query when clear button is clicked", () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar initialQuery="concert" onSearch={mockOnSearch} />);

    const clearButton = screen.getByRole("button", { name: /clear/i });
    fireEvent.click(clearButton);

    expect(mockOnSearch).toHaveBeenCalledWith("", expect.any(Object));
  });

  test("should handle category selection", () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} />);

    // Open the category dropdown
    const categoryButton = screen.getByRole("combobox", { name: /category/i });
    fireEvent.click(categoryButton);

    // Select a category
    const categoryOption = screen.getByText("Music");
    fireEvent.click(categoryOption);

    const searchButton = screen.getByRole("button", { name: /search/i });
    fireEvent.click(searchButton);

    expect(mockOnSearch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        category: "Music",
      }),
    );
  });

  test("should handle location selection", () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} />);

    // Open the location dropdown
    const locationButton = screen.getByRole("combobox", { name: /location/i });
    fireEvent.click(locationButton);

    // Select a location
    const locationOption = screen.getByText("Delhi NCR");
    fireEvent.click(locationOption);

    const searchButton = screen.getByRole("button", { name: /search/i });
    fireEvent.click(searchButton);

    expect(mockOnSearch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        location: "Delhi NCR",
      }),
    );
  });

  test("should handle date selection", () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} />);

    // Open the date picker
    const dateButton = screen.getByRole("button", { name: /date/i });
    fireEvent.click(dateButton);

    // Select a date (this is simplified, actual date selection would be more complex)
    const dateOption = screen.getByText("15");
    fireEvent.click(dateOption);

    const searchButton = screen.getByRole("button", { name: /search/i });
    fireEvent.click(searchButton);

    expect(mockOnSearch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        date: expect.any(Date),
      }),
    );
  });
});
