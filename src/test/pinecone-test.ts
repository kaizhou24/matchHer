import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' }); // Explicitly load .env.local

// Updated import to include clearPineconeIndex and RESPONSES_INDEX
import {
  storeResponseEmbedding,
  findSimilarResponses,
  initializeIndex,
  clearPineconeIndex, // Added
  RESPONSES_INDEX     // Added
} from '../lib/pinecone.ts'; // Ensure this path is correct

interface Little {
  fullName: string;
  email: string;
  shortTermCareerGoals: string;
  longTermCareerAspirations: string;
  interests: string[];
  // ... other fields
}

interface Big {
  fullName: string;
  email: string;
  whyBeAMentor: string;
  expertise: string[];
  // ... other fields
}

interface PineconeMatch {
    id: string;
    score?: number;
    metadata?: {
        type?: string;
        name?: string;
        email?: string;
        expertise?: string;
        interests?: string;
        originalText?: string; // Assuming this might be in metadata from lib/pinecone.ts
    };
}

const METADATA_TYPE_BIG = 'big';
const METADATA_TYPE_LITTLE = 'little';
const ASSIGNMENT_TYPE_UNIQUE = "Unique";
const ASSIGNMENT_TYPE_SHARED_FALLBACK = "Shared (Fallback)";
const ASSIGNMENT_TYPE_NO_MATCH_FOUND = "No Suitable Pinecone Match Found";
const DEFAULT_NA_STRING = "N/A";
const TOP_K_MENTOR_SEARCH = 10; // How many potential mentors to fetch

const littles: Little[] = [
  {
    fullName: "Emily Wong",
    email: "emilywong@example.com",
    shortTermCareerGoals: "To land a job in the tech industry focusing on data science and machine learning.",
    longTermCareerAspirations: "To become a tech lead in a major tech company or a startup.",
    interests: ["Data Science", "Machine Learning", "Tech Leadership", "Startups"]
  },
  {
    fullName: "Carlos Rodriguez",
    email: "carlosr@example.com",
    shortTermCareerGoals: "To gain experience in software engineering with a focus on healthcare applications.",
    longTermCareerAspirations: "To lead a tech team working on healthcare innovations.",
    interests: ["Software Engineering", "Healthcare Tech", "Team Leadership"]
  }
];

const bigs: Big[] = [
  {
    fullName: "Dr. Sarah Lee",
    email: "sarahlee@example.com",
    whyBeAMentor: "I want to guide young professionals in healthcare technology and data science. I specialize in machine learning, AI applications in healthcare, and helping build technical leadership skills. I have experience mentoring data scientists and engineers in both startups and established companies.",
    expertise: ["Healthcare Tech", "Data Science", "Machine Learning", "Technical Leadership"]
  },
  {
    fullName: "Jason Smith",
    email: "jasonsmith@example.com",
    whyBeAMentor: "As a startup veteran and engineering leader, I help ambitious engineers and aspiring tech leads grow their careers. I specialize in software engineering best practices, startup scaling, and transitioning from engineer to tech lead. I have deep experience in building and leading engineering teams.",
    expertise: ["Software Engineering", "Startups", "Tech Leadership", "Engineering Management"]
  }
];

function printSimilarityDetails(matches: PineconeMatch[], contextLabel: string) {
  console.log(`\n    Similarity Scores Breakdown for ${contextLabel}:`);
  console.log("    --------------------------------------");
  if (!matches || matches.length === 0) {
    console.log("     No matches to display.");
    return;
  }
  matches.forEach((match, index) => {
    if (match.metadata && typeof match.score === 'number') {
      console.log(`    ${index + 1}. ${match.metadata.name || 'Unknown Name'} (ID: ${match.id})`);
      console.log(`       Score: ${(match.score * 100).toFixed(2)}%`);
      console.log(`       Type: ${match.metadata.type || 'Unknown Type'}`);
      if (match.metadata.type === METADATA_TYPE_BIG) {
        console.log(`       Expertise: ${match.metadata.expertise || DEFAULT_NA_STRING}`);
      } else if (match.metadata.type === METADATA_TYPE_LITTLE) {
        console.log(`       Interests: ${match.metadata.interests || DEFAULT_NA_STRING}`);
      }
      // console.log(`       Original Text: ${(match.metadata.originalText || '').substring(0, 50)}...`); // Uncomment to see original text
      console.log("       ---");
    } else {
      console.log(`    ${index + 1}. Match with missing metadata, score, or ID:`, JSON.stringify(match));
    }
  });
}

