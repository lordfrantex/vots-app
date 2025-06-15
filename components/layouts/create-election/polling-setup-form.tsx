"use client"

import { ChevronDown, ChevronRight, CheckCircle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PollingOfficer {
  id: string
  address: string
  role: string
}

interface PollingUnit {
  id: string
  address: string
  name: string
}

interface PollingSetupFormProps {
  pollingOfficers: PollingOfficer[]
  pollingUnits: PollingUnit[]
  isExpanded: boolean
  onToggle: () => void
  onAddOfficer: () => void
  onAddUnit: () => void
  onUpdateOfficer: (id: string, field: string, value: string) => void
  onUpdateUnit: (id: string, field: string, value: string) => void
}

export function PollingSetupForm({
  pollingOfficers,
  pollingUnits,
  isExpanded,
  onToggle,
  onAddOfficer,
  onAddUnit,
  onUpdateOfficer,
  onUpdateUnit,
}: PollingSetupFormProps) {
  return (
    <Card className="glass-card">
      <CardHeader className="cursor-pointer" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-purple-400" />
            <span>Polling Setup</span>
          </CardTitle>
          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Polling Officers */}
            <div className="glass-panel p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Polling Officers</h3>
                <Button
                  onClick={onAddOfficer}
                  size="sm"
                  className="neumorphic-button bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border-purple-500/30"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>

              <div className="space-y-3">
                {pollingOfficers.map((officer) => (
                  <div key={officer.id} className="space-y-2">
                    <Input
                      className="neumorphic-input text-sm"
                      placeholder="Wallet Address"
                      value={officer.address}
                      onChange={(e) => onUpdateOfficer(officer.id, "address", e.target.value)}
                    />
                  </div>
                ))}
              </div>

              {pollingOfficers.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">No officers added yet.</div>
              )}
            </div>

            {/* Polling Units */}
            <div className="glass-panel p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Polling Units</h3>
                <Button
                  onClick={onAddUnit}
                  size="sm"
                  className="neumorphic-button bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border-purple-500/30"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>

              <div className="space-y-3">
                {pollingUnits.map((unit) => (
                  <div key={unit.id} className="space-y-2">
                    <Input
                      className="neumorphic-input text-sm"
                      placeholder="Unit Name"
                      value={unit.name}
                      onChange={(e) => onUpdateUnit(unit.id, "name", e.target.value)}
                    />
                    <Input
                      className="neumorphic-input text-sm"
                      placeholder="Wallet Address"
                      value={unit.address}
                      onChange={(e) => onUpdateUnit(unit.id, "address", e.target.value)}
                    />
                  </div>
                ))}
              </div>

              {pollingUnits.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">No units added yet.</div>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
