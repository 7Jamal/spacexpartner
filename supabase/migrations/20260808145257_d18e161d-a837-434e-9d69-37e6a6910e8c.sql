CREATE TABLE public.recovery_codes (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  code_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz,
  failed_attempts integer NOT NULL DEFAULT 0,
  locked_until timestamptz
);

GRANT ALL ON public.recovery_codes TO service_role;

ALTER TABLE public.recovery_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can see whether they have a recovery code"
ON public.recovery_codes FOR SELECT TO authenticated
USING (auth.uid() = user_id);

GRANT SELECT (user_id, created_at, updated_at, last_used_at) ON public.recovery_codes TO authenticated;

CREATE TRIGGER recovery_codes_touch BEFORE UPDATE ON public.recovery_codes
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();