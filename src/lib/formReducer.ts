// Define the state shape
export interface FormState {
  url: string;
  shortCodeInput: string;
  loading: boolean;
  result: {
    id: string;
    url: string;
    shortCode: string;
    createdAt: string;
    updatedAt: string;
    count: number;
    warning?: string;
  } | null;
  error: string;
  warning: string;
  copied: boolean;
}

// Define action types
export type FormAction =
  | { type: "SET_URL"; payload: string }
  | { type: "SET_SHORT_CODE"; payload: string }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_SUCCESS"; payload: { result: FormState["result"]; warning?: string } }
  | { type: "SUBMIT_ERROR"; payload: string }
  | { type: "COPY_SUCCESS" }
  | { type: "COPY_RESET" }
  | { type: "RESET_MESSAGES" };

// Initial state
export const initialFormState: FormState = {
  url: "",
  shortCodeInput: "",
  loading: false,
  result: null,
  error: "",
  warning: "",
  copied: false,
};

// Reducer function
export function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_URL":
      return { ...state, url: action.payload };

    case "SET_SHORT_CODE":
      return { ...state, shortCodeInput: action.payload };

    case "SUBMIT_START":
      return {
        ...state,
        loading: true,
        result: null,
        error: "",
        warning: "",
      };

    case "SUBMIT_SUCCESS":
      return {
        ...state,
        loading: false,
        result: action.payload.result,
        warning: action.payload.warning || "",
      };

    case "SUBMIT_ERROR":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case "COPY_SUCCESS":
      return { ...state, copied: true };

    case "COPY_RESET":
      return { ...state, copied: false };

    case "RESET_MESSAGES":
      return { ...state, error: "", warning: "" };

    default:
      return state;
  }
}
