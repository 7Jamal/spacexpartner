import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const deleteInput = z.object({ userId: z.string().uuid() });

/**
 * Permanently removes an employee account (login + all related records).
 * Only callable by the Super Administrator.
 */
export const deleteEmployee = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => deleteInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleError) throw new Error(roleError.message);
    if (!isAdmin) throw new Error("Forbidden");
    if (data.userId === context.userId) throw new Error("You cannot delete your own account");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: files } = await supabaseAdmin.storage
      .from("employee-documents")
      .list(data.userId);
    if (files?.length) {
      await supabaseAdmin.storage
        .from("employee-documents")
        .remove(files.map((f) => `${data.userId}/${f.name}`));
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);

    return { ok: true };
  });