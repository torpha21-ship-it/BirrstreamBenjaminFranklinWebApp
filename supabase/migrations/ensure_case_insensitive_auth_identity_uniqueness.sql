CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email_lower
ON public.users (LOWER(email));

CREATE UNIQUE INDEX IF NOT EXISTS uq_users_username_lower
ON public.users (LOWER(username));
