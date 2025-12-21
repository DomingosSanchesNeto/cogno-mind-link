-- Rename likert_value to response_value and change type to text for Yes/No
ALTER TABLE dilemma_responses 
  ALTER COLUMN likert_value TYPE text USING 
    CASE 
      WHEN likert_value IS NULL THEN NULL
      ELSE likert_value::text 
    END;

-- Rename the column
ALTER TABLE dilemma_responses RENAME COLUMN likert_value TO response_value;