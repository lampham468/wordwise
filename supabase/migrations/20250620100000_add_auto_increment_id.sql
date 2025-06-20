-- Migration: Add auto-incrementing ID and update reference system
-- This migration adds GitHub-style auto-incrementing IDs to documents
-- and updates the reference system to use these human-readable IDs

-- Add auto-incrementing number column to documents table
ALTER TABLE public.documents 
ADD COLUMN number SERIAL UNIQUE NOT NULL;

-- Create a unique index on the number column for fast lookups
CREATE UNIQUE INDEX documents_number_idx ON public.documents(number);

-- Add new columns for referencing documents by their auto-incrementing IDs
-- Keep the existing UUID-based columns for backward compatibility
ALTER TABLE public.documents 
ADD COLUMN parent_document_number INTEGER REFERENCES public.documents(number) ON DELETE SET NULL,
ADD COLUMN referenced_document_numbers INTEGER[] DEFAULT '{}';

-- Create indexes for the new number-based references
CREATE INDEX documents_parent_document_number_idx ON public.documents(parent_document_number);
CREATE INDEX documents_referenced_document_numbers_idx ON public.documents USING GIN(referenced_document_numbers);

-- Update the helper functions to work with auto-incrementing IDs

-- Function to get documents that reference a specific document by number
CREATE OR REPLACE FUNCTION public.get_documents_referencing_by_number(target_document_number INTEGER)
RETURNS TABLE(
    id UUID,
    number INTEGER,
    title TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT d.id, d.number, d.title, d.created_at, d.updated_at
    FROM public.documents d
    WHERE target_document_number = ANY(d.referenced_document_numbers);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get document hierarchy by number
CREATE OR REPLACE FUNCTION public.get_document_hierarchy_by_number(root_document_number INTEGER)
RETURNS TABLE(
    id UUID,
    number INTEGER,
    title TEXT,
    level INTEGER,
    path INTEGER[]
) AS $$
WITH RECURSIVE document_tree AS (
    -- Base case: start with the root document
    SELECT 
        d.id,
        d.number,
        d.title,
        0 as level,
        ARRAY[d.number] as path
    FROM public.documents d
    WHERE d.number = root_document_number
    
    UNION ALL
    
    -- Recursive case: find children
    SELECT 
        d.id,
        d.number,
        d.title,
        dt.level + 1,
        dt.path || d.number
    FROM public.documents d
    INNER JOIN document_tree dt ON d.parent_document_number = dt.number
    WHERE NOT d.number = ANY(dt.path) -- Prevent infinite loops
)
SELECT * FROM document_tree;
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to get a document by its auto-incrementing number
CREATE OR REPLACE FUNCTION public.get_document_by_number(doc_number INTEGER)
RETURNS TABLE(
    id UUID,
    number INTEGER,
    title TEXT,
    content TEXT,
    parent_document_id UUID,
    parent_document_number INTEGER,
    referenced_document_ids UUID[],
    referenced_document_numbers INTEGER[],
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.number,
        d.title,
        d.content,
        d.parent_document_id,
        d.parent_document_number,
        d.referenced_document_ids,
        d.referenced_document_numbers,
        d.created_at,
        d.updated_at
    FROM public.documents d
    WHERE d.number = doc_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to convert UUID array to number array (helper for migration)
CREATE OR REPLACE FUNCTION public.convert_uuid_refs_to_numbers()
RETURNS void AS $$
DECLARE
    doc_record RECORD;
    uuid_ref UUID;
    number_refs INTEGER[] := '{}';
    ref_number INTEGER;
BEGIN
    -- Loop through all documents that have UUID references
    FOR doc_record IN 
        SELECT id, referenced_document_ids 
        FROM public.documents 
        WHERE array_length(referenced_document_ids, 1) > 0
    LOOP
        number_refs := '{}';
        
        -- Convert each UUID reference to a number reference
        FOREACH uuid_ref IN ARRAY doc_record.referenced_document_ids
        LOOP
            SELECT number INTO ref_number 
            FROM public.documents 
            WHERE id = uuid_ref;
            
            IF ref_number IS NOT NULL THEN
                number_refs := array_append(number_refs, ref_number);
            END IF;
        END LOOP;
        
        -- Update the document with the converted number references
        UPDATE public.documents 
        SET referenced_document_numbers = number_refs
        WHERE id = doc_record.id;
    END LOOP;
    
    -- Also convert parent_document_id to parent_document_number
    UPDATE public.documents 
    SET parent_document_number = (
        SELECT number 
        FROM public.documents parent 
        WHERE parent.id = documents.parent_document_id
    )
    WHERE parent_document_id IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Run the conversion function to migrate existing data
SELECT public.convert_uuid_refs_to_numbers();

-- Drop the conversion function as it's no longer needed
DROP FUNCTION public.convert_uuid_refs_to_numbers();

-- Add a comment to the table explaining the dual ID system
COMMENT ON TABLE public.documents IS 'Documents table with dual ID system: UUID for internal operations, auto-incrementing number for user-facing references (like GitHub issues)';
COMMENT ON COLUMN public.documents.id IS 'Internal UUID primary key';
COMMENT ON COLUMN public.documents.number IS 'Auto-incrementing user-facing ID (like GitHub issue numbers)';
COMMENT ON COLUMN public.documents.parent_document_id IS 'Parent document UUID (legacy, prefer parent_document_number)';
COMMENT ON COLUMN public.documents.parent_document_number IS 'Parent document auto-incrementing ID';
COMMENT ON COLUMN public.documents.referenced_document_ids IS 'Referenced document UUIDs (legacy, prefer referenced_document_numbers)';
COMMENT ON COLUMN public.documents.referenced_document_numbers IS 'Referenced document auto-incrementing IDs'; 
