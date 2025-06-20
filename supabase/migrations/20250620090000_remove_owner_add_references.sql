-- Migration: Remove owner column and add document references
-- This migration removes user ownership from documents and adds the ability
-- for documents to reference other documents

-- First, drop the existing RLS policies that depend on the owner column
DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;

-- Drop the owner-based index
DROP INDEX IF EXISTS documents_owner_updated_at_idx;

-- Remove the owner column
ALTER TABLE public.documents DROP COLUMN IF EXISTS owner;

-- Add document reference columns
-- parent_document_id: For hierarchical document relationships (optional)
-- referenced_document_ids: Array of document IDs that this document references
ALTER TABLE public.documents 
ADD COLUMN parent_document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
ADD COLUMN referenced_document_ids UUID[] DEFAULT '{}';

-- Create new RLS policies for open access
-- Since there's no owner, documents are accessible to all authenticated users

-- Policy: Authenticated users can view all documents
CREATE POLICY "Authenticated users can view documents" ON public.documents
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Authenticated users can insert documents
CREATE POLICY "Authenticated users can insert documents" ON public.documents
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Authenticated users can update documents
CREATE POLICY "Authenticated users can update documents" ON public.documents
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy: Authenticated users can delete documents
CREATE POLICY "Authenticated users can delete documents" ON public.documents
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS documents_updated_at_idx 
    ON public.documents(updated_at DESC);

CREATE INDEX IF NOT EXISTS documents_parent_document_id_idx 
    ON public.documents(parent_document_id);

CREATE INDEX IF NOT EXISTS documents_referenced_document_ids_idx 
    ON public.documents USING GIN(referenced_document_ids);

-- Create index for title search (useful for document lookup)
CREATE INDEX IF NOT EXISTS documents_title_idx 
    ON public.documents(title);

-- Add a function to get all documents that reference a specific document
CREATE OR REPLACE FUNCTION public.get_documents_referencing(target_document_id UUID)
RETURNS TABLE(
    id UUID,
    title TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT d.id, d.title, d.created_at, d.updated_at
    FROM public.documents d
    WHERE target_document_id = ANY(d.referenced_document_ids);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a function to get the document hierarchy (parent-child relationships)
CREATE OR REPLACE FUNCTION public.get_document_hierarchy(root_document_id UUID)
RETURNS TABLE(
    id UUID,
    title TEXT,
    level INTEGER,
    path UUID[]
) AS $$
WITH RECURSIVE document_tree AS (
    -- Base case: start with the root document
    SELECT 
        d.id,
        d.title,
        0 as level,
        ARRAY[d.id] as path
    FROM public.documents d
    WHERE d.id = root_document_id
    
    UNION ALL
    
    -- Recursive case: find children
    SELECT 
        d.id,
        d.title,
        dt.level + 1,
        dt.path || d.id
    FROM public.documents d
    INNER JOIN document_tree dt ON d.parent_document_id = dt.id
    WHERE NOT d.id = ANY(dt.path) -- Prevent infinite loops
)
SELECT * FROM document_tree;
$$ LANGUAGE sql SECURITY DEFINER; 
