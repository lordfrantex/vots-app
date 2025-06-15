"use client"

import { ChevronDown, ChevronRight, Users, Plus, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Candidate {
  id: string
  name: string
  candidateId: string
  category: string
  photo?: string
}

interface Category {
  id: string
  name: string
}

interface CandidatesFormProps {
  candidates: Candidate[]
  categories: Category[]
  isExpanded: boolean
  onToggle: () => void
  onAdd: () => void
  onRemove: (id: string) => void
  onUpdate: (id: string, field: string, value: string) => void
}

export function CandidatesForm({
  candidates,
  categories,
  isExpanded,
  onToggle,
  onAdd,
  onRemove,
  onUpdate,
}: CandidatesFormProps) {
  return (
    <Card className="glass-card">
      <CardHeader className="cursor-pointer" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-green-400" />
            <span>Candidates Registration</span>
          </CardTitle>
          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-gray-400">Register candidates for each position category</p>
            <div className="flex space-x-2">
              <Button variant="outline" className="neumorphic-button border-gray-600 text-gray-300">
                <Upload className="w-4 h-4 mr-2" />
                Upload CSV
              </Button>
              <Button
                onClick={onAdd}
                className="neumorphic-button bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/30"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Candidate
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {candidates.map((candidate) => (
              <div key={candidate.id} className="glass-panel p-4 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                    <Users className="w-6 h-6 text-gray-400" />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(candidate.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <Input
                    className="neumorphic-input"
                    placeholder="Candidate Name"
                    value={candidate.name}
                    onChange={(e) => onUpdate(candidate.id, "name", e.target.value)}
                  />
                  <Input
                    className="neumorphic-input"
                    placeholder="Candidate ID"
                    value={candidate.candidateId}
                    onChange={(e) => onUpdate(candidate.id, "candidateId", e.target.value)}
                  />
                  <Select
                    value={candidate.category}
                    onValueChange={(value) => onUpdate(candidate.id, "category", value)}
                  >
                    <SelectTrigger className="neumorphic-input">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="glass-panel border-white/10">
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>

          {candidates.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No candidates registered yet. Click "Add Candidate" to get started.
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
