"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  CheckCircle,
  AlertTriangle,
  Loader2,
  User,
  CreditCard,
  ArrowLeft,
  ArrowRight,
  Mic,
} from "lucide-react";
import Vapi from "@vapi-ai/web";
import { useSessionValidateVoter } from "@/hooks/use-session-validate-voter";
import { useElectionDetails } from "@/hooks/use-contract-address";

const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "");

const systemPrompt = `
You are a helpful voting authentication assistant for an electronic voting system. Your role is to authenticate voters and guide them through the voting process.

AUTHENTICATION FLOW:
1. Greet the user warmly and explain you will help with voice authentication
2. Ask for their surname (e.g., "mark")
3. Ask for their matriculation number (e.g., UNI/12/2021) Please note that the voters may spell out their matriculation number, so be prepared to handle that
4. Once both are provided, call the authenticate_voter function and wait for the response
5. Based on the authentication result:
   - If SUCCESSFUL: Call proceed_to_vote function to continue to voting
   - If FAILED: Ask the user to clarify their details and try again

RETRY LOGIC:
- If authentication fails, politely ask the user to double-check their surname and matriculation number
- Provide helpful guidance: "Please ensure your surname is pronounced appropriately and your matriculation number is accurate"
- You can retry up to 5 times total
- After 5 failed attempts, politely inform the user: "I'm unable to authenticate you after multiple attempts. Please visit the physical customer support desk for assistance. I will now end this call." Then end the call immediately.

IMPORTANT RULES:
- NEVER proceed to voting if authentication fails
- NEVER ask about voice vs manual voting - you handle the complete process
- Always wait for authentication response before proceeding
- Be patient and helpful with retry attempts
- After 5 failures, refer to physical support and END the call
- Keep responses concise and clear
`;

const assistantConfig = {
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
        description:
          "Authenticate the voter using their surname and matriculation number. This will verify their eligibility and accreditation status.",
        parameters: {
          type: "object",
          properties: {
            surname: {
              type: "string",
              description: "The voter's surname",
            },
            matric_number: {
              type: "string",
              description:
                "The voter's matriculation number (e.g., UNI/12/2021)",
            },
          },
          required: ["surname", "matric_number"],
        },
      },
      {
        name: "proceed_to_vote",
        description:
          "Proceed to the voting interface after successful authentication.",
        parameters: {
          type: "object",
          properties: {
            confirmed: {
              type: "boolean",
              description: "Confirmation that authentication was successful",
            },
          },
          required: ["confirmed"],
        },
      },
      {
        name: "end_call_support",
        description:
          "End the call and refer user to physical customer support after maximum retry attempts.",
        parameters: {
          type: "object",
          properties: {
            reason: {
              type: "string",
              description: "Reason for ending the call",
            },
          },
          required: ["reason"],
        },
      },
    ],
  },
  voice: {
    provider: "playht",
    voiceId: "jennifer",
  },
  firstMessage:
    "Hello! I'm your voting authentication assistant. I'll help you authenticate and guide you through the voting process. To begin, please tell me your surname.",
};

interface VoterAuthenticationModalProps {
  electionId: string;
  pollingUnit: {
    unitId: string;
    unitName: string;
    address: string;
  };
  onAuthenticated: (voter: {
    name: string;
    matricNumber: string;
    isAccredited: boolean;
  }) => void;
  onBack: () => void;
}

