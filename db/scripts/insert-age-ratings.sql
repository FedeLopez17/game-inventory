INSERT INTO pegi_ratings (rating, description, image_url) VALUES
('PEGI 3', 'Suitable for all ages, no sounds or images likely to frighten young children. Very mild violence in a comical setting is acceptable.', 'pegi-3.png'),
('PEGI 7', 'May contain frightening scenes or sounds for young children. Mild violence in a non-realistic or comical context is acceptable.', 'pegi-7.png'),
('PEGI 12', 'Moderate violence towards fantasy characters or mild sexual innuendo. Mild bad language is acceptable.', 'pegi-12.png'),
('PEGI 16', 'Realistic violence or sexual activity, use of bad language, alcohol, tobacco, or drugs may be present.', 'pegi-16.png'),
('PEGI 18', 'Intense violence, motiveless killing, explicit sexual content, glamorization of drugs, or gambling is present.', 'pegi-18.png');


INSERT INTO esrb_ratings (rating, description, image_url) VALUES
('Everyone (E)', 'Suitable for all ages, may include minimal cartoon or fantasy violence and infrequent use of mild language.', 'esrb-everyone.png'),
('Everyone 10+ (E10+)', 'Suitable for ages 10 and over, containing more cartoon or fantasy violence and minimal suggestive themes.', 'esrb-everyone-over-10.png'),
('Teen (T)', 'Suitable for ages 13 and over, may contain moderate violence, suggestive themes, crude humor, and stronger language.', 'esrb-teen.png'),
('Mature 17+ (M)', 'Suitable for ages 17 and over, includes intense violence, blood and gore, sexual content, and strong language.', 'esrb-mature.png'),
('Adults Only 18+ (AO)', 'Adults Only 18+, includes graphic sexual content, intense violence, or real-money gambling.', 'esrb-adults-only.png'),
('Rating Pending (RP)', 'Rating Pending, used for promotional materials of games awaiting final ESRB rating.', 'esrb-rating-pending.png'),
('Rating Pending Likely Mature (RP)', 'Used for promotional materials of games expected to carry a "Mature" rating.', 'esrb-rating-pending-likely-mature.png');
