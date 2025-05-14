// src/pages/api/onboarding/submit.ts
/*import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, File as FormidableFile } from 'formidable';
import fs from 'fs/promises'; // For reading the temporary file
import { supabase } from '@/lib/supabaseClient'; // Your existing Supabase client
import { createPagesServerClient } from '@supabase/ss'; // For server-side auth

export const config = {
  api: {
    bodyParser: false, // Required for formidable to parse multipart/form-data
  },
};

// Interface for the JSON data part of the multipart form
interface OnboardingJsonData {
  // userId: string; // We will use the authenticated user's ID from the server session
  // email: string;  // We will use the authenticated user's email from the server session
  role: "mentee" | "mentor";
  fullName: string;
  linkedinProfile?: string;
  location: string;
  careerStage: string;
  industries: string[];
  languages: string[];
  shortTermGoals: string;
  longTermGoals: string;
  helpAreas: string[]; // Frontend sends a single array
}

// Interface for the data structure in your 'user_onboarding_details' Supabase table
// Match this closely with your actual table columns.
interface UserOnboardingDetails {
  user_id: string; // Primary key, foreign key to auth.users.id
  email: string; // User's email
  role: "mentee" | "mentor";
  full_name: string;
  linkedin_profile?: string | null;
  location?: string;
  career_stage?: string;
  industries?: string[];
  languages?: string[];
  short_term_goals?: string | null;
  long_term_goals?: string | null;
  // Based on your previous 'SavedOnboardingData', split 'helpAreas' by role:
  help_areas_seeking?: string[] | null;  // For mentees
  help_areas_offering?: string[] | null; // For mentors
  resume_file_path?: string | null;
  updated_at: string; // Should be timestamptz
  // created_at?: string; // If you have this column
}

// Type for the API response sent back to the client
type ApiResponse = {
  success: boolean;
  message?: string;
  error?: string;
  data?: UserOnboardingDetails | null; // Return the saved profile data
  resumePath?: string | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
  }

  // 1. --- Server-Side Authentication ---
  // This is crucial for security.
  const supabaseServerClient = createPagesServerClient({ req, res });
  const { data: { user: authenticatedUser }, error: authError } = await supabaseServerClient.auth.getUser();

  if (authError || !authenticatedUser) {
    console.error("API Authentication Error:", authError?.message);
    return res.status(401).json({ success: false, error: 'Authentication failed. Please log in.' });
  }
  // Now `authenticatedUser.id` and `authenticatedUser.email` are trustworthy.

  const form = new IncomingForm({
    keepExtensions: true,
    // Vercel allows writing to /tmp
    uploadDir: '/tmp',
    // Optional: Max file size (e.g., 5MB, matching frontend)
    maxFileSize: 5 * 1024 * 1024,
  });

  try {
    const [fields, files] = await form.parse(req);

    // 2. --- Parse and Validate JSON Data ---
    const jsonDataString = Array.isArray(fields.jsonData) ? fields.jsonData[0] : fields.jsonData;
    if (!jsonDataString || typeof jsonDataString !== 'string') {
      return res.status(400).json({ success: false, error: 'Missing or invalid form data (jsonData).' });
    }

    let parsedData: OnboardingJsonData;
    try {
      parsedData = JSON.parse(jsonDataString);
    } catch (parseError) {
      console.error("JSON Parsing Error:", parseError);
      return res.status(400).json({ success: false, error: 'Invalid JSON data format.' });
    }

    // 3. --- Prepare Data for Supabase Upsert ---
    // Use `authenticatedUser.id` and `authenticatedUser.email` as the source of truth.
    const profileDataToUpsert: Omit<UserOnboardingDetails, 'updated_at'> & { updated_at?: string } = {
      user_id: authenticatedUser.id,
      email: authenticatedUser.email!, // Email should exist for an authenticated user
      role: parsedData.role,
      full_name: parsedData.fullName,
      linkedin_profile: parsedData.linkedinProfile || null,
      location: parsedData.location,
      career_stage: parsedData.careerStage,
      industries: parsedData.industries,
      languages: parsedData.languages,
      short_term_goals: parsedData.role === 'mentee' ? parsedData.shortTermGoals : null,
      long_term_goals: parsedData.role === 'mentee' ? parsedData.longTermGoals : null,
      // Splitting helpAreas based on role for separate DB columns
      help_areas_seeking: parsedData.role === 'mentee' ? parsedData.helpAreas : null,
      help_areas_offering: parsedData.role === 'mentor' ? parsedData.helpAreas : null,
      // resume_file_path will be updated later if a file is uploaded
    };

    // Upsert profile details (excluding resume path initially)
    const { data: upsertedProfile, error: dbError } = await supabase
      .from('user_onboarding_details') // *** REPLACE WITH YOUR ACTUAL TABLE NAME ***
      .upsert(
        { ...profileDataToUpsert, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' } // Assumes 'user_id' is your primary key or has a unique constraint
      )
      .select() // Select all columns to get the complete record
      .single<UserOnboardingDetails>(); // Expect a single object, typed

    if (dbError) {
      console.error('Supabase upsert error:', dbError);
      // Avoid exposing detailed DB error messages to the client if not desired
      throw new Error(`Database error saving profile.`);
    }
    if (!upsertedProfile) {
        console.error('Supabase upsert did not return data for user:', authenticatedUser.id);
        throw new Error('Failed to save profile information, no data returned.');
    }
    console.log('Onboarding data saved/updated for user:', authenticatedUser.id);

    // 4. --- Handle Resume File Upload (if present) ---
    const resumeFileArray = files.resumeFile;
    const formidableResumeFile: FormidableFile | undefined = Array.isArray(resumeFileArray) ? resumeFileArray[0] : undefined;
    let resumeStoragePublicUrl: string | null = null;
    let finalResumePathInBucket: string | null = null;


    if (formidableResumeFile && formidableResumeFile.size > 0) {
      // Optional: Add more backend file type validation if needed
      // const allowedMimeTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      // if (!formidableResumeFile.mimetype || !allowedMimeTypes.includes(formidableResumeFile.mimetype)) {
      //   await fs.unlink(formidableResumeFile.filepath); // Clean up temp file
      //   return res.status(400).json({ success: false, error: 'Invalid resume file type.' });
      // }

      const fileExt = formidableResumeFile.originalFilename?.split('.').pop()?.toLowerCase() || 'bin';
      const fileNameInBucket = `resume_${new Date().getTime()}.${fileExt}`; // Add timestamp for uniqueness
      const filePathInBucket = `${authenticatedUser.id}/${fileNameInBucket}`; // User-specific folder

      const fileBuffer = await fs.readFile(formidableResumeFile.filepath);

      const { data: storageData, error: storageError } = await supabase.storage
        .from('user-resumes') // *** REPLACE WITH YOUR BUCKET NAME (e.g., 'onboarding_resumes') ***
        .upload(filePathInBucket, fileBuffer, {
          contentType: formidableResumeFile.mimetype || 'application/octet-stream',
          upsert: false, // Set to true if you want to overwrite, false to error if exists (unlikely with timestamp)
        });

      await fs.unlink(formidableResumeFile.filepath); // Clean up the temporary file from /tmp

      if (storageError) {
        console.error('Supabase storage error:', storageError);
        throw new Error(`Failed to upload resume.`);
      }
      
      if (storageData) {
        finalResumePathInBucket = storageData.path; // Path within the bucket
        console.log('Resume uploaded to bucket path:', finalResumePathInBucket);

        // Get public URL if your bucket is configured for public access (or use signed URLs)
        // const { data: publicUrlData } = supabase.storage.from('user-resumes').getPublicUrl(finalResumePathInBucket);
        // resumeStoragePublicUrl = publicUrlData?.publicUrl || null;

        // Update the profile with the resume file path (not the full URL, just the bucket path)
        const { error: updateError } = await supabase
          .from('user_onboarding_details') // *** YOUR TABLE NAME ***
          .update({ resume_file_path: finalResumePathInBucket })
          .eq('user_id', authenticatedUser.id);

        if (updateError) {
          console.error('Error updating profile with resume path:', updateError);
          // This might be considered non-critical by some, log and proceed,
          // but the client might expect consistency.
          // For now, we'll let it proceed but it's a potential inconsistency.
        } else {
          // Update the local copy of upsertedProfile if the update was successful
          upsertedProfile.resume_file_path = finalResumePathInBucket;
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Onboarding successful! Your profile has been updated.',
      data: upsertedProfile, // Return the full, updated profile data
      resumePath: finalResumePathInBucket, // Send back the bucket path
    });

  } catch (error: unknown) {
    console.error('API Error in /api/onboarding/submit:', error);
    // Clean up temp file if it exists and an error occurs mid-process
    // Note: formidable might have multiple files if form allows it.
    if (files && files.resumeFile) {
        const resumeFileArray = files.resumeFile;
        const formidableResumeFile: FormidableFile | undefined = Array.isArray(resumeFileArray) ? resumeFileArray[0] : undefined;
        if (formidableResumeFile?.filepath) {
            try {
                await fs.unlink(formidableResumeFile.filepath);
            } catch (cleanupError) {
                console.error("Error cleaning up temp file:", cleanupError);
            }
        }
    }

    let errorMessage = 'An unexpected error occurred during onboarding.';
    if (error instanceof Error) {
      // You might want to avoid sending internal error messages directly to client in production
      // For development, error.message can be useful.
      errorMessage = process.env.NODE_ENV === 'development' ? error.message : 'Failed to process onboarding information.';
    }
    res.status(500).json({ success: false, error: errorMessage });
  }
}*/