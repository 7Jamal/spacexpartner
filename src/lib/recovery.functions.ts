import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const resetInput = z.object({
  email: z.string().email(),
  code: z.string().min(8).max(64),
  password: z.string().min(8).max(200),
});

const userInput = z.object({ userId: z.string().uuid() });

const adminPasswordInput = z.object({
  userId: z.string().uuid(),
  password: z.string().min(8).max(200),
});

/**
 * Issues (or rotates) the signed-in partner's recovery code.
 * The plaintext code is returned exactly once — only its hash is stored.
 */
export const issueMyRecoveryCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { generateRecoveryCode, hashRecoveryCode } = await import("./recovery.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const code = generateRecoveryCode();
    const { error } = await supabaseAdmin.from("recovery_codes").upsert(
      {
        user_id: context.userId,
        code_hash: hashRecoveryCode(code),
        failed_attempts: 0,
        locked_until: null,
      },
      { onConflict: "user_id" },
    );
    if (error) throw new Error(error.message);
    return { code };
  });

/**
 * Email-free password reset: the partner proves ownership with their recovery
 * code, sets a new password, and receives a fresh code for next time.
 */
export const resetPasswordWithRecoveryCode = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => resetInput.parse(input))
  .handler(async ({ data }) => {
    const {
      codeMatches,
      generateRecoveryCode,
      hashRecoveryCode,
      LOCKOUT_MINUTES,
      MAX_FAILED_ATTEMPTS,
    } = await import("./recovery.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const generic = "That email and recovery code combination doesn't match our records.";

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .ilike("email", data.email.trim())
      .maybeSingle();
    if (!profile) throw new Error(generic);

    const { data: row } = await supabaseAdmin
      .from("recovery_codes")
      .select("code_hash, failed_attempts, locked_until")
      .eq("user_id", profile.id)
      .maybeSingle();
    if (!row) throw new Error(generic);

    if (row.locked_until && new Date(row.locked_until).getTime() > Date.now()) {
      throw new Error(
        `Too many incorrect attempts. Please try again in ${LOCKOUT_MINUTES} minutes or ask the administrator for a new code.`,
      );
    }

    if (!codeMatches(data.code, row.code_hash)) {
      const attempts = (row.failed_attempts ?? 0) + 1;
      await supabaseAdmin
        .from("recovery_codes")
        .update({
          failed_attempts: attempts,
          locked_until:
            attempts >= MAX_FAILED_ATTEMPTS
              ? new Date(Date.now() + LOCKOUT_MINUTES * 60_000).toISOString()
              : null,
        })
        .eq("user_id", profile.id);
      throw new Error(generic);
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(profile.id, {
      password: data.password,
    });
    if (updateError) throw new Error(updateError.message);

    const nextCode = generateRecoveryCode();
    await supabaseAdmin
      .from("recovery_codes")
      .update({
        code_hash: hashRecoveryCode(nextCode),
        failed_attempts: 0,
        locked_until: null,
        last_used_at: new Date().toISOString(),
      })
      .eq("user_id", profile.id);

    return { code: nextCode };
  });

/** Administrator issues a fresh recovery code for a partner who lost theirs. */
export const adminIssueRecoveryCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => userInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleError) throw new Error(roleError.message);
    if (!isAdmin) throw new Error("Forbidden");

    const { generateRecoveryCode, hashRecoveryCode } = await import("./recovery.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const code = generateRecoveryCode();
    const { error } = await supabaseAdmin.from("recovery_codes").upsert(
      {
        user_id: data.userId,
        code_hash: hashRecoveryCode(code),
        failed_attempts: 0,
        locked_until: null,
      },
      { onConflict: "user_id" },
    );
    if (error) throw new Error(error.message);
    return { code };
  });

/** Administrator sets a temporary password for a partner, with no email involved. */
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
