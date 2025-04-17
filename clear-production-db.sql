-- Clear production database script
-- Use this script on the production database to clear all domains
-- WARNING: This will delete all domain data - only run this with care

-- Start a transaction for safety
BEGIN;

-- Clear related tables first to avoid foreign key constraints
DELETE FROM price_change_logs;
DELETE FROM offers;

-- Try to delete from other tables that might reference domains
DO $$
BEGIN
    -- These are wrapped in exception blocks in case the tables don't exist
    BEGIN
        DELETE FROM inquiries;
    EXCEPTION WHEN undefined_table THEN
        -- Table doesn't exist, ignore
    END;
    
    BEGIN
        DELETE FROM communications;
    EXCEPTION WHEN undefined_table THEN
        -- Table doesn't exist, ignore
    END;
    
    BEGIN
        DELETE FROM wishlist_items;
    EXCEPTION WHEN undefined_table THEN
        -- Table doesn't exist, ignore
    END;
    
    BEGIN
        DELETE FROM featured_domains;
    EXCEPTION WHEN undefined_table THEN
        -- Table doesn't exist, ignore
    END;
END
$$;

-- Delete all domains
DELETE FROM domains;

-- Log the deletion in data_versions table
INSERT INTO data_versions(data_type, operation, version, record_count, last_updated, checksum, details)
VALUES('domains', 'manual-production-cleanup', 1, 
       (SELECT COUNT(*) FROM domains), 
       NOW(), 
       MD5(NOW()::text), 
       'Manual production cleanup via SQL script');

-- Commit the transaction
COMMIT;