-- Migration: Align documents table with data-models.md specification
-- This migration updates the documents table to match the canonical schema:
-- - Drop UUID column (not specified in data model)
-- - Add title column with default 'Untitled'
-- - Rename reference_documents to reference_numbers
-- - Update indices to match specification
-- - Update functions to use new column names

-- First, drop functions that depend on the table structure
DROP FUNCTION IF EXISTS public.create_document(UUID, TEXT, INTEGER[]);
DROP FUNCTION IF EXISTS public.get_user_document(UUID, INTEGER);
DROP FUNCTION IF EXISTS public.get_documents_referencing(UUID, INTEGER);
DROP FUNCTION IF EXISTS public.get_referenced_documents(UUID, INTEGER);
DROP FUNCTION IF EXISTS public.search_user_documents(UUID, TEXT);

-- Drop existing indices that don't match the specification
DROP INDEX IF EXISTS idx_documents_user_created;
DROP INDEX IF EXISTS idx_documents_id;
DROP INDEX IF EXISTS idx_documents_references;
DROP INDEX IF EXISTS idx_documents_content;

-- Add title column with default 'Untitled'
ALTER TABLE public.documents 
ADD COLUMN title TEXT DEFAULT 'Untitled';

-- Rename reference_documents to reference_numbers
ALTER TABLE public.documents 
RENAME COLUMN reference_documents TO reference_numbers;

-- Drop the UUID column (not specified in data model)
ALTER TABLE public.documents 
DROP COLUMN id;

-- Create indices as specified in data-models.md
-- Index for dashboard listing: (user_id, updated_at DESC)
CREATE INDEX idx_documents_user_updated_at ON public.documents(user_id, updated_at DESC);

-- GIN index for reverse-lookup on reference_numbers
CREATE INDEX idx_documents_reference_numbers_gin ON public.documents USING GIN(reference_numbers);

-- Recreate functions with updated column names and without UUID references

-- Function to create a document with auto-increment number
CREATE OR REPLACE FUNCTION public.create_document(
    p_user_id UUID,
    p_content TEXT DEFAULT '',
    p_reference_numbers INTEGER[] DEFAULT '{}',
    p_title TEXT DEFAULT NULL
)
RETURNS TABLE(
    user_id UUID,
    number INTEGER,
    title TEXT,
    content TEXT,
    reference_numbers INTEGER[],
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    next_num INTEGER;
    new_doc public.documents%ROWTYPE;
BEGIN
    -- Validate user
    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'User ID cannot be null';
    END IF;
    
    -- Get next number for this user (with row-level locking to prevent race conditions)
    SELECT COALESCE(MAX(d.number), 0) + 1 
    INTO next_num 
    FROM public.documents d
    WHERE d.user_id = p_user_id
    FOR UPDATE;
    
    -- Insert the document with auto-generated title if not provided
    INSERT INTO public.documents (user_id, number, title, content, reference_numbers)
    VALUES (
        p_user_id, 
        next_num, 
        COALESCE(p_title, 'Untitled'),
        p_content, 
        p_reference_numbers
    )
    RETURNING * INTO new_doc;
    
    -- Return the new document
    RETURN QUERY SELECT 
        new_doc.user_id,
        new_doc.number,
        new_doc.title,
        new_doc.content,
        new_doc.reference_numbers,
        new_doc.created_at,
        new_doc.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get a user's document by number
CREATE OR REPLACE FUNCTION public.get_user_document(
    p_user_id UUID,
    p_number INTEGER
)
RETURNS TABLE(
    user_id UUID,
    number INTEGER,
    title TEXT,
    content TEXT,
    reference_numbers INTEGER[],
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT d.user_id, d.number, d.title, d.content, d.reference_numbers, d.created_at, d.updated_at
    FROM public.documents d
    WHERE d.user_id = p_user_id AND d.number = p_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get documents that reference a specific user document
CREATE OR REPLACE FUNCTION public.get_documents_referencing(
    p_user_id UUID,
    p_target_number INTEGER
)
RETURNS TABLE(
    user_id UUID,
    number INTEGER,
    title TEXT,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT d.user_id, d.number, d.title, d.content, d.created_at, d.updated_at
    FROM public.documents d
    WHERE d.user_id = p_user_id 
    AND p_target_number = ANY(d.reference_numbers);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all documents referenced by a specific user document
CREATE OR REPLACE FUNCTION public.get_referenced_documents(
    p_user_id UUID,
    p_source_number INTEGER
)
RETURNS TABLE(
    user_id UUID,
    number INTEGER,
    title TEXT,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT d.user_id, d.number, d.title, d.content, d.created_at, d.updated_at
    FROM public.documents d
    WHERE d.user_id = p_user_id 
    AND d.number = ANY(
        SELECT unnest(ref_docs.reference_numbers)
        FROM public.documents ref_docs
        WHERE ref_docs.user_id = p_user_id AND ref_docs.number = p_source_number
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search user's documents
CREATE OR REPLACE FUNCTION public.search_user_documents(
    p_user_id UUID,
    p_search_term TEXT
)
RETURNS TABLE(
    user_id UUID,
    number INTEGER,
    title TEXT,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.user_id, 
        d.number, 
        d.title,
        d.content, 
        d.created_at, 
        d.updated_at,
        ts_rank(to_tsvector('english', d.content || ' ' || d.title), plainto_tsquery('english', p_search_term)) as rank
    FROM public.documents d
    WHERE d.user_id = p_user_id 
    AND (to_tsvector('english', d.content || ' ' || d.title) @@ plainto_tsquery('english', p_search_term))
    ORDER BY rank DESC, d.number DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update table and column comments to match data model
COMMENT ON TABLE public.documents IS 'User documents with per-user auto-incrementing numbers and cross-references';
COMMENT ON COLUMN public.documents.user_id IS 'Owner of the document (FK to auth.users)';
COMMENT ON COLUMN public.documents.number IS 'Human-friendly per-user ID (e.g. /doc/42) - part of composite PK';
COMMENT ON COLUMN public.documents.title IS 'Display name (editable)';
COMMENT ON COLUMN public.documents.content IS 'Document body';
COMMENT ON COLUMN public.documents.reference_numbers IS 'Links to other docs owned by same user';
COMMENT ON COLUMN public.documents.created_at IS 'First save timestamp';
COMMENT ON COLUMN public.documents.updated_at IS 'Last modification (auto-updated via trigger)'; 
