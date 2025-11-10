# Supabase Storage Setup

This guide explains how to set up Supabase Storage buckets for handling large file uploads.

## Why This Is Needed

Vercel has a default request body size limit of 4.5MB for serverless functions. To handle larger PDF and audio files, we use Supabase Storage as an intermediate storage solution.

## Setup Instructions

### 1. Create Storage Buckets

Log in to your Supabase project dashboard and navigate to the **Storage** section.

Create two new buckets:

#### Bucket 1: `pdf-files`
- **Name**: `pdf-files`
- **Public**: Yes (enable public access)
- **File size limit**: 50MB (or as needed)
- **Allowed MIME types**:
  - `application/pdf`
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
  - `text/plain`

#### Bucket 2: `audio-files`
- **Name**: `audio-files`
- **Public**: Yes (enable public access)
- **File size limit**: 100MB (or as needed)
- **Allowed MIME types**:
  - `audio/mpeg`
  - `audio/wav`
  - `audio/mp4`
  - `audio/x-m4a`
  - `audio/webm`
  - `audio/ogg`

### 2. Configure Storage Policies (REQUIRED)

**IMPORTANT**: Files are now uploaded directly from the browser to Supabase Storage to bypass Vercel's 4.5MB limit. You **must** configure RLS policies to allow client-side uploads.

Go to **Storage** → Select each bucket → **Policies** tab → Click **"New Policy"**

#### For `pdf-files` bucket:

**Policy 1: Allow public uploads**
```sql
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'pdf-files');
```

**Policy 2: Allow public reads**
```sql
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
USING (bucket_id = 'pdf-files');
```

**Policy 3: Allow server to delete**
```sql
CREATE POLICY "Allow deletes"
ON storage.objects FOR DELETE
USING (bucket_id = 'pdf-files');
```

#### For `audio-files` bucket:

**Policy 1: Allow public uploads**
```sql
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'audio-files');
```

**Policy 2: Allow public reads**
```sql
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
USING (bucket_id = 'audio-files');
```

**Policy 3: Allow server to delete**
```sql
CREATE POLICY "Allow deletes"
ON storage.objects FOR DELETE
USING (bucket_id = 'audio-files');
```

**OR use the Supabase Dashboard UI:**
1. Go to Storage → select bucket → Policies
2. Click "New Policy"
3. Choose "For full customization" template
4. Set operation: INSERT, SELECT, or DELETE
5. Leave policy expression empty (allows all)
6. Click "Review" → "Save policy"

### 3. Verify Setup

After creating the buckets:

1. Go to **Storage** → **Policies** in your Supabase dashboard
2. Verify that both buckets have INSERT, SELECT, and DELETE policies enabled
3. Test uploading a file manually to ensure the buckets are working

## How It Works

1. **File Upload**: When users upload files larger than 3MB, they're first uploaded to Supabase Storage
2. **Processing**: The backend downloads files from storage, processes them with AI, and saves the analysis
3. **Cleanup**: After analysis is complete, files are automatically deleted from storage
4. **Fallback**: Files smaller than 3MB use direct upload (original method) for faster processing

## Environment Variables

Ensure your `.env.local` file has the Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**IMPORTANT**: The `SUPABASE_SERVICE_ROLE_KEY` is required for server-side file uploads and bypasses RLS policies. This key should **NEVER** be exposed to the client side.

To find your service role key:
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Find the **Service Role Key** (secret) - this is different from the anon/public key
4. Copy it and add it to your `.env.local` file

## Troubleshooting

### Upload Fails with 403/RLS Error
**Error**: `new row violates row-level security policy`

**Solution**:
- Make sure you've added `SUPABASE_SERVICE_ROLE_KEY` to your `.env.local` file
- Verify the service role key is correct (found in Supabase Dashboard → Settings → API)
- Restart your development server after adding the environment variable

### Upload Fails with 413 Error
- Verify that Supabase storage buckets are created
- Check that the file size limits on buckets are high enough
- This error should only occur for files smaller than 3MB (using direct upload)

### Files Not Being Deleted
- Files are automatically cleaned up after analysis completes
- Check server logs for any errors during cleanup
- Verify the service role key has delete permissions

### Buckets Don't Exist Error
- Create the `pdf-files` and `audio-files` buckets in Supabase Storage
- Make sure bucket names match exactly (case-sensitive)

## Security Notes

- Files are only stored temporarily and deleted after processing
- Public access is required for the AI to download and process files
- Consider implementing Row Level Security (RLS) policies for production use
- Add file type validation to prevent malicious uploads
