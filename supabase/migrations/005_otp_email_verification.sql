-- ============================================
-- OTP EMAIL VERIFICATION MIGRATION
-- ============================================

-- ============================================
-- OTP CODES TABLE (for email verification)
-- ============================================
CREATE TABLE IF NOT EXISTS public.otp_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON public.otp_codes(email);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON public.otp_codes(expires_at);

-- ============================================
-- ADD email_verified to profiles
-- ============================================
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- ============================================
-- MARK EXISTING USERS AS VERIFIED
-- (So they don't get locked out)
-- ============================================
UPDATE public.profiles SET email_verified = true WHERE email_verified IS NULL OR email_verified = false;

-- ============================================
-- RLS Policy for otp_codes (service role only)
-- ============================================
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Only service role can access (backend only)
CREATE POLICY "Service role full access to otp_codes" ON public.otp_codes
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
