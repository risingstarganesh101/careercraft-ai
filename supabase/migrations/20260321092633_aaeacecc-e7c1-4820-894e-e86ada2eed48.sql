
-- Per-IP daily usage tracking table
CREATE TABLE public.ip_daily_usage (
  ip_address text NOT NULL,
  usage_date date NOT NULL DEFAULT CURRENT_DATE,
  request_count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (ip_address, usage_date)
);

ALTER TABLE public.ip_daily_usage ENABLE ROW LEVEL SECURITY;

-- Function to check and increment per-IP usage
CREATE OR REPLACE FUNCTION public.check_ip_usage(p_ip text, p_limit integer DEFAULT 20)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_count integer;
BEGIN
  INSERT INTO public.ip_daily_usage (ip_address, usage_date, request_count)
  VALUES (p_ip, CURRENT_DATE, 1)
  ON CONFLICT (ip_address, usage_date)
  DO UPDATE SET request_count = ip_daily_usage.request_count + 1
  RETURNING request_count INTO current_count;
  
  RETURN current_count <= p_limit;
END;
$$;

-- Auto-cleanup: delete rows older than 3 days to keep table small
CREATE OR REPLACE FUNCTION public.cleanup_old_ip_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.ip_daily_usage WHERE usage_date < CURRENT_DATE - INTERVAL '3 days';
END;
$$;
