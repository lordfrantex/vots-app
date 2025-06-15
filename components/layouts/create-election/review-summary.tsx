"use client"

import { ChevronDown, ChevronRight, CheckCircle, Vote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ElectionData {
  name: string
  description: string
  startDate: string
  endDate: string
  timezone: string
  categories: Array<{ id: string; name: string }>
  candidates: Array<{ id: string; name: string; candidateId: string; category: string }>
  pollingOfficers: Array<{ id: string; address: string; role: string }>
  pollingUnits: Array<{ id: string; address: string; name: string }>
}

interface ReviewSummaryProps {
  electionData: ElectionData
  isExpanded: boolean
  onToggle: () => void
  onSubmit: () => void
}

export function ReviewSummary({ electionData, isExpanded, onToggle, onSubmit }: ReviewSummaryProps) {
  return (
    <Card className="glass-card">
      <CardHeader className="cursor-pointer" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span>Review & Submit</span>
          </CardTitle>
          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-3">Election Summary</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-400">Name:</span>{" "}
                  <span className="text-white">{electionData.name || "Not set"}</span>
                </div>
                <div>
                  <span className="text-gray-400">Categories:</span>{" "}
                  <span className="text-white">{electionData.categories.length}</span>
                </div>
                <div>
                  <span className="text-gray-400">Candidates:</span>{" "}
                  <span className="text-white">{electionData.candidates.length}</span>
                </div>
                <div>
                  <span className="text-gray-400">Polling Officers:</span>{" "}
                  <span className="text-white">{electionData.pollingOfficers.length}</span>
                </div>
                <div>
                  <span className="text-gray-400">Polling Units:</span>{" "}
                  <span className="text-white">{electionData.pollingUnits.length}</span>
                </div>
                <div>
                  <span className="text-gray-400">Start:</span>{" "}
                  <span className="text-white">{electionData.startDate || "Not set"}</span>
                </div>
                <div>
                  <span className="text-gray-400">End:</span>{" "}
                  <span className="text-white">{electionData.endDate || "Not set"}</span>
                </div>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-3">Transaction Preview</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-400">Estimated Gas:</span> <span className="text-white">0.025 ETH</span>
                </div>
                <div>
                  <span className="text-gray-400">Network:</span> <span className="text-white">Ethereum Mainnet</span>
                </div>
                <div>
                  <span className="text-gray-400">Contract:</span> <span className="text-white">ElectionFactory</span>
                </div>
                <div>
                  <span className="text-gray-400">Function:</span> <span className="text-white">createElection()</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-6">
            <Button
              onClick={onSubmit}
              size="lg"
              className="neumorphic-submit bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-12 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Vote className="w-5 h-5 mr-2" />
              Create Election
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
