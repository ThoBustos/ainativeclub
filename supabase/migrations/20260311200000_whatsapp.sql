-- WhatsApp phase: phone lookup on members, channel + dedup tracking on messages

-- Members: phone number for WhatsApp sender lookup
ALTER TABLE members ADD COLUMN phone text UNIQUE;

-- Messages: track channel of origin and deduplicate Twilio deliveries
ALTER TABLE messages ADD COLUMN channel text NOT NULL DEFAULT 'web' CHECK (channel IN ('web', 'whatsapp'));
ALTER TABLE messages ADD COLUMN twilio_sid text UNIQUE;

-- Fast phone lookup (sparse — only members with phone set)
CREATE INDEX idx_members_phone ON members (phone) WHERE phone IS NOT NULL;

-- Fast WhatsApp history queries
CREATE INDEX idx_messages_member_channel ON messages (member_id, channel, created_at DESC);