const VoterAuthenticationModal = ({
  electionId,
  pollingUnit,
  onAuthenticated,
  onBack,
}: VoterAuthenticationModalProps) => {
  const [matricNumber, setMatricNumber] = useState("");
  const [surname, setSurname] = useState("");
  const [useVoice, setUseVoice] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [authAttempts, setAuthAttempts] = useState(0);
  const [isAIAuthenticating, setIsAIAuthenticating] = useState(false);
  const [tempVoter, setTempVoter] = useState<{
    name: string;
    matricNumber: string;
  } | null>(null);
  const [authenticationResult, setAuthenticationResult] = useState<{
    success: boolean;
    voter?: {
      name: string;
      matricNumber: string;
      isAccredited: boolean;
      hasVoted: boolean;
    };
    error?: string;
  } | null>(null);

  const { election } = useElectionDetails(electionId);
  console.log("Election Details:", election);

  const {
    validateVoterForVoting,
    isLoading: isSessionValidating,
    isSuccess: isValidationSuccess,
    error: contractError,
    hash: validationHash,
    isConfirming: isSessionConfirming,
  } = useSessionValidateVoter();

  const isProcessing = isSessionValidating || isSessionConfirming;

  useEffect(() => {
    if (isValidationSuccess && validationHash && isAIAuthenticating) {
      console.log("[VAPI] Authentication successful, notifying AI assistant");
      setAuthenticationResult({
        success: true,
        voter: {
          name: surname || tempVoter?.name || "",
          matricNumber: matricNumber || tempVoter?.matricNumber || "",
          isAccredited: true,
          hasVoted: false,
        },
      });
      setIsAIAuthenticating(false);

      // Notify AI assistant of successful authentication
      if (voiceActive) {
        setTranscript(
          (prev) =>
            prev +
            "\n✅ Authentication successful! You are verified and can proceed to vote.",
        );
      }
    }
  }, [
    isValidationSuccess,
    validationHash,
    isAIAuthenticating,
    surname,
    matricNumber,
    tempVoter,
    voiceActive,
  ]);

  useEffect(() => {
    if (contractError && isAIAuthenticating) {
      console.error("[VAPI] Voter validation error for AI:", contractError);
      let errorMessage = contractError.toString();

      if (contractError.includes("VoterNotAccredited")) {
        errorMessage =
          "You have not been accredited for this election yet. Please contact election officials.";
      } else if (contractError.includes("VoterAlreadyVoted")) {
        errorMessage = "You have already voted in this election.";
      } else if (contractError.includes("VoterNotRegistered")) {
        errorMessage = "You are not registered for this election.";
      } else if (contractError.includes("InvalidVoterDetails")) {
        errorMessage =
          "Your details don't match our records. Please ensure that your surname and matriculation number is correct.";
      } else if (contractError.includes("ElectionNotActive")) {
        errorMessage = "The election is not currently active.";
      }

      setAuthenticationResult({
        success: false,
        error: errorMessage,
      });
      setIsAIAuthenticating(false);

      // Notify AI assistant of authentication failure
      if (voiceActive) {
        setTranscript(
          (prev) => prev + `\n❌ Authentication failed: ${errorMessage}`,
        );
      }
    }
  }, [contractError, isAIAuthenticating, voiceActive]);

  useEffect(() => {
    const handleVapiError = (error: any) => {
      console.log("[VAPI] Global Vapi error caught:", error);

      // Handle specific error types
      if (
        error?.errorMsg === "Meeting has ended" ||
        error?.error?.msg === "Meeting has ended"
      ) {
        console.log("[VAPI] Meeting ended - cleaning up voice state");
        setVoiceActive(false);
        setTranscript((prev) => prev + "\nCall ended by system.");
        return;
      }

      // Handle other errors
      setVoiceError(
        `Voice error: ${error?.errorMsg || error?.message || "Unknown error"}`,
      );
      setVoiceActive(false);
    };

    // Add global error listener
    vapi.on("error", handleVapiError);

    // Cleanup on unmount
    return () => {
      vapi.off("error", handleVapiError);
      if (voiceActive) {
        try {
          vapi.stop();
        } catch (e) {
          console.log("[VAPI] Error stopping vapi on cleanup:", e);
        }
      }
    };
  }, [voiceActive]);

  const handleAuthenticate = async (aiCollectedData?: {
    surname: string;
    matricNumber: string;
  }) => {
    const voterSurname = aiCollectedData?.surname || surname.trim();
    const voterMatricNumber =
      aiCollectedData?.matricNumber || matricNumber.trim();

    if (!voterMatricNumber || !voterSurname) {
      const errorMsg =
        "Please provide both your surname and matriculation number.";
      setAuthenticationResult({
        success: false,
        error: errorMsg,
      });
      return { success: false, message: errorMsg };
    }

    setAuthenticationResult(null);
    setIsAIAuthenticating(true);

    try {
      console.log("[VAPI] Starting authentication for:", {
        voterSurname,
        voterMatricNumber,
      });

      const result = await validateVoterForVoting({
        voterName: voterSurname,
        voterMatricNo: voterMatricNumber,
        electionTokenId: BigInt(electionId),
      });

      console.log("[VAPI] Authentication result:", result);

      if (!result.success) {
        setAuthenticationResult({
          success: false,
          error: result.message,
        });
        setIsAIAuthenticating(false);
        return { success: false, message: result.message };
      }

      // Wait for transaction confirmation
      console.log("[VAPI] Waiting for transaction confirmation...");
      // The useEffect will handle the success case when isValidationSuccess becomes true

      return {
        success: true,
        message: "Authentication initiated, waiting for confirmation...",
      };
    } catch (err) {
      console.error("[VAPI] Authentication error:", err);
      const errorMsg =
        "Authentication failed. Please check your details and try again.";
      setAuthenticationResult({
        success: false,
        error: errorMsg,
      });
      setIsAIAuthenticating(false);
      return { success: false, message: errorMsg };
    }
  };

  const handleProceedToVote = () => {
    if (authenticationResult?.success && authenticationResult.voter) {
      onAuthenticated({
        name: authenticationResult.voter.name,
        matricNumber: authenticationResult.voter.matricNumber,
        isAccredited: authenticationResult.voter.isAccredited,
      });
    } else if (tempVoter) {
      onAuthenticated({
        name: tempVoter.name,
        matricNumber: tempVoter.matricNumber,
        isAccredited: true,
      });
    }
  };

  useEffect(() => {
    if (!matricNumber.trim() && !surname.trim()) {
      setAuthenticationResult(null);
    }
  }, [matricNumber, surname]);

  const startVoiceAssistant = async () => {
    // Check if API key is available
    if (!process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY) {
      setVoiceError(
        "Voice assistant is not configured. Please use manual authentication.",
      );
      return;
    }

    console.log("[VAPI] Starting voice assistant...");
    setVoiceActive(true);
    setTranscript("");
    setTempVoter(null);
    setVoiceError(null);
    setAuthAttempts(0);
    setIsAIAuthenticating(false);

    try {
      await vapi.start(assistantConfig, {
        onMessage: async (message) => {
          console.log(
            "[VAPI] Message received:",
            JSON.stringify(message, null, 2),
          );

          if (message.type === "function-call") {
            const func = message.functionCall;
            console.log(
              "[VAPI] Function call received:",
              func.name,
              "with params:",
              func.parameters,
            );

            if (func.name === "authenticate_voter") {
              const params = func.parameters;
              console.log("[VAPI] AI requesting authentication:", params);

              const currentAttempt = authAttempts + 1;
              setAuthAttempts(currentAttempt);

              setTempVoter({
                name: params.surname,
                matricNumber: params.matric_number,
              });

              const transcriptUpdate = `\n🔍 Authenticating (Attempt ${currentAttempt}/5):\nSurname: ${params.surname}\nMatric: ${params.matric_number}`;
              setTranscript((prev) => prev + transcriptUpdate);
              console.log(transcriptUpdate);

              // Call the actual authentication function
              const authResult = await handleAuthenticate({
                surname: params.surname,
                matricNumber: params.matric_number,
              });

              console.log("[VAPI] Authentication result:", authResult);

              try {
                await vapi.send({
                  type: "function-response",
                  functionResponse: {
                    name: func.name,
                    content: JSON.stringify({
                      success: authResult.success,
                      message: authResult.message,
                      attempt: currentAttempt,
                      maxAttempts: 5,
                    }),
                  },
                });
                console.log("[VAPI] Function response sent to AI successfully");
              } catch (sendError) {
                console.error(
                  "[VAPI] Failed to send function response:",
                  sendError,
                );
              }
            } else if (func.name === "proceed_to_vote") {
              console.log("[VAPI] AI proceeding to vote");
              const transcriptUpdate = "\n🗳️ Proceeding to voting interface...";
              setTranscript((prev) => prev + transcriptUpdate);
              console.log(transcriptUpdate);

              try {
                await vapi.send({
                  type: "function-response",
                  functionResponse: {
                    name: func.name,
                    content: JSON.stringify({
                      success: true,
                      message: "Proceeding to voting interface",
                    }),
                  },
                });
                console.log("[VAPI] Proceed to vote response sent to AI");
              } catch (sendError) {
                console.error(
                  "[VAPI] Failed to send proceed response:",
                  sendError,
                );
              }

              handleProceedToVote();
              stopVoiceAssistant();
            } else if (func.name === "end_call_support") {
              console.log("[VAPI] AI ending call - referring to support");
              const transcriptUpdate =
                "\n📞 Referring to physical customer support. Call ending...";
              setTranscript((prev) => prev + transcriptUpdate);
              console.log(transcriptUpdate);

              try {
                await vapi.send({
                  type: "function-response",
                  functionResponse: {
                    name: func.name,
                    content: JSON.stringify({
                      success: true,
                      message: "Call ended, referred to customer support",
                      reason: func.parameters.reason,
                    }),
                  },
                });
                console.log("[VAPI] End call response sent to AI");
              } catch (sendError) {
                console.error(
                  "[VAPI] Failed to send end call response:",
                  sendError,
                );
              }

              setVoiceError(
                "Maximum authentication attempts reached. Please visit customer support.",
              );
              stopVoiceAssistant();
            }
          } else if (message.type === "transcript") {
            const timestamp = new Date().toLocaleTimeString();
            const transcriptText = `\n[${timestamp}] You: ${message.transcript}`;
            setTranscript((prev) => prev + transcriptText);
            console.log(transcriptText);
          } else if (message.type === "speech-update") {
            console.log("[VAPI] Speech update:", message);
            if (message.status === "started") {
              const timestamp = new Date().toLocaleTimeString();
              const transcriptText = `\n[${timestamp}] Assistant: Speaking...`;
              setTranscript((prev) => prev + transcriptText);
              console.log(transcriptText);
            }
          } else if (message.type === "conversation-update") {
            console.log("[VAPI] Conversation update:", message);
            if (message.conversation && message.conversation.length > 0) {
              const lastMessage =
                message.conversation[message.conversation.length - 1];
              if (lastMessage.role === "assistant" && lastMessage.message) {
                const timestamp = new Date().toLocaleTimeString();
                const transcriptText = `\n[${timestamp}] Assistant: ${lastMessage.message}`;
                setTranscript((prev) => prev + transcriptText);
                console.log(transcriptText);
              }
            }
          } else {
            console.log("[VAPI] Other message type:", message.type, message);
          }
        },

        onCallStart: () => {
          console.log("[VAPI] Vapi call started");
          const transcriptText = "\n🎤 Voice call started...";
          setTranscript((prev) => prev + transcriptText);
          console.log(transcriptText);
        },

        onSpeechStart: () => {
          console.log("[VAPI] User started speaking");
        },

        onSpeechEnd: () => {
          console.log("[VAPI] User stopped speaking");
        },

        onCallEnd: () => {
          console.log("[VAPI] Vapi call ended normally");
          setVoiceActive(false);
          const transcriptText = "\nCall ended.";
          setTranscript((prev) => prev + transcriptText);
          console.log(transcriptText);
        },

        onError: (err) => {
          console.error("[VAPI] Vapi onError callback:", err);

          if (
            err?.message?.includes("Meeting has ended") ||
            err?.errorMsg === "Meeting has ended"
          ) {
            console.log("[VAPI] Call ended normally via error callback");
            setVoiceActive(false);
            const transcriptText = "\nCall completed.";
            setTranscript((prev) => prev + transcriptText);
            console.log(transcriptText);
            return;
          }

          const errorMessage =
            err?.errorMsg || err?.message || "Unknown error occurred";
          setVoiceError(`Voice assistant error: ${errorMessage}`);
          setVoiceActive(false);
          const transcriptText = `\nError: ${errorMessage}`;
          setTranscript((prev) => prev + transcriptText);
          console.log(transcriptText);
        },
      });
      console.log("[VAPI] Voice assistant started successfully");
    } catch (error: any) {
      console.error("[VAPI] Failed to start voice assistant:", error);

      let errorMessage = "Failed to start voice assistant";
      if (error?.message?.includes("API key")) {
        errorMessage = "Invalid API key. Please check your configuration.";
      } else if (error?.message?.includes("network")) {
        errorMessage = "Network error. Please check your connection.";
      } else if (error?.message) {
        errorMessage = `Startup error: ${error.message}`;
      }

      setVoiceError(errorMessage);
      setVoiceActive(false);
    }
  };

  const stopVoiceAssistant = () => {
    console.log("[VAPI] Stopping voice assistant...");
    try {
      vapi.stop();
      setVoiceActive(false);
      setUseVoice(false);
      const transcriptText = "\nVoice assistant stopped.";
      setTranscript((prev) => prev + transcriptText);
      console.log(transcriptText);
    } catch (error: any) {
      console.error("[VAPI] Error stopping voice assistant:", error);
      // Force cleanup even if stop fails
      setVoiceActive(false);
      setUseVoice(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Voter Authentication</h1>
          <p className="text-slate-400">
            Enter your details to authenticate and proceed to vote
          </p>
        </div>

        <Card className="bg-white dark:bg-slate-900/95 backdrop-blur-xl border-slate-700/20 dark:border-slate-700/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Polling Unit Information</CardTitle>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                Unit ID: {pollingUnit.unitId}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-sm text-slate-400">Unit Name:</p>
                <p className="text-sm font-medium">{pollingUnit.unitName}</p>
              </div>
              <div className="flex justify-start items-center space-x-2">
                <p className="text-sm text-slate-400">Status</p>
                <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/50">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active Voting Session
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900/95 backdrop-blur-xl border-slate-700/20 dark:border-slate-700/50">
          <CardHeader>
            <CardTitle>Voter Authentication</CardTitle>
            <p className="text-slate-400 text-sm">
              Enter your details to authenticate and proceed to vote
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="matricNumber"
                className="text-slate-700 dark:text-slate-300"
              >
                Matriculation Number
              </Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="matricNumber"
                  type="text"
                  placeholder="Enter your matriculation number (e.g. UNI/12/2021)"
                  value={matricNumber}
                  onChange={(e) => setMatricNumber(e.target.value)}
                  className="pl-10 bg-slate-300/20 dark:bg-slate-800/50 dark:border-slate-600 placeholder-slate-400"
                  disabled={isProcessing || useVoice}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="surname"
                className="text-slate-700 dark:text-slate-300"
              >
                Surname
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="surname"
                  type="text"
                  placeholder="Enter your surname (e.g Mark)"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  className="pl-10 bg-slate-300/20 dark:bg-slate-800/50 dark:border-slate-600 placeholder-slate-400"
                  disabled={isProcessing || useVoice}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label
                htmlFor="voice-mode"
                className="text-slate-700 dark:text-slate-300"
              >
                Use Voice Assistant
              </Label>
              <Switch
                id="voice-mode"
                checked={useVoice}
                onCheckedChange={setUseVoice}
                disabled={isProcessing}
              />
            </div>

            {validationHash && (
              <div className="p-4 bg-blue-500/20 dark:bg-blue-900/20 border border-blue-700/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-blue-400" />
                  )}
                  <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                    {isProcessing
                      ? "Confirming Authentication..."
                      : "Authentication Transaction Submitted"}
                  </span>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-mono break-all">
                  {validationHash}
                </p>
              </div>
            )}

            {contractError && (
              <Alert className="bg-red-900/20 border-red-700/50">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-300">
                  Voter authentication failed. Try again!
                </AlertDescription>
              </Alert>
            )}

            <div className="flex space-x-3">
              <Button
                onClick={onBack}
                variant="outline"
                className="flex-1 bg-transparent hidden"
                disabled={isProcessing}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleAuthenticate}
                disabled={
                  !matricNumber.trim() || !surname.trim() || isProcessing
                }
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {validationHash ? "Confirming..." : "Preparing..."}
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Authenticate
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Dialog
          open={useVoice}
          onOpenChange={(open) => {
            setUseVoice(open);
            if (!open && voiceActive) {
              stopVoiceAssistant();
            }
          }}
        >
          <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-blue-500/50">
            <DialogHeader>
              <DialogTitle className="text-blue-400">
                AI Voice Assistant
              </DialogTitle>
              <p className="text-sm text-slate-400">
                Speak clearly to provide your surname and matriculation number.
              </p>
            </DialogHeader>
            <div className="space-y-4">
              {voiceError && (
                <Alert className="bg-red-900/20 border-red-700/50">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-300">
                    {voiceError}
                  </AlertDescription>
                </Alert>
              )}

              <div className="p-4 bg-slate-800/50 rounded-lg max-h-40 overflow-y-auto">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-blue-400 font-medium">
                    {voiceActive ? "🎤 Listening..." : "Ready to listen..."}
                  </p>
                  {authAttempts > 0 && (
                    <span className="text-xs text-slate-400">
                      Attempts: {authAttempts}/5
                    </span>
                  )}
                </div>
                <p className="text-slate-300 text-sm whitespace-pre-wrap">
                  {transcript ||
                    "Click 'Start Speaking' to begin voice authentication..."}
                </p>
                {isAIAuthenticating && (
                  <div className="flex items-center gap-2 mt-2 p-2 bg-blue-900/20 rounded">
                    <Loader2 className="h-3 w-3 animate-spin text-blue-400" />
                    <span className="text-xs text-blue-400">
                      Authenticating with blockchain...
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={startVoiceAssistant}
                  disabled={voiceActive}
                >
                  <Mic className="mr-2 h-4 w-4" />
                  {voiceActive ? "Speaking..." : "Start Speaking"}
                </Button>

                {voiceActive && (
                  <Button
                    variant="outline"
                    onClick={stopVoiceAssistant}
                    className="px-4 bg-transparent"
                  >
                    Stop
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={authenticationResult?.success && !!authenticationResult.voter}
          onOpenChange={() => {}}
        >
          <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-green-500/50">
            <DialogHeader>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-700 dark:text-green-400" />
                </div>
                <DialogTitle className="text-green-700 dark:text-green-400 text-xl">
                  Authentication Successful
                </DialogTitle>
                <p className="text-green-600 dark:text-green-400 text-sm mt-2">
                  You have been verified and can now proceed to vote
                </p>
              </div>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Name:</span>
                  <span className="font-medium">
                    {authenticationResult?.voter?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Matriculation:</span>
                  <span className="font-mono">
                    {authenticationResult?.voter?.matricNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/50">
                    Accredited & Verified
                  </Badge>
                </div>
              </div>
              <Button
                onClick={handleProceedToVote}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 h-12"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Proceed to Vote
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="text-center">
          <p className="text-xs text-slate-500">
            Your credentials will be verified against the blockchain election
            contract
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoterAuthenticationModal;
