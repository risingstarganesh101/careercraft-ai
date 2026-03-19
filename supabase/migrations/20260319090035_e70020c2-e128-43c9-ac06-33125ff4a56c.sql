
CREATE TABLE public.global_daily_usage (
  usage_date date PRIMARY KEY DEFAULT CURRENT_DATE,
  request_count integer NOT NULL DEFAULT 0
);

ALTER TABLE public.global_daily_usage ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.increment_daily_usage(max_limit integer DEFAULT 750)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count integer;
BEGIN
  INSERT INTO public.global_daily_usage (usage_date, request_count)
  VALUES (CURRENT_DATE, 1)
  ON CONFLICT (usage_date)
  DO UPDATE SET request_count = global_daily_usage.request_count + 1
  RETURNING request_count INTO current_count;
  
  RETURN current_count <= max_limit;
END;
$$;
