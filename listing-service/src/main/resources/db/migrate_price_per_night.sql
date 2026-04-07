-- Migration : renommage price_per_month -> price_per_night
-- À exécuter une seule fois sur la base listing_db existante

ALTER TABLE listings RENAME COLUMN price_per_month TO price_per_night;
