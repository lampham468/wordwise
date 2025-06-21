-- Create suggestions table for LLM-generated suggestions
-- This table stores AI-powered style, tone, content, and engagement suggestions

CREATE TABLE IF NOT EXISTS public.suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_number int NOT NULL,
  suggestion_type text NOT NULL CHECK (suggestion_type IN ('grammar', 'spelling', 'style', 'tone', 'content', 'engagement')),
  range_start int NOT NULL DEFAULT 0,
  range_end int NOT NULL DEFAULT 0,
  message text NOT NULL,
  proposed_text text,
  engine text,
  content_hash text NOT NULL,
  accepted boolean DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  
  -- Foreign key constraint to documents table
  FOREIGN KEY (user_id, document_number) REFERENCES public.documents(user_id, number) ON DELETE CASCADE
);

-- Create indexes for efficient querying
CREATE INDEX idx_suggestions_user_document ON public.suggestions(user_id, document_number);
CREATE INDEX idx_suggestions_content_hash ON public.suggestions(content_hash);
CREATE INDEX idx_suggestions_type ON public.suggestions(suggestion_type);
CREATE INDEX idx_suggestions_created_at ON public.suggestions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

-- Create policy for user access to their own suggestions
CREATE POLICY user_can_manage_suggestions
  ON public.suggestions
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.suggestions TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated; 
