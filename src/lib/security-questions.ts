import type { MessageKey } from "@/lib/i18n/en";

/**
 * Fixed catalogue of recovery questions. Ids are stored in the database, the
 * label keys are translated, so a partner always sees their questions in their
 * own language even if they registered in another one.
 */
export const SECURITY_QUESTIONS = [
  { id: "birth_city", labelKey: "sq.q.birth_city" },
  { id: "first_school", labelKey: "sq.q.first_school" },
  { id: "mother_maiden", labelKey: "sq.q.mother_maiden" },
  { id: "childhood_nickname", labelKey: "sq.q.childhood_nickname" },
  { id: "first_pet", labelKey: "sq.q.first_pet" },
  { id: "childhood_street", labelKey: "sq.q.childhood_street" },
  { id: "favourite_teacher", labelKey: "sq.q.favourite_teacher" },
  { id: "favourite_dish", labelKey: "sq.q.favourite_dish" },
  { id: "first_job_city", labelKey: "sq.q.first_job_city" },
  { id: "closest_childhood_friend", labelKey: "sq.q.closest_childhood_friend" },
  { id: "father_middle_name", labelKey: "sq.q.father_middle_name" },
  { id: "first_phone_brand", labelKey: "sq.q.first_phone_brand" },
] as const satisfies ReadonlyArray<{ id: string; labelKey: MessageKey }>;

export type SecurityQuestionId = (typeof SECURITY_QUESTIONS)[number]["id"];

export const SECURITY_QUESTION_IDS = SECURITY_QUESTIONS.map((item) => item.id) as string[];

/** Number of questions a partner sets, and how many must match to recover. */
export const REQUIRED_QUESTIONS = 3;
export const REQUIRED_CORRECT = 2;

export function questionLabelKey(id: string): MessageKey {
  return (
    SECURITY_QUESTIONS.find((item) => item.id === id)?.labelKey ?? "sq.q.birth_city"
  );
}
