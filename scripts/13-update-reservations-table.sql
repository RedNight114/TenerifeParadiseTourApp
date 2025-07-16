-- Add new columns to reservations table for contact information
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS contact_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS special_requests TEXT,
ADD COLUMN IF NOT EXISTS reservation_time VARCHAR(10);

-- Update existing reservations to have contact info from profiles
UPDATE reservations 
SET 
  contact_name = profiles.full_name,
  contact_email = profiles.email
FROM profiles 
WHERE reservations.user_id = profiles.id 
AND (reservations.contact_name IS NULL OR reservations.contact_email IS NULL);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_payment_status ON reservations(payment_status);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_created_at ON reservations(created_at);

-- Update RLS policies to allow admin access
DROP POLICY IF EXISTS "Admin can manage all reservations" ON reservations;
CREATE POLICY "Admin can manage all reservations" ON reservations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
