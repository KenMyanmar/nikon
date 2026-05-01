UPDATE categories
SET name = 'Food & Beverage', updated_at = now()
WHERE name = 'F & B Solutions' AND depth = 0;