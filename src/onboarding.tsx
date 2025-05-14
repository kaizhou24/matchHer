// src/pages/onboarding.tsx

import React, { useState, useEffect, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Shadcn UI components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast as sonnerToast } from "sonner";
import { ArrowLeft, ArrowRight, FileUp, Loader2, Users } from "lucide-react";

import { supabase } from "@/lib/supabaseClient"; // CRITICAL: Ensure env vars for Supabase are set in Vercel

// Zod Schema for form validation
// Note: If resume needs to be conditionally required (e.g., for mentees),
// you would use .superRefine() on the schema.
// Example:
// const formSchema = z.object({ ...fields... }).superRefine((data, ctx) => {
//   if (data.role === 'mentee' && !data.resume) {
//     ctx.addIssue({
//       code: z.ZodIssueCode.custom,
//       message: 'Resume is required for mentees.',
//       path: ['resume'], // Target the 'resume' field for the error message
//     });
//   }
// });
// The current schema makes the resume optional for everyone.
const formSchema = z.object({
  role: z.enum(["mentee", "mentor"], {
    required_error: "Please select your role.",
  }),
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  linkedinProfile: z.string().url({ message: "Please enter a valid URL (e.g., https://linkedin.com/...)." }).optional().or(z.literal('')),
  location: z.string().min(2, {
    message: "Please enter your current location.",
  }),
  careerStage: z.string({
    required_error: "Please select your career stage.",
  }),
  industries: z.array(z.string()).min(1, {
    message: "Please select at least one industry.",
  }),
  languages: z.array(z.string()).min(1, {
    message: "Please select at least one language.",
  }),
  shortTermGoals: z.string().min(10, {
    message: "Short-term goals must be at least 10 characters.",
  }),
  longTermGoals: z.string().min(10, {
    message: "Long-term goals must be at least 10 characters.",
  }),
  helpAreas: z.array(z.string()).min(1, {
    message: "Please select at least one area.",
  }),
  resume: z.custom<File>((val): val is File => val === undefined || val instanceof File, {
    message: "Please upload a valid resume file.",
  }).optional(), // Resume is optional as per this schema definition
});

type OnboardingFormValues = z.infer<typeof formSchema>;

interface SelectableItem { id: string; label: string; }

