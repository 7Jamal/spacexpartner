ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country text NOT NULL DEFAULT '';
ALTER TABLE public.profiles ALTER COLUMN weekly_salary SET DEFAULT 200000;
ALTER TABLE public.payments ALTER COLUMN amount SET DEFAULT 200000;
UPDATE public.profiles SET weekly_salary = 200000;
UPDATE public.payments SET amount = 200000;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  v_next date := (now() at time zone 'utc')::date;
BEGIN
  INSERT INTO public.profiles (id, full_name, email, country, next_payment_date, weekly_salary)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'country', ''),
    v_next, 200000
  )
  ON CONFLICT (id) DO NOTHING;

  IF lower(NEW.email) = 'umakukaemekapeter@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'employee') ON CONFLICT DO NOTHING;
    INSERT INTO public.payments (user_id, payment_date, status, amount)
    VALUES (NEW.id, v_next, 'upcoming', 200000);
  END IF;
  RETURN NEW;
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;