async function testPinecone() {
  try {
    // 0. Clear the index for a fresh test run
    console.log(`0. Clearing Pinecone index "${RESPONSES_INDEX}" for a fresh test run...`);
    await clearPineconeIndex(RESPONSES_INDEX); // Using the imported constant
    console.log(`   Pinecone index "${RESPONSES_INDEX}" cleared or was already empty.`);

    // 1. Initializing Pinecone index
    console.log('\n1. Initializing Pinecone index...');
    await initializeIndex(); // initializeIndex should handle creation if not exists
    console.log('   Pinecone index initialized.');

    // 2. Storing Bigs data
    console.log('\n2. Storing Bigs data in Pinecone...');
    for (const big of bigs) {
      const textToEmbed = `${big.whyBeAMentor} Expertise: ${big.expertise.join(", ")}`;
      const metadataToStore = {
        type: METADATA_TYPE_BIG,
        name: big.fullName,
        email: big.email,
        expertise: big.expertise.join(", ")
      };
      await storeResponseEmbedding(textToEmbed, metadataToStore);
    }
    console.log('   All Bigs stored.');

    // 3. Storing Littles data
    console.log('\n3. Storing Littles data in Pinecone (for completeness)...');
    for (const little of littles) {
      const textToEmbed = `Goals: ${little.shortTermCareerGoals} ${little.longTermCareerAspirations} Interests: ${little.interests.join(", ")}`;
      const metadataToStore = {
        type: METADATA_TYPE_LITTLE,
        name: little.fullName,
        email: little.email,
        interests: little.interests.join(", ")
      };
      await storeResponseEmbedding(textToEmbed, metadataToStore);
    }
    console.log('   All Littles stored.');

    // 4. Waiting for Pinecone indexing
    // This wait is crucial, especially after clearing and re-populating.
    // Pinecone indexing is not instantaneous.
    const indexingWaitTime = 15000; // Increased slightly for safety after full clear/upsert
    console.log(`\n4. Waiting for Pinecone indexing (${indexingWaitTime / 1000} seconds)...`);
    await new Promise(resolve => setTimeout(resolve, indexingWaitTime));
    console.log('   Indexing wait complete.');

    // 5. Finding matches for Littles
    console.log('\n5. Finding matches for Littles...');
    const assignedBigs = new Set<string>();
    const littlesWithPotentialMatches: Array<{ little: Little, potentialMatches: PineconeMatch[] }> = [];
    const finalAssignments: Array<{
        littleFullName: string,
        mentorFullName: string | null,
        score: number | null,
        assignmentType: string,
        mentorExpertise?: string,
        menteeInterests?: string
    }> = [];

    console.log('\n   PHASE 1: Fetching potential Big matches for all Littles (with server-side filtering)...');
    for (const little of littles) {
      const searchText = `Goals: ${little.shortTermCareerGoals} ${little.longTermCareerAspirations} Interests: ${little.interests.join(", ")}`;
      console.log(`\n   - Searching for Little: ${little.fullName}`);
      // console.log(`     Search Text: "${searchText}"`); // Uncomment if needed

      // Using findSimilarResponses with server-side filter for 'big' type
      const matchesFromPinecone: PineconeMatch[] = await findSimilarResponses(
        searchText,
        TOP_K_MENTOR_SEARCH, // How many top 'big' type matches to retrieve
        { type: { '$eq': METADATA_TYPE_BIG } } // Server-side filter
      );

      printSimilarityDetails(matchesFromPinecone, `Potential Big matches from Pinecone for ${little.fullName}`);

      // Client-side validation of the server-filtered results
      const bigMatches = matchesFromPinecone
        .filter(match =>
            match &&
            match.metadata &&
            match.metadata.type === METADATA_TYPE_BIG && // This should always be true now due to server filter, but good for sanity check
            typeof match.metadata.name === 'string' &&
            match.metadata.name.trim() !== '' &&
            typeof match.score === 'number'
        )
        .sort((a, b) => (b.score!) - (a.score!));

      // If server-side filtering is effective, bigMatches should be very similar to matchesFromPinecone.
      // printSimilarityDetails(bigMatches, `Client-validated Big matches for ${little.fullName}`); // Optional: to see if client filter changed anything

      littlesWithPotentialMatches.push({
        little,
        potentialMatches: bigMatches
      });

      console.log(`     Found ${bigMatches.length} valid potential Big match(es) for ${little.fullName}.`);
      if (bigMatches.length > 0 && bigMatches[0].metadata && typeof bigMatches[0].score === 'number') {
        console.log(`       Top potential Bigs for ${little.fullName}: ${bigMatches.slice(0,3).map(m => `${m.metadata!.name} (Score: ${m.score!.toFixed(3)})`).join(', ')}`);
      }
    }

    littlesWithPotentialMatches.sort((a, b) => a.potentialMatches.length - b.potentialMatches.length);

    console.log('\n   PHASE 2: Assigning Bigs to Littles (Littles with fewer options first)...');
    for (const { little, potentialMatches } of littlesWithPotentialMatches) {
      let assignedBigResult: PineconeMatch | null = null;
      let assignmentType = "";

      console.log(`\n   - Attempting to match Little: ${little.fullName}`);
      console.log(`     (Has ${potentialMatches.length} server-filtered, sorted potential Big(s) to consider)`);

      const bestUnassignedBig = potentialMatches.find(match => match.metadata && !assignedBigs.has(match.metadata.name!));

      if (bestUnassignedBig) {
        assignedBigResult = bestUnassignedBig;
        assignedBigs.add(assignedBigResult.metadata!.name!);
        assignmentType = ASSIGNMENT_TYPE_UNIQUE;
        console.log(`     SUCCESS: Found unique Big: ${assignedBigResult.metadata!.name!} (Score: ${assignedBigResult.score!.toFixed(3)})`);
      } else if (potentialMatches.length > 0) {
        assignedBigResult = potentialMatches[0];
        assignmentType = ASSIGNMENT_TYPE_SHARED_FALLBACK;
        console.log(`     INFO: No unique Big available. Using fallback to assign (potentially shared) Big: ${assignedBigResult.metadata!.name!} (Score: ${assignedBigResult.score!.toFixed(3)})`);
      } else {
        console.log(`     INFO: No potential Bigs were returned by Pinecone for ${little.fullName} with the specified filter, or all were unsuitable.`);
      }

      if (assignedBigResult && assignedBigResult.metadata && typeof assignedBigResult.score === 'number') {
        const mentorName = assignedBigResult.metadata.name!;
        const mentorExpertise = assignedBigResult.metadata.expertise || DEFAULT_NA_STRING;
        const score = assignedBigResult.score;

        finalAssignments.push({
          littleFullName: little.fullName,
          mentorFullName: mentorName,
          score: score,
          assignmentType,
          mentorExpertise: mentorExpertise,
          menteeInterests: little.interests.join(", ")
        });
        console.log(`   --> Assigned: ${little.fullName}  ==>  ${mentorName} (Score: ${(score * 100).toFixed(1)}%, Type: ${assignmentType})`);

      } else {
        console.warn(`   WARNING: No suitable Big match found for assignment for ${little.fullName}. This Little will not be assigned a mentor.`);
        finalAssignments.push({
          littleFullName: little.fullName,
          mentorFullName: null,
          score: null,
          assignmentType: ASSIGNMENT_TYPE_NO_MATCH_FOUND,
          menteeInterests: little.interests.join(", ")
        });
      }
    }

    console.log("\n--- Final Match Assignment Summary ---");
    if (finalAssignments.length > 0) {
        finalAssignments.forEach(assignment => {
            if (assignment.mentorFullName && typeof assignment.score === 'number') {
                console.log(`   ${assignment.littleFullName}  ==>  ${assignment.mentorFullName} (Score: ${(assignment.score * 100).toFixed(1)}%, Type: ${assignment.assignmentType})`);
            } else {
                console.log(`   ${assignment.littleFullName}  ==>  NO MENTOR ASSIGNED (${assignment.assignmentType})`);
            }
        });
    } else {
        console.log("   No assignment attempts were made or no Littles were processed.");
    }
    console.log("----------------------------------\n");

  } catch (error) {
    console.error('\n!!!!!!!!!! SCRIPT FAILED !!!!!!!!!!');
    if (error instanceof Error) {
      console.error('Error Name: ' + error.name);
      console.error('Error Message: ' + error.message);
      console.error('Stack Trace:\n' + error.stack);
    } else {
      console.error('An unknown error object was thrown:', error);
    }
    console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n');
  }
}

testPinecone()
  .then(() => console.log('Test script execution process completed.'))
  .catch(err => {
    console.error("FATAL: Unhandled error during testPinecone execution promise:", err);
});