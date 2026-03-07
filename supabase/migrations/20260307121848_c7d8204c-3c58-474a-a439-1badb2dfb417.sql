-- Mark 9 additional existing brands as featured (replacing the 9 that don't exist in DB)
UPDATE brands SET is_featured = true
WHERE name IN ('Luzerne', 'Pujadas', 'SIMONELLI', 'BORMIOLI ROCCO', 'KARCHER', 'SPIEGELAU', 'HEPP', 'NACHTMANN', 'RUBBERMAID')
AND is_active = true;