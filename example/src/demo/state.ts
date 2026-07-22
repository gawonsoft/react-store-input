export type DemoState = {
  formId: string;
  fullName: string;
  displayName: string;
  email: string;
  password: string;
  search: string;
  phone: string;
  website: string;
  quantity: number | undefined;
  budget: number | undefined;
  satisfaction: number;
  startDate: string;
  appointmentTime: string;
  meetingAt: Date | undefined;
  billingMonth: string;
  sprintWeek: string;
  accentColor: string;
  rememberMe: boolean;
  role: "admin" | "editor" | "viewer";
  department: string;
  newsletter: boolean;
  interests: string[];
  bio: string;
  notes: string;
  attachment: FileList | null;
  revision: number;
  profile: { nickname: string };
  content: string;
};

export const INITIAL_STATE: DemoState = {
  formId: "demo-2026",
  fullName: "Ada Lovelace",
  displayName: "ada",
  email: "ada@example.com",
  password: "analytical-engine",
  search: "immutable forms",
  phone: "+82 10-1234-5678",
  website: "https://example.com",
  quantity: 3,
  budget: 2500,
  satisfaction: 72,
  startDate: "2026-07-22",
  appointmentTime: "10:30",
  meetingAt: new Date(2026, 6, 22, 14, 30),
  billingMonth: "2026-07",
  sprintWeek: "2026-W30",
  accentColor: "#6d5dfc",
  rememberMe: true,
  role: "editor",
  department: "engineering",
  newsletter: true,
  interests: ["react", "typescript"],
  bio: "Building small tools with predictable state.",
  notes: "This textarea uses the standalone Textarea component.",
  attachment: null,
  revision: 1,
  profile: { nickname: "countess-of-code" },
  content: "<p>Optional editor content lives in the same store.</p>",
};
