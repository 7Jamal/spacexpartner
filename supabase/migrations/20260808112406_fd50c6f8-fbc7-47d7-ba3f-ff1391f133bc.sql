CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_next date := (date_trunc('week', now() at time zone 'utc')::date + 11);
BEGIN
  INSERT INTO public.profiles (id, full_name, email, next_payment_date)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    v_next
  )
  ON CONFLICT (id) DO NOTHING;

  IF lower(NEW.email) = 'umakukaemekapeter@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'employee') ON CONFLICT DO NOTHING;

    INSERT INTO public.payments (user_id, payment_date, status, amount)
    VALUES (NEW.id, v_next, 'upcoming', 5000);

    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.id,
      'Welcome to Space Partnership Portal',
      'Your employee account has been created successfully. Your weekly salary of $5,000 will be paid every week. Please complete your bank details and upload any supporting documents so that payments can be processed without delay.',
      'general'
    );
  END IF;

  RETURN NEW;
END; $function$;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE lower(email) = 'umakukaemekapeter@gmail.com'
ON CONFLICT DO NOTHING;