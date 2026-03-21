
DROP FUNCTION public.check_ip_usage(text, integer);

CREATE OR REPLACE FUNCTION public.check_ip_usage(p_ip text, p_limit integer DEFAULT 5)
RETURNS integer
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
  
  IF current_count > p_limit THEN
    RETURN -1;
  END IF;
  
  RETURN p_limit - current_count;
END;
$$;
