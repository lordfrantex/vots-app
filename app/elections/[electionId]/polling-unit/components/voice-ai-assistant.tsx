"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, Volume2, Loader2, Phone, PhoneOff } from "lucide-react";

interface VoiceAIAssistantProps {
  onDataExtracted: (data: { matricNumber: string; surname: string }) => void;
  onClose: () => void;
  isOpen: boolean;
}

interface VAPIResponse {
  transcript?: string;
  extractedData?: {
    matricNumber?: string;
    surname?: string;
  };
}

const VoiceAIAssistant = ({
  onDataExtracted,
  onClose,
  isOpen,
}: VoiceAIAssistantProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [conversationStep, setConversationStep] = useState(0);
  const [extractedData, setExtractedData] = useState({
    matricNumber: "",
    surname: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // VAPI integration refs
  const vapiClient = useRef<any>(null);
  const audioContext = useRef<AudioContext | null>(null);

  // Conversation flow
  const conversationSteps = [
    {
      message:
        "Hello! I'm your voice assistant. I'll help you authenticate for voting. May I have your matriculation number please?",
      expectingData: "matricNumber",
    },
    {
      message: "Thank you. Now, could you please tell me your surname?",
      expectingData: "surname",
    },
    {
      message: "Perfect! I have your details. Let me authenticate you now.",
      expectingData: "complete",
    },
  ];

  // Initialize VAPI connection
  const initializeVAPI = async () => {
    try {
      setIsProcessing(true);

      // Simulate VAPI initialization (replace with actual VAPI SDK)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsConnected(true);
      setIsListening(true);
      setAiResponse(conversationSteps[0].message);

      // Start speech recognition
      startSpeechRecognition();
    } catch (error) {
      console.error("Failed to initialize VAPI:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Speech recognition setup
  const startSpeechRecognition = () => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      console.error("Speech recognition not supported");
      return;
    }

    const SpeechRecognition =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(finalTranscript);
        processUserInput(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
    };

    recognition.start();
  };

  // Process user speech input
  const processUserInput = async (input: string) => {
    const currentStep = conversationSteps[conversationStep];

    if (currentStep.expectingData === "matricNumber") {
      const matricMatch = extractMatricNumber(input);
      if (matricMatch) {
        setExtractedData((prev) => ({ ...prev, matricNumber: matricMatch }));
        setConversationStep(1);
        setAiResponse(conversationSteps[1].message);
        speakResponse(conversationSteps[1].message);
      } else {
        const clarification =
          "I didn't catch your matriculation number clearly. Could you please repeat it? For example, UNI slash 12 slash 2021.";
        setAiResponse(clarification);
        speakResponse(clarification);
      }
    } else if (currentStep.expectingData === "surname") {
      const surnameMatch = extractSurname(input);
      if (surnameMatch) {
        const finalData = {
          matricNumber: extractedData.matricNumber,
          surname: surnameMatch,
        };
        setExtractedData((prev) => ({ ...prev, surname: surnameMatch }));
        setConversationStep(2);
        setAiResponse(conversationSteps[2].message);
        speakResponse(conversationSteps[2].message);

        // Complete authentication after a brief delay
        setTimeout(() => {
          onDataExtracted(finalData);
          handleDisconnect();
        }, 2000);
      } else {
        const clarification =
          "I didn't catch your surname clearly. Could you please spell it out for me?";
        setAiResponse(clarification);
        speakResponse(clarification);
      }
    }
  };

  // Extract matriculation number from speech
  const extractMatricNumber = (text: string): string => {
    // Common patterns for matriculation numbers
    const patterns = [
      /([A-Z]{2,4})[/\s]?(\d{2})[/\s]?(\d{4})/i,
      /([A-Z]{2,4})(\d{2})(\d{4})/i,
      /(\d{2})[/\s]?(\d{4})[/\s]?([A-Z]{2,4})/i,
    ];

    const cleanText = text
      .replace(/slash|forward slash|\//gi, "/")
      .replace(/\s+/g, " ");

    for (const pattern of patterns) {
      const match = cleanText.match(pattern);
      if (match) {
        if (match[1] && match[2] && match[3]) {
          return `${match[1].toUpperCase()}/${match[2]}/${match[3]}`;
        }
      }
    }

    return "";
  };

  // Extract surname from speech
  const extractSurname = (text: string): string => {
    // Remove common filler words and extract the main name
    const cleanText = text
      .replace(/my surname is|my name is|i am|it's|it is/gi, "")
      .replace(/[^a-zA-Z\s]/g, "")
      .trim()
      .toUpperCase();

    // Take the first significant word as surname
    const words = cleanText.split(/\s+/).filter((word) => word.length > 1);
    return words[0] || "";
  };

  // Text-to-speech for AI responses
  const speakResponse = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  // Handle connection
  const handleConnect = () => {
    initializeVAPI();
  };

  // Handle disconnection
  const handleDisconnect = () => {
    setIsConnected(false);
    setIsListening(false);
    setTranscript("");
    setAiResponse("");
    setConversationStep(0);
    setExtractedData({ matricNumber: "", surname: "" });

    // Stop speech synthesis
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
    }

    onClose();
  };

  // Auto-speak initial message when connected
  useEffect(() => {
    if (isConnected && aiResponse && conversationStep === 0) {
      setTimeout(() => speakResponse(aiResponse), 500);
    }
  }, [isConnected, aiResponse, conversationStep]);

  if (!isOpen) return null;

  return (
    <Card className="bg-slate-900/95 backdrop-blur-xl border-teal-500/30 shadow-2xl">
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-500/20 rounded-full flex items-center justify-center">
              <Volume2 className="h-5 w-5 text-teal-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                AI Voice Assistant
              </h3>
              <p className="text-sm text-teal-400">
                {isConnected ? "Ready to listen..." : "Click to connect"}
              </p>
            </div>
          </div>
          <Badge
            className={`${
              isConnected
                ? "bg-green-500/20 text-green-400 border-green-500/50"
                : "bg-gray-500/20 text-gray-400 border-gray-500/50"
            }`}
          >
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>

        {/* Voice Visualization */}
        <div className="bg-slate-800/50 rounded-lg p-4 min-h-[100px] flex items-center justify-center">
          {isListening ? (
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-teal-400 rounded-full animate-pulse"
                  style={{
                    height: `${Math.random() * 30 + 10}px`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center">
              <Mic className="h-8 w-8 text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-400">
                {isConnected ? "Listening..." : "Not connected"}
              </p>
            </div>
          )}
        </div>

        {/* AI Response */}
        {aiResponse && (
          <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg p-3">
            <p className="text-sm text-teal-100 italic">"{aiResponse}"</p>
          </div>
        )}

        {/* User Transcript */}
        {transcript && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <p className="text-sm text-blue-100">You said: "{transcript}"</p>
          </div>
        )}

        {/* Extracted Data Preview */}
        {(extractedData.matricNumber || extractedData.surname) && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 space-y-2">
            <p className="text-sm font-medium text-green-400">
              Extracted Information:
            </p>
            {extractedData.matricNumber && (
              <p className="text-sm text-green-100">
                Matric Number: {extractedData.matricNumber}
              </p>
            )}
            {extractedData.surname && (
              <p className="text-sm text-green-100">
                Surname: {extractedData.surname}
              </p>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-3">
          {!isConnected ? (
            <Button
              onClick={handleConnect}
              disabled={isProcessing}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Phone className="mr-2 h-4 w-4" />
                  Start Voice Authentication
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleDisconnect}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              <PhoneOff className="mr-2 h-4 w-4" />
              End Call
            </Button>
          )}
        </div>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-xs text-gray-400">
            Speak clearly and wait for the assistant to respond
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceAIAssistant;
