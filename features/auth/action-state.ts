export type AuthField =
  "email" | "password" | "passwordConfirmation" | "fullName";

export type AuthActionState = Readonly<{
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Partial<Record<AuthField, string[]>>;
}>;

export const INITIAL_AUTH_ACTION_STATE: AuthActionState = { status: "idle" };
