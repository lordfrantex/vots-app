import { type NextRequest, NextResponse } from "next/server";
import { getElectionDetailsServer } from "@/utils/election-service";
import { sepolia } from "wagmi/chains";

const candidateArray = [
  {
    name: "David Praise",
    matricNo: "FST/11/0322",
    category: "President",
    voteFor: 0,
    voteAgainst: 0,
  },
  {
    name: "Samuel Bruno",
    matricNo: "CSC/19/0222",
    category: "President",
    voteFor: 0,
    voteAgainst: 0,
  },
  {
    name: "Max Miles",
    matricNo: "STA/12/0122",
    category: "Treasurer",
    voteFor: 0,
    voteAgainst: 0,
  },
  {
    name: "John Sam",
    matricNo: "SEN/13/0000",
    category: "Vice President",
    voteFor: 0,
    voteAgainst: 0,
  },
  {
    name: "Joshua Smith",
    matricNo: "SEN/14/0989",
    category: "General Secretary",
    voteFor: 0,
    voteAgainst: 0,
  },
  {
    name: "David Brass",
    matricNo: "STA/19/2020",
    category: "General Secretary",
    voteFor: 0,
    voteAgainst: 0,
  },
];

export async function POST(
  request: NextRequest,
  { params }: { params: { electionId: string } },
) {
  try {
    const body = await request.json();
    const { electionId } = await params;
    console.log(electionId);

    // Replace the hook with the server-side service
    // You can specify chainId if needed, defaults to sepolia
    const chainId = sepolia.id; // or get from request/params if needed
    // const electionDetails = await getElectionDetailsServer(electionId, chainId);
    // console.log("Election details:", electionDetails);

    if (!body.message) {
      console.log("[v0] No message property found in body");
      return NextResponse.json(
        { results: [{ result: "No message in request" }] },
        { status: 200 },
      );
    }

    const { message } = body;

    const { type, functionCall = {}, toolCalls = [], call } = message;

    if (type === "tool-calls") {
      const toolCall = toolCalls[0];
      if (!toolCall) {
        return NextResponse.json(
          { results: [{ result: "No tool call found" }] },
          { status: 200 },
        );
      }

      const { name } = toolCall.function || toolCall;
      let parameters = {};
      try {
        const argumentsString =
          toolCall.function?.arguments || toolCall.arguments || "{}";
        parameters =
          typeof argumentsString === "string"
            ? JSON.parse(argumentsString)
            : argumentsString;
      } catch (parseError) {
        console.error("[v0] Error parsing arguments:", parseError);
        parameters = toolCall.function?.parameters || toolCall.parameters || {};
      }

      if (name === "authenticate_voter") {
        const { name: voterName, matric_number } = parameters;
        console.log(
          "[v0] Extracted values - voterName:",
          voterName,
          "matric_number:",
          matric_number,
        );

        // You can now use electionDetails to validate voters
        // For example, check if the voter is registered for this election
        if (electionDetails) {
          const isRegisteredVoter = electionDetails.voters.some(
            (voter) =>
              voter.matricNumber === matric_number && voter.name === voterName,
          );

          if (!isRegisteredVoter) {
            console.log(
              "Authentication failed - voter not registered for this election",
            );
            return NextResponse.json(
              {
                results: [
                  {
                    toolCallId: toolCall.id,
                    result:
                      "Authentication Failed!!!. Please you are not a registered voter for this election",
                  },
                ],
              },
              { status: 200 },
            );
          }
        }

        // Original hardcoded check (you might want to remove this)
        if (matric_number !== "URP/20/2020" || voterName !== "Mark") {
          console.log("Authentication failed for", voterName);
          return NextResponse.json(
            {
              results: [
                {
                  toolCallId: toolCall.id,
                  result:
                    "Authentication Failed!!!. Please you are not a registered voter and you can't be permitted to vote",
                },
              ],
            },
            { status: 200 },
          );
        }

        console.log("Authentication successful for", voterName);
        return NextResponse.json(
          {
            results: [
              {
                toolCallId: toolCall.id,
                result: `Congratulations ${voterName}, You are now authenticated. Proceed to vote`,
              },
            ],
          },
          { status: 200 },
        );
      } else if (name === "proceed_to_vote") {
        const { confirmed, voting_mode } = parameters;
        if (confirmed && voting_mode === "voice") {
          return NextResponse.json(
            {
              results: [
                {
                  toolCallId: toolCall.id,
                  result: "Navigate to voting page",
                },
              ],
            },
            { status: 200 },
          );
        } else if (voting_mode === "manual") {
          return NextResponse.json(
            {
              results: [
                {
                  toolCallId: toolCall.id,
                  result: "End call for manual voting",
                },
              ],
            },
            { status: 200 },
          );
        }
      } else if (name === "fetchCandidates") {
        // Use real candidates from blockchain instead of hardcoded array
        if (electionDetails && electionDetails.candidates.length > 0) {
          return NextResponse.json(
            {
              results: [
                {
                  toolCallId: toolCall.id,
                  result: JSON.stringify(electionDetails.candidates),
                },
              ],
            },
            { status: 200 },
          );
        }

        // Fallback to hardcoded candidates if no blockchain data
        await new Promise((resolve) => setTimeout(resolve, 100));
        return NextResponse.json(
          {
            results: [
              {
                toolCallId: toolCall.id,
                result: JSON.stringify(electionDetails.candidates),
              },
            ],
          },
          { status: 200 },
        );
      } else if (name === "submit_vote") {
        const { selection } = parameters;
        // Process vote (e.g., save to database)
        return NextResponse.json(
          {
            results: [
              {
                toolCallId: toolCall.id,
                result: `Vote for ${selection} recorded`,
              },
            ],
          },
          { status: 200 },
        );
      } else if (name === "end_call_support") {
        const { reason } = parameters;
        return NextResponse.json(
          {
            results: [
              {
                toolCallId: toolCall.id,
                result: `Call ended: ${reason}`,
              },
            ],
          },
          { status: 200 },
        );
      }
      return NextResponse.json(
        {
          results: [
            {
              toolCallId: toolCall.id,
              result: "Function executed successfully",
            },
          ],
        },
        { status: 200 },
      );
    }

    return NextResponse.json({}, { status: 200 });
  } catch (err) {
    console.error("Error in POST request:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    return NextResponse.json({ message: "Webhook is active" }, { status: 200 });
  } catch (error) {
    console.error("Error in GET request:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
