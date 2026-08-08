import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const answerItem = z.object({
  slot: z.number().int().min(1).max(3),
  questionId: z.string().min(2).max(64),
  answer: z.string().trim().min(2).max(120),
});

const saveInput = z.object({ answers: z.array(answerItem).length(3) });

const startInput = z.object({ email: z.string().email() });

const resetInput = z.object({
  email: z.string().email(),
  answers: z
    .array(z.object({ slot: z.number().int().min(1).max(3), answer: z.string().max(120) }))
    .length(3),
  password: z.string().min(8).max(200),
});

const adminPasswordInput = z.object({
  userId: z.string().uuid(),
  password: z.string().min(8).max(200),
});

const GENERIC = "Those answers don't match the ones saved on this account.";

/** Saves (or replaces) the signed-in partner's three recovery questions. */
export const saveMySecurityAnswers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => saveInput.parse(input))
  .handler(async ({ data, context }) => {
    const { SECURITY_QUESTION_IDS } = await import("./security-questions");
    const { hashAnswer } = await import("./security.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const ids = data.answers.map((item) => item.questionId);
    if (ids.some((id) => !SECURITY_QUESTION_IDS.includes(id))) {
      throw new Error("Unknown security question.");
    }
    if (new Set(ids).size !== ids.length) {
      throw new Error("Please choose three different questions.");
    }

    await supabaseAdmin.from("security_answers").delete().eq("user_id", context.userId);
    const { error } = await supabaseAdmin.from("security_answers").insert(
      data.answers.map((item) => ({
        user_id: context.userId,
        slot: item.slot,
        question_key: item.questionId,
        answer_hash: hashAnswer(context.userId, item.answer),
      })),
    );
    if (error) throw new Error(error.message);

    await supabaseAdmin
      .from("security_answer_attempts")
      .upsert(
        { user_id: context.userId, failed_attempts: 0, locked_until: null },
        { onConflict: "user_id" },
      );

    return { ok: true };
  });

/**
 * Step one of email-free recovery: returns the three questions saved for this
 * email. Unknown or unconfigured accounts get stable decoy questions so the
 * screen never reveals whether an address exists.
 */
export const startPasswordRecovery = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => startInput.parse(input))
  .handler(async ({ data }) => {
    const { SECURITY_QUESTION_IDS } = await import("./security-questions");
    const { decoyQuestions } = await import("./security.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const email = data.email.trim();
    const fallback = () => ({
      questions: decoyQuestions(email, SECURITY_QUESTION_IDS).map((questionId, index) => ({
        slot: index + 1,
        questionId,
      })),
    });

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .ilike("email", email)
      .maybeSingle();
    if (!profile) return fallback();

    const { data: rows } = await supabaseAdmin
      .from("security_answers")
      .select("slot, question_key")
      .eq("user_id", profile.id)
      .order("slot");
    if (!rows || rows.length < 3) return fallback();

    return {
      questions: rows.map((row) => ({ slot: row.slot, questionId: row.question_key })),
    };
  });

/**
 * Step two: at least two of the three answers must match, then the partner sets
 * a new password immediately. No email, no administrator involvement.
 */
export const resetPasswordWithSecurityAnswers = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => resetInput.parse(input))
  .handler(async ({ data }) => {
    const { REQUIRED_CORRECT } = await import("./security-questions");
    const { answerMatches, LOCKOUT_MINUTES, MAX_FAILED_ATTEMPTS } = await import(
      "./security.server"
    );
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .ilike("email", data.email.trim())
      .maybeSingle();
    if (!profile) throw new Error(GENERIC);

    const { data: attempts } = await supabaseAdmin
      .from("security_answer_attempts")
      .select("failed_attempts, locked_until")
      .eq("user_id", profile.id)
      .maybeSingle();

    if (attempts?.locked_until && new Date(attempts.locked_until).getTime() > Date.now()) {
      throw new Error(
        `Too many incorrect attempts. Please wait ${LOCKOUT_MINUTES} minutes and try again.`,
      );
    }

    const { data: rows } = await supabaseAdmin
      .from("security_answers")
      .select("slot, answer_hash")
      .eq("user_id", profile.id);
    if (!rows || rows.length < 3) throw new Error(GENERIC);

    let correct = 0;
    for (const row of rows) {
      const given = data.answers.find((item) => item.slot === row.slot)?.answer ?? "";
      if (given.trim() && answerMatches(profile.id, given, row.answer_hash)) correct += 1;
    }

    if (correct < REQUIRED_CORRECT) {
      const failed = (attempts?.failed_attempts ?? 0) + 1;
      await supabaseAdmin.from("security_answer_attempts").upsert(
        {
          user_id: profile.id,
          failed_attempts: failed,
          locked_until:
            failed >= MAX_FAILED_ATTEMPTS
              ? new Date(Date.now() + LOCKOUT_MINUTES * 60_000).toISOString()
              : null,
        },
        { onConflict: "user_id" },
      );
      throw new Error(GENERIC);
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(profile.id, {
      password: data.password,
    });
    if (error) throw new Error(error.message);

    await supabaseAdmin.from("security_answer_attempts").upsert(
      {
        user_id: profile.id,
        failed_attempts: 0,
        locked_until: null,
        last_used_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    return { ok: true };
  });

/** Last-resort administrator override: set a password directly, no email. */
export const adminSetPartnerPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => adminPasswordInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleError) throw new Error(roleError.message);
    if (!isAdmin) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      password: data.password,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
