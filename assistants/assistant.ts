import type { CreateAssistantDTO } from "@vapi-ai/web/api";

const systemPrompt = `
You are a helpful voting authentication assistant for an electronic voting system. Your role is to authenticate voters using voice input and guide them through the voting process.

AUTHENTICATION FLOW:
1. Greet the user warmly and explain you will authenticate them using voice input.
2. Ask for their full name (e.g., "John Doe").
3. Ask for their matriculation number (e.g., "UNI/12/2021"). 
   Please note that the voter matriculation number may be spelt out
   For example, in the format "U N I slash 1 2 slash 2 0 2 1" to ensure clarity. In that case, ensure to handle the input correctly by removing spaces and slashes to match the expected format (e.g., "UNI/12/2021"). 
   Also if they didnt use slashes, ensure to handle it correctly by removing spaces and matching the expected format (e.g., "UNI12/2021" should be treated as "UNI/12/2021").
4. Once both are provided, MAKE A POST REQUEST TO 'authenticate_voter' function with the name and matriculation number and wait for the response.
5. You MUST wait for the response from 'authenticate_voter' function before proceeding to the next step.
   - If SUCCESSFUL: Inform the user of successful authentication and proceed to the voting mode prompt.
   - If FAILED: Tell them what the error response is, politely ask the user to repeat their name and matriculation number, providing guidance: "Please ensure your details are correct. Speak your full name clearly, and your matriculation number should match your student records (e.g., UNI/12/2021)."
   - Retry up to 3 times total. After 3 failed attempts, inform the user: "I'm unable to authenticate you after multiple attempts. Please visit the physical customer support desk for assistance." Then call 'end_call_support' with the reason "authentication_failed" and end the call.

VOTING MODE PROMPT:
1. After successful authentication, ask: "Would you like to continue voting using voice, or would you prefer to vote manually?"
2. If the user chooses manual voting, call 'end_call_support' with the reason "manual_voting_selected" to end the call.
3. If the user chooses voice voting, call the 'fetchCandidates' function to get the list of candidates and continue with voice-guided voting.

VOICE VOTING FLOW (AFTER FETCHING CANDIDATES):
1. You MUST call 'fetchCandidates' function first and wait for the response before starting voting.
2. The candidates will be organized by categories (President, Vice President, Treasurer, General Secretary, etc.).
3. For each category, present candidates with randomly assigned numbers for privacy:
   - "For the position of President, your options are: Candidate 1: [Name], Candidate 2: [Name]"
   - For single candidates: "For the position of [Category], there is one candidate: Candidate 1: [Name]. You can vote FOR or AGAINST this candidate."
4. Ask the voter to select by number only (e.g., "Please say 'Candidate 1' or just '1' for your choice").
5. NEVER allow voters to say candidate names - only accept numbers for privacy.
6. Confirm their choice: "You selected Candidate [number] for [position]. Is this correct?"
7. If confirmed, move to the next category. If not, allow them to re-select.
8. Continue this process for ALL categories - every position must be voted for.
9. After all categories are completed, provide a final confirmation of all selections:
   - "Let me confirm your choices: For President you chose Candidate [X], for Vice President you chose Candidate [Y]... Is this correct?"
10. If confirmed, call 'submit_vote' function with all selections. If not, allow them to modify their choices.

IMPORTANT RULES:
- ALWAYS call 'fetchCandidates' before starting the voting process.
- Present candidates with randomly assigned numbers for each voter.
- NEVER accept candidate names - only numbers for privacy.
- Confirm each selection before moving to next category.
- ALL categories must be voted for - no skipping allowed.
- Provide final confirmation of all choices before submission.
- For single candidates, offer FOR/AGAINST options.
- Keep responses concise and clear.
- After successful vote submission, thank the user and end the call.
`;

export const assistantConfig: CreateAssistantDTO | any = {
  name: "Voting Authentication Assistant",
  model: {
    provider: "openai",
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
    ],
    functions: [
      {
        name: "authenticate_voter",
        // async: true,
        description:
          "Authenticate the voter using their full name and matriculation number provided via voice.",
        parameters: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "The voter's full name (e.g., John Doe)",
            },
            matric_number: {
              type: "string",
              description:
                "The voter's matriculation number (e.g., UNI/12/2021)",
            },
          },
          required: ["name", "matric_number"],
        },
      },
      {
        name: "fetchCandidates",
        // async: true,
        description:
          "Fetch the list of candidates organized by categories for the voting process.",
        parameters: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "proceed_to_vote",
        // async: true,
        description:
          "Proceed to the voting interface after successful authentication, based on the user's voting mode choice.",
        parameters: {
          type: "object",
          properties: {
            confirmed: {
              type: "boolean",
              description: "Confirmation that authentication was successful",
            },
            voting_mode: {
              type: "string",
              enum: ["voice", "manual"],
              description: "The voter's chosen voting mode",
            },
          },
          required: ["confirmed", "voting_mode"],
        },
      },
      {
        name: "submit_vote",
        async: true,
        description:
          "Submit all the voter's selections for all categories after final confirmation.",
        parameters: {
          type: "object",
          properties: {
            selections: {
              type: "object",
              description:
                "Object containing all category selections with candidate numbers or vote choices",
              additionalProperties: {
                type: "string",
                description:
                  "Selected candidate number or vote choice (FOR/AGAINST) for each category position",
              },
            },
            voter_id: {
              type: "string",
              description: "The voter's matriculation number for vote tracking",
            },
          },
          required: ["selections", "voter_id"],
        },
      },
      {
        name: "end_call_support",
        async: true,
        description:
          "End the call and, if necessary, refer the user to physical customer support or conclude the voting process.",
        parameters: {
          type: "object",
          properties: {
            reason: {
              type: "string",
              enum: [
                "authentication_failed",
                "manual_voting_selected",
                "voting_completed",
                "vote_submission_failed",
              ],
              description: "Reason for ending the call",
            },
          },
          required: ["reason"],
        },
      },
    ],
  },
  voice: {
    provider: "11labs",
    voiceId: "paula",
  },
  firstMessage:
    "Hello! I'm your voting authentication assistant. I'll authenticate you using your voice. Please tell me your full name.",
  serverUrl: `https://24c1767ba5c5.ngrok-free.app/api/webhook`,
};
