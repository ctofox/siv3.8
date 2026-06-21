-- Add RPC function for getting next journal entry number
CREATE OR REPLACE FUNCTION get_next_journal_number()
RETURNS text AS $$
DECLARE
  next_num int;
BEGIN
  next_num := nextval('journal_entry_seq');
  RETURN 'JE-' || next_num::text;
END;
$$ LANGUAGE plpgsql;