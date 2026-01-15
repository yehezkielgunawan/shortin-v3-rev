import { vi } from "vitest";

// Mock window.location for client-side tests
const mockLocation = {
  origin: "http://localhost:3000",
  href: "http://localhost:3000",
  pathname: "/",
  search: "",
  hash: "",
  host: "localhost:3000",
  hostname: "localhost",
  port: "3000",
  protocol: "http:",
  assign: vi.fn(),
  replace: vi.fn(),
  reload: vi.fn(),
};

Object.defineProperty(window, "location", {
  value: mockLocation,
  writable: true,
});

// Mock navigator.clipboard
Object.defineProperty(navigator, "clipboard", {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(""),
  },
  writable: true,
});
