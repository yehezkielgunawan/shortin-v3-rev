import { describe, it, expect } from "vitest";
import {
  formReducer,
  initialFormState,
  type FormState,
  type FormAction,
} from "@/lib/formReducer";

describe("formReducer", () => {
  describe("SET_URL action", () => {
    it("should update url in state", () => {
      const action: FormAction = {
        type: "SET_URL",
        payload: "https://example.com/long/url",
      };

      const newState = formReducer(initialFormState, action);

      expect(newState.url).toBe("https://example.com/long/url");
      expect(newState.shortCodeInput).toBe("");
      expect(newState.loading).toBe(false);
    });

    it("should preserve other state properties", () => {
      const currentState: FormState = {
        ...initialFormState,
        shortCodeInput: "custom123",
        copied: true,
      };

      const action: FormAction = {
        type: "SET_URL",
        payload: "https://new-url.com",
      };

      const newState = formReducer(currentState, action);

      expect(newState.url).toBe("https://new-url.com");
      expect(newState.shortCodeInput).toBe("custom123");
      expect(newState.copied).toBe(true);
    });
  });

  describe("SET_SHORT_CODE action", () => {
    it("should update shortCodeInput in state", () => {
      const action: FormAction = {
        type: "SET_SHORT_CODE",
        payload: "my-custom-code",
      };

      const newState = formReducer(initialFormState, action);

      expect(newState.shortCodeInput).toBe("my-custom-code");
    });

    it("should allow empty short code", () => {
      const currentState: FormState = {
        ...initialFormState,
        shortCodeInput: "existing-code",
      };

      const action: FormAction = {
        type: "SET_SHORT_CODE",
        payload: "",
      };

      const newState = formReducer(currentState, action);

      expect(newState.shortCodeInput).toBe("");
    });
  });

  describe("SUBMIT_START action", () => {
    it("should set loading to true and clear previous results and messages", () => {
      const currentState: FormState = {
        ...initialFormState,
        url: "https://example.com",
        result: {
          id: "old_id",
          url: "https://old.com",
          shortCode: "old",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
          count: 5,
        },
        error: "Previous error",
        warning: "Previous warning",
        showQrCode: true,
        qrCodeDataUrl: "data:image/png;base64,old...",
      };

      const action: FormAction = { type: "SUBMIT_START" };

      const newState = formReducer(currentState, action);

      expect(newState.loading).toBe(true);
      expect(newState.result).toBeNull();
      expect(newState.error).toBe("");
      expect(newState.warning).toBe("");
      expect(newState.showQrCode).toBe(false);
      expect(newState.qrCodeDataUrl).toBe("");
      expect(newState.url).toBe("https://example.com"); // URL should be preserved
    });
  });

  describe("SUBMIT_SUCCESS action", () => {
    it("should set result and stop loading", () => {
      const currentState: FormState = {
        ...initialFormState,
        loading: true,
        url: "https://example.com",
      };

      const mockResult = {
        id: "id_123",
        url: "https://example.com",
        shortCode: "abc123",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        count: 0,
      };

      const action: FormAction = {
        type: "SUBMIT_SUCCESS",
        payload: { result: mockResult },
      };

      const newState = formReducer(currentState, action);

      expect(newState.loading).toBe(false);
      expect(newState.result).toEqual(mockResult);
      expect(newState.warning).toBe("");
    });

    it("should set warning if provided", () => {
      const currentState: FormState = {
        ...initialFormState,
        loading: true,
      };

      const mockResult = {
        id: "id_123",
        url: "https://example.com",
        shortCode: "old-code",
        createdAt: "2023-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        count: 10,
      };

      const action: FormAction = {
        type: "SUBMIT_SUCCESS",
        payload: {
          result: mockResult,
          warning: "This short code exists but is >3 months old. You may override it.",
        },
      };

      const newState = formReducer(currentState, action);

      expect(newState.loading).toBe(false);
      expect(newState.result).toEqual(mockResult);
      expect(newState.warning).toBe(
        "This short code exists but is >3 months old. You may override it."
      );
    });
  });

  describe("SUBMIT_ERROR action", () => {
    it("should set error message and stop loading", () => {
      const currentState: FormState = {
        ...initialFormState,
        loading: true,
        url: "https://example.com",
      };

      const action: FormAction = {
        type: "SUBMIT_ERROR",
        payload: "Short code already in use",
      };

      const newState = formReducer(currentState, action);

      expect(newState.loading).toBe(false);
      expect(newState.error).toBe("Short code already in use");
      expect(newState.url).toBe("https://example.com");
    });

    it("should handle various error messages", () => {
      const errors = [
        "URL is required",
        "Invalid URL format",
        "Short code already in use",
        "Network error",
        "Failed to shorten URL",
      ];

      errors.forEach((errorMsg) => {
        const currentState: FormState = { ...initialFormState, loading: true };
        const action: FormAction = { type: "SUBMIT_ERROR", payload: errorMsg };
        const newState = formReducer(currentState, action);

        expect(newState.error).toBe(errorMsg);
        expect(newState.loading).toBe(false);
      });
    });
  });

  describe("COPY_SUCCESS action", () => {
    it("should set copied to true", () => {
      const currentState: FormState = {
        ...initialFormState,
        result: {
          id: "id_123",
          url: "https://example.com",
          shortCode: "abc123",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
          count: 0,
        },
      };

      const action: FormAction = { type: "COPY_SUCCESS" };

      const newState = formReducer(currentState, action);

      expect(newState.copied).toBe(true);
      expect(newState.result).not.toBeNull(); // Result should be preserved
    });
  });

  describe("COPY_RESET action", () => {
    it("should set copied to false", () => {
      const currentState: FormState = {
        ...initialFormState,
        copied: true,
        result: {
          id: "id_123",
          url: "https://example.com",
          shortCode: "abc123",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
          count: 0,
        },
      };

      const action: FormAction = { type: "COPY_RESET" };

      const newState = formReducer(currentState, action);

      expect(newState.copied).toBe(false);
      expect(newState.result).not.toBeNull(); // Result should be preserved
    });
  });

  describe("RESET_MESSAGES action", () => {
    it("should clear error and warning messages", () => {
      const currentState: FormState = {
        ...initialFormState,
        error: "Some error",
        warning: "Some warning",
        url: "https://example.com",
        result: {
          id: "id_123",
          url: "https://example.com",
          shortCode: "abc123",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
          count: 0,
        },
      };

      const action: FormAction = { type: "RESET_MESSAGES" };

      const newState = formReducer(currentState, action);

      expect(newState.error).toBe("");
      expect(newState.warning).toBe("");
      expect(newState.url).toBe("https://example.com"); // Other state preserved
      expect(newState.result).not.toBeNull(); // Result preserved
    });
  });

  describe("QR_CODE_START action", () => {
    it("should set qrCodeLoading to true and showQrCode to true", () => {
      const currentState: FormState = {
        ...initialFormState,
        result: {
          id: "id_123",
          url: "https://example.com",
          shortCode: "abc123",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
          count: 0,
        },
      };

      const action: FormAction = { type: "QR_CODE_START" };

      const newState = formReducer(currentState, action);

      expect(newState.qrCodeLoading).toBe(true);
      expect(newState.showQrCode).toBe(true);
      expect(newState.result).not.toBeNull(); // Result should be preserved
    });
  });

  describe("QR_CODE_SUCCESS action", () => {
    it("should set qrCodeDataUrl and stop loading", () => {
      const currentState: FormState = {
        ...initialFormState,
        qrCodeLoading: true,
        showQrCode: true,
        result: {
          id: "id_123",
          url: "https://example.com",
          shortCode: "abc123",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
          count: 0,
        },
      };

      const mockDataUrl = "data:image/png;base64,iVBORw0KGgo...";
      const action: FormAction = { type: "QR_CODE_SUCCESS", payload: mockDataUrl };

      const newState = formReducer(currentState, action);

      expect(newState.qrCodeLoading).toBe(false);
      expect(newState.qrCodeDataUrl).toBe(mockDataUrl);
      expect(newState.showQrCode).toBe(true);
    });
  });

  describe("QR_CODE_HIDE action", () => {
    it("should hide QR code and reset loading state", () => {
      const currentState: FormState = {
        ...initialFormState,
        showQrCode: true,
        qrCodeDataUrl: "data:image/png;base64,iVBORw0KGgo...",
        qrCodeLoading: true,
        result: {
          id: "id_123",
          url: "https://example.com",
          shortCode: "abc123",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
          count: 0,
        },
      };

      const action: FormAction = { type: "QR_CODE_HIDE" };

      const newState = formReducer(currentState, action);

      expect(newState.showQrCode).toBe(false);
      expect(newState.qrCodeDataUrl).toBe("");
      expect(newState.qrCodeLoading).toBe(false);
      expect(newState.result).not.toBeNull(); // Result should be preserved
    });
  });

  describe("Unknown action", () => {
    it("should return current state for unknown action types", () => {
      const currentState: FormState = {
        ...initialFormState,
        url: "https://example.com",
        shortCodeInput: "custom123",
      };

      // @ts-expect-error - Testing unknown action type
      const action: FormAction = { type: "UNKNOWN_ACTION" };

      const newState = formReducer(currentState, action);

      expect(newState).toEqual(currentState);
    });
  });

  describe("Initial state", () => {
    it("should have correct initial values", () => {
      expect(initialFormState).toEqual({
        url: "",
        shortCodeInput: "",
        loading: false,
        result: null,
        error: "",
        warning: "",
        copied: false,
        showQrCode: false,
        qrCodeDataUrl: "",
        qrCodeLoading: false,
      });
    });
  });

  describe("State transitions - full flow", () => {
    it("should handle a complete successful URL shortening flow", () => {
      let state = initialFormState;

      // User enters URL
      state = formReducer(state, { type: "SET_URL", payload: "https://example.com/long" });
      expect(state.url).toBe("https://example.com/long");

      // User enters optional short code
      state = formReducer(state, { type: "SET_SHORT_CODE", payload: "mycode" });
      expect(state.shortCodeInput).toBe("mycode");

      // Form submitted
      state = formReducer(state, { type: "SUBMIT_START" });
      expect(state.loading).toBe(true);
      expect(state.result).toBeNull();

      // Success response
      const result = {
        id: "id_123",
        url: "https://example.com/long",
        shortCode: "mycode",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        count: 0,
      };
      state = formReducer(state, { type: "SUBMIT_SUCCESS", payload: { result } });
      expect(state.loading).toBe(false);
      expect(state.result).toEqual(result);

      // User copies URL
      state = formReducer(state, { type: "COPY_SUCCESS" });
      expect(state.copied).toBe(true);

      // Copy feedback resets
      state = formReducer(state, { type: "COPY_RESET" });
      expect(state.copied).toBe(false);
    });

    it("should handle a failed URL shortening flow", () => {
      let state = initialFormState;

      // User enters URL
      state = formReducer(state, { type: "SET_URL", payload: "https://example.com" });

      // User enters duplicate short code
      state = formReducer(state, { type: "SET_SHORT_CODE", payload: "taken" });

      // Form submitted
      state = formReducer(state, { type: "SUBMIT_START" });
      expect(state.loading).toBe(true);

      // Error response
      state = formReducer(state, { type: "SUBMIT_ERROR", payload: "Short code already in use" });
      expect(state.loading).toBe(false);
      expect(state.error).toBe("Short code already in use");
      expect(state.result).toBeNull();

      // User clears messages to retry
      state = formReducer(state, { type: "RESET_MESSAGES" });
      expect(state.error).toBe("");
    });

    it("should handle QR code generation flow", () => {
      let state = initialFormState;

      // Setup: URL shortened successfully
      const result = {
        id: "id_123",
        url: "https://example.com/long",
        shortCode: "mycode",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        count: 0,
      };
      state = formReducer(state, { type: "SUBMIT_SUCCESS", payload: { result } });
      expect(state.result).toEqual(result);

      // User clicks generate QR code
      state = formReducer(state, { type: "QR_CODE_START" });
      expect(state.qrCodeLoading).toBe(true);
      expect(state.showQrCode).toBe(true);

      // QR code generated successfully
      const qrDataUrl = "data:image/png;base64,iVBORw0KGgo...";
      state = formReducer(state, { type: "QR_CODE_SUCCESS", payload: qrDataUrl });
      expect(state.qrCodeLoading).toBe(false);
      expect(state.qrCodeDataUrl).toBe(qrDataUrl);
      expect(state.showQrCode).toBe(true);

      // User shortens a new URL - QR code should reset
      state = formReducer(state, { type: "SUBMIT_START" });
      expect(state.showQrCode).toBe(false);
      expect(state.qrCodeDataUrl).toBe("");
    });

    it("should handle QR code generation failure", () => {
      let state = initialFormState;

      // Setup: URL shortened successfully
      const result = {
        id: "id_123",
        url: "https://example.com/long",
        shortCode: "mycode",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        count: 0,
      };
      state = formReducer(state, { type: "SUBMIT_SUCCESS", payload: { result } });

      // User clicks generate QR code
      state = formReducer(state, { type: "QR_CODE_START" });
      expect(state.qrCodeLoading).toBe(true);

      // QR code generation fails
      state = formReducer(state, { type: "QR_CODE_HIDE" });
      expect(state.qrCodeLoading).toBe(false);
      expect(state.showQrCode).toBe(false);
      expect(state.qrCodeDataUrl).toBe("");
    });
  });
});
