-- Migration: User-scoped documents with composite primary key
-- This migration completely restructures the documents table to support
-- user-scoped auto-incrementing document numbers (like personal GitHub issues)

-- Drop existing table and start fresh
DROP TABLE IF EXISTS public.documents CASCADE;

-- Create new documents table with user-scoped auto-increment
CREATE TABLE public.documents (
    -- User ownership (part of composite PK)
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Auto-increment number per user (part of composite PK)
    number INTEGER NOT NULL,
    
    -- Global UUID for internal operations
    id UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    
    -- Content
    content TEXT NOT NULL DEFAULT '',
    
    -- References to other documents (user's document numbers)
    reference_documents INTEGER[] DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Composite primary key (user_id + number)
    PRIMARY KEY (user_id, number)
);

-- Create indexes for performance
CREATE INDEX idx_documents_user_created ON public.documents(user_id, created_at DESC);
CREATE INDEX idx_documents_user_updated ON public.documents(user_id, updated_at DESC);
CREATE INDEX idx_documents_id ON public.documents(id); -- For UUID lookups
CREATE INDEX idx_documents_references ON public.documents USING GIN(reference_documents);
CREATE INDEX idx_documents_content ON public.documents USING GIN(to_tsvector('english', content));

-- Function to get next document number for a user
CREATE OR REPLACE FUNCTION public.get_next_document_number(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    next_num INTEGER;
BEGIN
    -- Get the highest number for this user and add 1
    SELECT COALESCE(MAX(number), 0) + 1 
    INTO next_num 
    FROM public.documents 
    WHERE user_id = p_user_id;
    
    RETURN next_num;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a document with auto-increment number
CREATE OR REPLACE FUNCTION public.create_document(
    p_user_id UUID,
    p_content TEXT DEFAULT '',
    p_reference_documents INTEGER[] DEFAULT '{}'
)
RETURNS TABLE(
    user_id UUID,
    number INTEGER,
    id UUID,
    content TEXT,
    reference_documents INTEGER[],
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
    
    -- Insert the document
    INSERT INTO public.documents (user_id, number, content, reference_documents)
    VALUES (p_user_id, next_num, p_content, p_reference_documents)
    RETURNING * INTO new_doc;
    
    -- Return the new document
    RETURN QUERY SELECT 
        new_doc.user_id,
        new_doc.number,
        new_doc.id,
        new_doc.content,
        new_doc.reference_documents,
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
    id UUID,
    content TEXT,
    reference_documents INTEGER[],
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT d.user_id, d.number, d.id, d.content, d.reference_documents, d.created_at, d.updated_at
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
    id UUID,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT d.user_id, d.number, d.id, d.content, d.created_at, d.updated_at
    FROM public.documents d
    WHERE d.user_id = p_user_id 
    AND p_target_number = ANY(d.reference_documents);
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
    id UUID,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT d.user_id, d.number, d.id, d.content, d.created_at, d.updated_at
    FROM public.documents d
    WHERE d.user_id = p_user_id 
    AND d.number = ANY(
        SELECT unnest(ref_docs.reference_documents)
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
    id UUID,
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
        d.id, 
        d.content, 
        d.created_at, 
        d.updated_at,
        ts_rank(to_tsvector('english', d.content), plainto_tsquery('english', p_search_term)) as rank
    FROM public.documents d
    WHERE d.user_id = p_user_id 
    AND to_tsvector('english', d.content) @@ plainto_tsquery('english', p_search_term)
    ORDER BY rank DESC, d.number DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_documents_updated_at
    BEFORE UPDATE ON public.documents
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only access their own documents
CREATE POLICY "Users can view own documents" ON public.documents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" ON public.documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" ON public.documents
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON public.documents
    FOR DELETE USING (auth.uid() = user_id);

-- Add table and column comments
COMMENT ON TABLE public.documents IS 'User-scoped documents with auto-incrementing numbers per user (like personal GitHub issues)';
COMMENT ON COLUMN public.documents.user_id IS 'Owner of the document (part of composite PK)';
COMMENT ON COLUMN public.documents.number IS 'Auto-incrementing document number per user (part of composite PK)';
COMMENT ON COLUMN public.documents.id IS 'Global UUID for internal operations and external references';
COMMENT ON COLUMN public.documents.content IS 'Document content/body';
COMMENT ON COLUMN public.documents.reference_documents IS 'Array of document numbers that this document references (within same user)';
COMMENT ON COLUMN public.documents.created_at IS 'When the document was created';
COMMENT ON COLUMN public.documents.updated_at IS 'When the document was last modified (auto-updated)'; 
