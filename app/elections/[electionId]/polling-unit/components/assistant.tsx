"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Loader2, Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useVapi, CALL_STATUS } from "@/hooks/useVapi";
import { useParams } from "next/navigation";

const Assistant = () => {
  const { toggleCall, callStatus, audioLevel } = useVapi();
  const [useVoice, setUseVoice] = useState(false);

  const getButtonColor = () => {
    switch (callStatus) {
      case CALL_STATUS.ACTIVE:
        return "red";
      case CALL_STATUS.LOADING:
        return "orange";
      default:
        return "green";
    }
  };

  const getButtonStyle = () => {
    const color = getButtonColor();
    return {
      borderRadius: "50%",
      width: "60px",
      height: "60px",
      color: "white",
      border: "none",
      boxShadow: `1px 1px ${10 + audioLevel * 40}px ${
        audioLevel * 10
      }px ${color}`,
      backgroundColor: color,
      cursor: "pointer",
    };
  };

  const getButtonClasses = () => {
    switch (callStatus) {
      case CALL_STATUS.ACTIVE:
        return "bg-red-500 hover:bg-red-700";
      case CALL_STATUS.LOADING:
        return "bg-orange-500 hover:bg-orange-700";
      default:
        return "bg-green-500 hover:bg-green-700";
    }
  };

  const renderButtonIcon = () => {
    switch (callStatus) {
      case CALL_STATUS.ACTIVE:
        return <Square className="h-5 w-5" />;
      case CALL_STATUS.LOADING:
        return <Loader2 className="h-5 w-5 animate-spin" />;
      default:
        return <Mic className="h-5 w-5" />;
    }
  };

  const getStatusText = () => {
    switch (callStatus) {
      case CALL_STATUS.ACTIVE:
        return "🎤 Connected - Speaking...";
      case CALL_STATUS.LOADING:
        return "🔄 Connecting...";
      default:
        return "Ready to connect...";
    }
  };

  return (
    <>
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
        />
      </div>

      <Dialog
        open={useVoice}
        onOpenChange={(open) => {
          setUseVoice(open);
          if (!open && callStatus === CALL_STATUS.ACTIVE) {
            toggleCall();
          }
        }}
      >
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-blue-500/50">
          <DialogHeader>
            <DialogTitle className="text-blue-400">
              AI Voice Assistant
            </DialogTitle>
            <p className="text-sm text-slate-400">
              Click the button below to start or end your voice conversation.
            </p>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <p className="text-blue-400 font-medium">{getStatusText()}</p>
                {audioLevel > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-400">Audio:</span>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 h-4 rounded-full transition-colors ${
                            i < audioLevel * 5 ? "bg-green-500" : "bg-slate-600"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="text-slate-300 text-sm">
                {callStatus === CALL_STATUS.INACTIVE
                  ? "Click the microphone button to start your voice conversation."
                  : callStatus === CALL_STATUS.LOADING
                    ? "Establishing connection..."
                    : "Voice assistant is active and listening."}
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                style={getButtonStyle()}
                className={`transition-all duration-200 ease-in-out ${getButtonClasses()} flex items-center justify-center`}
                onClick={toggleCall}
              >
                {renderButtonIcon()}
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-slate-500">
                {callStatus === CALL_STATUS.ACTIVE
                  ? "Click to end call"
                  : callStatus === CALL_STATUS.LOADING
                    ? "Connecting..."
                    : "Click to start call"}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Assistant;