// Static data for form options
const industriesData: SelectableItem[] = [
    { id: "tech", label: "Technology" }, { id: "healthcare", label: "Healthcare" },
    { id: "education", label: "Education" }, { id: "law", label: "Law" },
    { id: "finance", label: "Finance" }, { id: "nonprofit", label: "Nonprofit" },
    { id: "media", label: "Media" }, { id: "retail", label: "Retail" },
    { id: "manufacturing", label: "Manufacturing" }, { id: "consulting", label: "Consulting" },
    { id: "government", label: "Government" }, { id: "other", label: "Other" },
];
const languagesData: SelectableItem[] = [
    { id: "english", label: "English" }, { id: "spanish", label: "Spanish" },
    { id: "french", label: "French" }, { id: "german", label: "German" },
    { id: "chinese", label: "Chinese (Mandarin)"}, { id: "hindi", label: "Hindi"},
    { id: "arabic", label: "Arabic"}, { id: "portuguese", label: "Portuguese"},
    { id: "russian", label: "Russian"}, { id: "japanese", label: "Japanese"},
    { id: "other", label: "Other"},
];
const helpAreasData: SelectableItem[] = [
    { id: "resume-review", label: "Resume Review" }, { id: "career-advice", label: "Career Advice" },
    { id: "interview-prep", label: "Interview Prep" }, { id: "networking", label: "Networking Strategies" },
    { id: "skill-development", label: "Skill Development" }, { id: "work-life-balance", label: "Work-Life Balance" },
    { id: "leadership", label: "Leadership Skills" }, { id: "grad-school", label: "Graduate School Advice" },
    { id: "industry-transition", label: "Industry Transition" }, {id: "public-speaking", label: "Public Speaking"},
    {id: "salary-negotiation", label: "Salary Negotiation"}, {id: "entrepreneurship", label: "Entrepreneurship"},
];
const careerStageOptions: SelectableItem[] = [
    { id: "student-high-school", label: "High School Student" },
    { id: "student-undergrad", label: "Undergraduate Student" },
    { id: "student-grad", label: "Graduate Student" },
    { id: "entry-level", label: "Entry Level (0-2 years exp.)" },
    { id: "early-career", label: "Early Career (2-5 years exp.)" },
    { id: "mid-career", label: "Mid-Career (5-10 years exp.)" },
    { id: "senior-career", label: "Senior Career (10+ years exp.)" },
    { id: "career-changer", label: "Career Changer" },
    { id: "executive-level", label: "Executive Level"},
    { id: "other", label: "Other" },
];
const stepperLabels = ["Background", "Goals & Needs", "Resume"];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [resumeFile, setResumeFile] = useState<File | null>(null); // State for the actual resume File object
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "mentee",
      fullName: "",
      linkedinProfile: "",
      location: "",
      careerStage: undefined, // Ensure Select placeholder shows
      industries: [],
      languages: [],
      shortTermGoals: "",
      longTermGoals: "",
      helpAreas: [],
      resume: undefined, // RHF's internal value for the resume field
    },
    mode: "onTouched", // Validate fields on blur/change after first touch
  });

  useEffect(() => {
    const checkUserAndPrefill = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        sonnerToast.error("Authentication Required", {
          description: "Please log in to complete onboarding.",
        });
        router.push('/auth/login'); // Ensure this route exists in your /pages/auth directory
      } else {
        // Prefill full name if available in user metadata and not already filled
        if (user.user_metadata?.full_name && !form.getValues("fullName")) {
          form.setValue("fullName", user.user_metadata.full_name, { shouldValidate: true });
        }
      }
    };
    checkUserAndPrefill();
  }, [router, form]); // form instance is stable, router is for navigation

  async function onSubmit(values: OnboardingFormValues) {
    setIsSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      sonnerToast.error("Authentication Error", {
        description: "User session not found. Please log in again.",
      });
      setIsSubmitting(false);
      router.push('/auth/login');
      return;
    }

    const formData = new FormData();

    // Prepare JSON data: take all form values, explicitly exclude the 'resume' File object
    // (as it's handled separately), and add user ID and email.
    // This explicitly avoids an unused 'resume' variable from destructuring.
    const formValuesCopy = { ...values };
    delete formValuesCopy.resume; // Remove the File object reference from the data to be stringified

    const formValuesForJson = {
      ...formValuesCopy,
      // These will be validated/overridden by the server-side authenticated user's details
      // It's good practice for the server to be the source of truth for userId and email.
      // userId: user.id, (Commented out as API uses authenticated user's ID)
      // email: user.email, (Commented out as API uses authenticated user's email)
    };
    formData.append('jsonData', JSON.stringify(formValuesForJson));

    // Append the actual resume file if it exists
    if (resumeFile) {
      formData.append('resumeFile', resumeFile, resumeFile.name);
    }

    try {
      const response = await fetch('/api/onboarding/submit', { // Ensure this API route is correctly implemented
        method: 'POST',
        body: formData, // FormData sets Content-Type automatically
      });

      const result = await response.json(); // Assuming API always returns JSON

      if (response.ok && result.success) {
        sonnerToast.success("Profile Completed!", {
          description: result.message || "Welcome! We're excited to help you find your match.",
        });
        router.push("/dashboard"); // Ensure this route exists
      } else {
        sonnerToast.error("Submission Failed", {
          description: result.error || "An error occurred. Please review your information and try again.",
        });
      }
    } catch (error) {
      console.error("Client-side error submitting form:", error);
      sonnerToast.error("Submission Error", {
        description: "An unexpected network or client-side error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // File size validation (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        form.setError("resume", { type: "manual", message: "Resume must be less than 5MB." });
        sonnerToast.error("File too large", { description: "Resume should be less than 5MB." });
        setResumeFile(null);
        if (e.target) e.target.value = ''; // Reset file input for re-selection
        return;
      }
      // File type validation
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
      if (!allowedTypes.includes(file.type)) {
        form.setError("resume", { type: "manual", message: "Only PDF, DOC, or DOCX files are allowed." });
        sonnerToast.error("Invalid file type", { description: "Only PDF, DOC, or DOCX files are accepted." });
        setResumeFile(null);
        if (e.target) e.target.value = ''; // Reset file input
        return;
      }
      // Valid file
      setResumeFile(file); // Update state holding the File object
      form.setValue("resume", file, { shouldValidate: true }); // Update RHF's value for the field
      form.clearErrors("resume");
    } else { // No file selected or selection cancelled
      setResumeFile(null);
      form.setValue("resume", undefined, { shouldValidate: true });
    }
  };

  const handleNextStep = async () => {
    let fieldsToValidate: Array<keyof OnboardingFormValues> = [];
    if (step === 1) {
      fieldsToValidate = ["role", "fullName", "location", "careerStage", "industries", "languages"];
      if (form.getValues("linkedinProfile")) { // Validate LinkedIn only if a value is entered
        fieldsToValidate.push("linkedinProfile");
      }
    } else if (step === 2) {
      fieldsToValidate = ["shortTermGoals", "longTermGoals", "helpAreas"];
    }
    // Step 3 (Resume) validation is part of the overall form submission via Zod.

    if (fieldsToValidate.length > 0) {
      const isValid = await form.trigger(fieldsToValidate); // Manually trigger validation for current step's fields
      if (isValid) {
        setStep((s) => s + 1);
      } else {
        sonnerToast.error("Incomplete Information", {
          description: "Please fill out all required fields in this section correctly.",
        });
        // Specific field errors will be displayed by their respective <FormMessage /> components.
      }
    } else {
      // If no specific fields to validate for this step transition (e.g., moving from step 2 to 3)
      setStep((s) => s + 1);
    }
  };

  const handlePrevStep = () => setStep((s) => Math.max(1, s - 1)); // Prevent going below step 1

  const currentRole = form.watch("role"); // Watch for role changes to update UI if needed

  return (
    <div className="flex min-h-screen flex-col bg-gray-100 dark:bg-gray-950">
      <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm dark:bg-gray-900 dark:border-gray-800">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Users className="h-6 w-6 text-pink-500" />
            <span className="text-xl font-bold text-gray-800 dark:text-gray-50">MentorMatch</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="dark:text-gray-400 dark:hover:text-gray-50">Cancel</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 py-8 md:py-12">
        <div className="container max-w-2xl px-4 md:px-6">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-gray-50">Let&apos;s Get to Know You</h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
              Complete this form to help us find your perfect mentor or mentee match.
            </p>
          </div>

          {/* Stepper UI */}
          <div className="mb-10 flex items-center justify-center space-x-1 sm:space-x-2 md:space-x-4 p-4">
            {stepperLabels.map((label, index) => {
              const stepNumber = index + 1;
              const isActive = step === stepNumber;
              const isCompleted = step > stepNumber;
              return (
                <React.Fragment key={stepNumber}>
                  <div className="flex flex-col items-center text-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-all duration-300
                        ${isActive ? "border-pink-500 bg-pink-500 text-white scale-110" : "dark:border-gray-700"}
                        ${isCompleted ? "border-pink-500 bg-pink-500 text-white dark:border-pink-500 dark:bg-pink-500" : ""}
                        ${!isActive && !isCompleted ? "border-gray-300 bg-white text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400" : ""}`}
                    >
                      {isCompleted ? "✓" : stepNumber}
                    </div>
                    <p className={`mt-2 max-w-[100px] text-xs sm:text-sm font-medium transition-colors duration-300 ${isActive || isCompleted ? "text-pink-600 dark:text-pink-400" : "text-gray-500 dark:text-gray-400"}`}>
                      {label}
                    </p>
                  </div>
                  {index < stepperLabels.length - 1 && (
                    <div className={`h-1 flex-1 rounded transition-colors duration-300 ${step > stepNumber ? "bg-pink-500" : "bg-gray-300 dark:bg-gray-700"}`}></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Step 1: Background & Identity */}
              {step === 1 && (
                <Card className="shadow-lg dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="dark:text-gray-50">Step 1: Background &amp; Identity</CardTitle>
                    <CardDescription className="dark:text-gray-400">Tell us a bit about yourself.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField control={form.control} name="role" render={({ field }) => ( <FormItem className="space-y-3"> <FormLabel className="font-semibold dark:text-gray-200">I want to be a:*</FormLabel> <FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-6"> <FormItem className="flex items-center space-x-3"> <FormControl><RadioGroupItem value="mentee" id="role-mentee" /></FormControl> <FormLabel htmlFor="role-mentee" className="font-normal cursor-pointer dark:text-gray-300">Mentee (Seeking Guidance)</FormLabel> </FormItem> <FormItem className="flex items-center space-x-3"> <FormControl><RadioGroupItem value="mentor" id="role-mentor" /></FormControl> <FormLabel htmlFor="role-mentor" className="font-normal cursor-pointer dark:text-gray-300">Mentor (Offering Guidance)</FormLabel> </FormItem> </RadioGroup></FormControl> <FormMessage /> </FormItem>)} />
                    <FormField control={form.control} name="fullName" render={({ field }) => ( <FormItem> <FormLabel className="dark:text-gray-200">Full Name*</FormLabel> <FormControl><Input placeholder="E.g., Ada Lovelace" {...field} className="dark:bg-gray-700 dark:text-gray-50 dark:border-gray-600" /></FormControl> <FormMessage /> </FormItem>)} />
                    <FormField control={form.control} name="linkedinProfile" render={({ field }) => ( <FormItem> <FormLabel className="dark:text-gray-200">LinkedIn Profile URL (Optional)</FormLabel> <FormControl><Input placeholder="https://www.linkedin.com/in/yourprofile" {...field} className="dark:bg-gray-700 dark:text-gray-50 dark:border-gray-600" /></FormControl> <FormDescription className="dark:text-gray-500">Share your LinkedIn profile if you have one.</FormDescription><FormMessage /> </FormItem>)} />
                    <FormField control={form.control} name="location" render={({ field }) => ( <FormItem> <FormLabel className="dark:text-gray-200">Current Location (City, Country)*</FormLabel> <FormControl><Input placeholder="E.g., London, UK" {...field} className="dark:bg-gray-700 dark:text-gray-50 dark:border-gray-600" /></FormControl> <FormMessage /> </FormItem>)} />
                    <FormField control={form.control} name="careerStage" render={({ field }) => ( <FormItem> <FormLabel className="dark:text-gray-200">Current Career/Education Stage*</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger className="dark:bg-gray-700 dark:text-gray-50 dark:border-gray-600"><SelectValue placeholder="Select your stage" /></SelectTrigger></FormControl> <SelectContent className="dark:bg-gray-800 dark:text-gray-50">{careerStageOptions.map(opt => <SelectItem key={opt.id} value={opt.id} className="dark:hover:bg-gray-700">{opt.label}</SelectItem>)}</SelectContent> </Select> <FormMessage /> </FormItem>)} />
                    <FormField control={form.control} name="industries" render={() => ( <FormItem> <div className="mb-2"><FormLabel className="text-base font-semibold dark:text-gray-200">Industries of Interest/Expertise*</FormLabel> <FormDescription className="dark:text-gray-500">Select all that apply.</FormDescription></div> <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">{industriesData.map((item) => ( <FormField key={item.id} control={form.control} name="industries" render={({ field }) => ( <FormItem className="flex items-center space-x-2 space-y-0"> <FormControl><Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => field.onChange( checked ? [...(field.value || []), item.id] : (field.value || []).filter((id) => id !== item.id) )}/></FormControl> <FormLabel className="text-sm font-normal cursor-pointer dark:text-gray-300">{item.label}</FormLabel> </FormItem> )} /> ))}</div> <FormMessage /> </FormItem>)} />
                    <FormField control={form.control} name="languages" render={() => ( <FormItem> <div className="mb-2"><FormLabel className="text-base font-semibold dark:text-gray-200">Languages Spoken*</FormLabel> <FormDescription className="dark:text-gray-500">Select all you are proficient in.</FormDescription></div> <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">{languagesData.map((item) => ( <FormField key={item.id} control={form.control} name="languages" render={({ field }) => ( <FormItem className="flex items-center space-x-2 space-y-0"> <FormControl><Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => field.onChange( checked ? [...(field.value || []), item.id] : (field.value || []).filter((id) => id !== item.id) )}/></FormControl> <FormLabel className="text-sm font-normal cursor-pointer dark:text-gray-300">{item.label}</FormLabel> </FormItem> )} /> ))}</div> <FormMessage /> </FormItem>)} />
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button type="button" onClick={handleNextStep} className="bg-pink-500 hover:bg-pink-600 text-white"> Next <ArrowRight className="ml-2 h-4 w-4" /> </Button>
                  </CardFooter>
                </Card>
              )}

              {step === 2 && (
                   <Card className="shadow-lg dark:bg-gray-800 dark:border-gray-700">
                     <CardHeader> <CardTitle className="dark:text-gray-50">Step 2: Goals &amp; Needs</CardTitle> <CardDescription className="dark:text-gray-400">What are you looking to achieve or offer?</CardDescription> </CardHeader>
                     <CardContent className="space-y-6">
                       <FormField control={form.control} name="shortTermGoals" render={({ field }) => ( <FormItem> <FormLabel className="dark:text-gray-200">Short-Term Goals (next 6-12 months)*</FormLabel> <FormControl><Textarea placeholder="E.g., Improve my public speaking skills, find a new job in tech, learn about product management..." {...field} rows={4} className="dark:bg-gray-700 dark:text-gray-50 dark:border-gray-600" /></FormControl> <FormMessage /> </FormItem>)} />
                       <FormField control={form.control} name="longTermGoals" render={({ field }) => ( <FormItem> <FormLabel className="dark:text-gray-200">Long-Term Aspirations (5+ years)*</FormLabel> <FormControl><Textarea placeholder="E.g., Become a CTO, start my own non-profit, write a book..." {...field} rows={4} className="dark:bg-gray-700 dark:text-gray-50 dark:border-gray-600" /></FormControl> <FormMessage /> </FormItem>)} />
                       <FormField control={form.control} name="helpAreas" render={() => ( <FormItem> <div className="mb-2"><FormLabel className="text-base font-semibold dark:text-gray-200">Key Areas for Mentorship*</FormLabel> <FormDescription className="dark:text-gray-500">Select areas you&apos;re seeking help in or can provide guidance on.</FormDescription></div> <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">{helpAreasData.map((item) => ( <FormField key={item.id} control={form.control} name="helpAreas" render={({ field }) => ( <FormItem className="flex items-center space-x-2 space-y-0"> <FormControl><Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => field.onChange( checked ? [...(field.value || []), item.id] : (field.value || []).filter((id) => id !== item.id) )}/></FormControl> <FormLabel className="text-sm font-normal cursor-pointer dark:text-gray-300">{item.label}</FormLabel> </FormItem> )} /> ))}</div> <FormMessage /> </FormItem>)} />
                     </CardContent>
                     <CardFooter className="flex justify-between">
                       <Button type="button" variant="outline" onClick={handlePrevStep} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"> <ArrowLeft className="mr-2 h-4 w-4" /> Back </Button>
                       <Button type="button" onClick={handleNextStep} className="bg-pink-500 hover:bg-pink-600 text-white"> Next <ArrowRight className="ml-2 h-4 w-4" /> </Button>
                     </CardFooter>
                   </Card>
              )}

              {step === 3 && (
                   <Card className="shadow-lg dark:bg-gray-800 dark:border-gray-700">
                     <CardHeader>
                       <CardTitle className="dark:text-gray-50">Step 3: Resume Upload</CardTitle>
                       <CardDescription className="dark:text-gray-400">
                         {currentRole === "mentee" ? "Mentees: Please upload your resume (PDF, DOC, or DOCX, max 5MB)." : "Mentors: Resume upload is optional but can help us understand your background."}
                         {/* The Zod schema currently makes resume optional for all. If it were conditionally required for mentees, that logic would be in the Zod schema using .superRefine() and reflected here or handled by Zod validation messages. */}
                       </CardDescription>
                     </CardHeader>
                     <CardContent className="space-y-6">
                       <FormField control={form.control} name="resume"
                         render={({ field: { onBlur, name, ref }}) => ( // RHF's field.value and field.onChange are not directly used for file inputs
                           <FormItem>
                             <FormLabel htmlFor="resume-upload-input" className="sr-only">Resume File</FormLabel>
                             <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 text-center hover:border-pink-400 transition-colors dark:border-gray-600 dark:hover:border-pink-500">
                               <FileUp className="h-10 w-10 text-gray-400 mb-3 dark:text-gray-500" />
                               <p className="text-sm font-medium text-gray-600 mb-1 dark:text-gray-300">
                                 {resumeFile ? resumeFile.name : "Drag & drop or click to upload resume"}
                               </p>
                               <p className="text-xs text-gray-500 mb-3 dark:text-gray-400">PDF, DOC, DOCX (MAX. 5MB)</p>
                               <FormControl>
                                 <Input
                                   type="file"
                                   id="resume-upload-input"
                                   className="hidden" // Visually hidden, but interactive via the button
                                   accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                   onChange={handleFileChange} // Custom handler for file state and RHF update
                                   onBlur={onBlur}   // RHF prop for touched state
                                   name={name}       // RHF prop
                                   ref={ref}         // RHF prop for input element reference
                                 />
                               </FormControl>
                               <Button type="button" variant="outline" className="text-sm dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700" onClick={() => document.getElementById("resume-upload-input")?.click()}>
                                 {resumeFile ? "Change Resume" : "Browse Files"}
                               </Button>
                             </div>
                             <FormMessage /> {/* Displays Zod errors or manual errors for 'resume' field */}
                           </FormItem>
                         )}
                       />
                       <p className="text-xs text-gray-500 text-center pt-2 dark:text-gray-400">
                         Your resume helps us understand your background for better matching.
                       </p>
                     </CardContent>
                     <CardFooter className="flex justify-between">
                       <Button type="button" variant="outline" onClick={handlePrevStep} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"> <ArrowLeft className="mr-2 h-4 w-4" /> Back </Button>
                       <Button
                         type="submit"
                         className="bg-pink-500 hover:bg-pink-600 text-white"
                         disabled={isSubmitting} // Zod validation via form.handleSubmit handles form validity before onSubmit is called
                       >
                         {isSubmitting ? ( <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> ) : ( "Complete Profile & Find Matches" )}
                       </Button>
                     </CardFooter>
                   </Card>
              )}
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
}