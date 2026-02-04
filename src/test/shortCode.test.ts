import { describe, it, expect } from "vitest";
import { generateRandomShortCode } from "@/lib/shortCode";

describe("generateRandomShortCode", () => {
  it("should generate a code with default length of 6", () => {
    const code = generateRandomShortCode();
    expect(code).toHaveLength(6);
  });

  it("should generate a code with custom length", () => {
    const code = generateRandomShortCode(10);
    expect(code).toHaveLength(10);
  });

  it("should only contain alphanumeric characters", () => {
    const code = generateRandomShortCode();
    expect(code).toMatch(/^[a-zA-Z0-9]+$/);
  });

  it("should generate different codes on multiple calls", () => {
    const codes = new Set<string>();
    for (let i = 0; i < 100; i++) {
      codes.add(generateRandomShortCode());
    }
    // With 100 calls and 62^6 possibilities, we should get 100 unique codes
    expect(codes.size).toBe(100);
  });

  it("should generate valid URL-safe characters only", () => {
    // Generate multiple codes and check all characters
    for (let i = 0; i < 50; i++) {
      const code = generateRandomShortCode(8);
      expect(code).toMatch(/^[a-zA-Z0-9]+$/);
    }
  });
});
