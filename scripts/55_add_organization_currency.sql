-- Add currency settings to organizations table
-- This will support multi-currency functionality across the app

-- Add currency fields to organizations table
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS currency_code VARCHAR(3) DEFAULT 'GBP',
ADD COLUMN IF NOT EXISTS currency_symbol VARCHAR(10) DEFAULT '£',
ADD COLUMN IF NOT EXISTS date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
ADD COLUMN IF NOT EXISTS number_format VARCHAR(20) DEFAULT 'en-GB';

-- Update all existing organizations to use GBP as default
UPDATE organizations 
SET 
    currency_code = 'GBP',
    currency_symbol = '£',
    date_format = 'DD/MM/YYYY',
    number_format = 'en-GB'
WHERE currency_code IS NULL OR currency_code = '';

-- Add index for currency lookups
CREATE INDEX IF NOT EXISTS idx_organizations_currency ON organizations(currency_code);

-- Create currency configuration table for supported currencies
CREATE TABLE IF NOT EXISTS currency_configurations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    currency_code VARCHAR(3) NOT NULL UNIQUE,
    currency_name VARCHAR(50) NOT NULL,
    currency_symbol VARCHAR(10) NOT NULL,
    decimal_places INTEGER DEFAULT 2,
    symbol_position VARCHAR(10) DEFAULT 'before', -- 'before' or 'after'
    thousands_separator VARCHAR(1) DEFAULT ',',
    decimal_separator VARCHAR(1) DEFAULT '.',
    country_codes TEXT[], -- Array of country codes that commonly use this currency
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert common currencies
INSERT INTO currency_configurations (currency_code, currency_name, currency_symbol, decimal_places, symbol_position, thousands_separator, decimal_separator, country_codes, is_active) VALUES
('GBP', 'British Pound', '£', 2, 'before', ',', '.', ARRAY['GB', 'UK'], true),
('USD', 'US Dollar', '$', 2, 'before', ',', '.', ARRAY['US'], true),
('EUR', 'Euro', '€', 2, 'before', ',', '.', ARRAY['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'IE'], true),
('CAD', 'Canadian Dollar', 'C$', 2, 'before', ',', '.', ARRAY['CA'], true),
('AUD', 'Australian Dollar', 'A$', 2, 'before', ',', '.', ARRAY['AU'], true),
('JPY', 'Japanese Yen', '¥', 0, 'before', ',', '.', ARRAY['JP'], true),
('CHF', 'Swiss Franc', 'CHF', 2, 'after', ',', '.', ARRAY['CH'], true),
('SEK', 'Swedish Krona', 'kr', 2, 'after', ' ', ',', ARRAY['SE'], true),
('NOK', 'Norwegian Krone', 'kr', 2, 'after', ' ', ',', ARRAY['NO'], true),
('DKK', 'Danish Krone', 'kr', 2, 'after', ' ', ',', ARRAY['DK'], true)
ON CONFLICT (currency_code) DO UPDATE SET
    currency_name = EXCLUDED.currency_name,
    currency_symbol = EXCLUDED.currency_symbol,
    decimal_places = EXCLUDED.decimal_places,
    symbol_position = EXCLUDED.symbol_position,
    thousands_separator = EXCLUDED.thousands_separator,
    decimal_separator = EXCLUDED.decimal_separator,
    country_codes = EXCLUDED.country_codes,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Create function to get currency config for an organization
CREATE OR REPLACE FUNCTION get_org_currency_config(org_id UUID)
RETURNS TABLE (
    currency_code VARCHAR(3),
    currency_symbol VARCHAR(10),
    currency_name VARCHAR(50),
    decimal_places INTEGER,
    symbol_position VARCHAR(10),
    thousands_separator VARCHAR(1),
    decimal_separator VARCHAR(1)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(o.currency_code, 'GBP') as currency_code,
        COALESCE(o.currency_symbol, '£') as currency_symbol,
        COALESCE(cc.currency_name, 'British Pound') as currency_name,
        COALESCE(cc.decimal_places, 2) as decimal_places,
        COALESCE(cc.symbol_position, 'before') as symbol_position,
        COALESCE(cc.thousands_separator, ',') as thousands_separator,
        COALESCE(cc.decimal_separator, '.') as decimal_separator
    FROM organizations o
    LEFT JOIN currency_configurations cc ON o.currency_code = cc.currency_code
    WHERE o.id = org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT ON currency_configurations TO authenticated;
GRANT EXECUTE ON FUNCTION get_org_currency_config(UUID) TO authenticated;

-- Add RLS policies for currency configurations
ALTER TABLE currency_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active currencies" ON currency_configurations
    FOR SELECT USING (is_active = true);

-- Comment on the schema
COMMENT ON TABLE currency_configurations IS 'Configuration for supported currencies with formatting rules';
COMMENT ON FUNCTION get_org_currency_config(UUID) IS 'Get currency configuration for a specific organization';