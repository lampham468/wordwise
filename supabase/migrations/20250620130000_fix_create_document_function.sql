-- Fix create_document function: Remove FOR UPDATE with aggregate function
-- The FOR UPDATE clause cannot be used with aggregate functions like MAX()
-- Instead, we'll use a more robust approach for generating sequential numbers

-- Drop the problematic function
DROP FUNCTION IF EXISTS public.create_document(UUID, TEXT, INTEGER[], TEXT);

-- Recreate the function without FOR UPDATE on aggregate
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
    
    -- Get next number for this user
    -- Use a more robust approach that handles concurrent access
    LOOP
        -- Get the current max number for this user
        SELECT COALESCE(MAX(d.number), 0) + 1 
        INTO next_num 
        FROM public.documents d
        WHERE d.user_id = p_user_id;
        
        -- Try to insert with this number
        BEGIN
            INSERT INTO public.documents (user_id, number, title, content, reference_numbers)
            VALUES (
                p_user_id, 
                next_num, 
                COALESCE(p_title, 'Untitled'),
                p_content, 
                p_reference_numbers
            )
            RETURNING * INTO new_doc;
            
            -- If we get here, the insert was successful
            EXIT;
            
        EXCEPTION
            WHEN unique_violation THEN
                -- If there's a unique constraint violation, try again with the next number
                -- This handles the rare case of concurrent document creation
                CONTINUE;
        END;
    END LOOP;
    
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
