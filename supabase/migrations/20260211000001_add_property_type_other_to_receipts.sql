-- Add property_type_other field to receipts table
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS property_type_other TEXT;

COMMENT ON COLUMN receipts.property_type_other IS 'When property_type is OTHER, this field stores the custom property type description';
