-- Add deleted_at column to upload_batches for soft delete functionality
ALTER TABLE public.upload_batches 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for faster queries on deleted uploads
CREATE INDEX IF NOT EXISTS idx_upload_batches_deleted_at 
ON public.upload_batches(deleted_at) 
WHERE deleted_at IS NOT NULL;

-- Create a function to automatically clean up old deleted batches (48h+)
CREATE OR REPLACE FUNCTION public.cleanup_expired_deleted_batches()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.upload_batches
  WHERE deleted_at IS NOT NULL
  AND deleted_at < NOW() - INTERVAL '48 hours';
END;
$$;