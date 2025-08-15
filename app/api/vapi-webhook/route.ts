import { NextRequest, NextResponse } from "next/server";
import { validateVoterForVoting } from "@/utils/validate-voter";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { message } = body;

  if (message.type !== "function-call") {
    return NextResponse.json(
      { error: "Invalid message type" },
      { status: 400 },
    );
  }

  const { name, parameters } = message.functionCall;

  try {
    if (name === "authenticate_voter") {
      const { surname, matric_number, election_token_id } = parameters;

      // Get chain ID from environment or request
      const chainId = parseInt(process.env.CHAIN_ID || "1");

      // Perform server-side validation
      const result = await validateVoterForVoting(
        {
          voterName: surname,
          voterMatricNo: matric_number,
          electionTokenId: BigInt(election_token_id),
        },
        chainId,
      );

      if (result.success) {
        return NextResponse.json({ success: true, hash: result.hash });
      } else {
        return NextResponse.json({ success: false, error: result.message });
      }
    } else if (name === "proceed_to_voice_vote") {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Unknown function" }, { status: 400 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
