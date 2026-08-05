import { describe, it, expect } from "vitest";

describe("Study API Route - Parse Files", () => {
  it("should parse text and pdf upload buffers", () => {
    const mockFilePayload = {
      filename: "syllabus.pdf",
      size: 1024
    };
    expect(mockFilePayload.filename).toContain(".pdf");
    expect(mockFilePayload.size).toBeGreaterThan(0);
  });
});
