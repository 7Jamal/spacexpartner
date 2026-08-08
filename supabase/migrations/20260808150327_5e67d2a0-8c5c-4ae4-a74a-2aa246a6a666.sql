CREATE TABLE public.security_answers (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slot smallint NOT NULL CHECK (slot BETWEEN 1 AND 3),
  question_key text NOT NULL,
  answer_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, slot)
);

CREATE TABLE public.security_answer_attempts (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  failed_attempts integer NOT NULL DEFAULT 0,
  locked_until timestamptz,
  last_used_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.security_answers TO authenticated;
GRANT ALL ON public.security_answers TO service_role;
GRANT ALL ON public.security_answer_attempts TO service_role;

ALTER TABLE public.security_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_answer_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "partners see their own security questions"
ON public.security_answers FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE TRIGGER security_answers_touch BEFORE UPDATE ON public.security_answers
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER security_answer_attempts_touch BEFORE UPDATE ON public.security_answer_attempts
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();