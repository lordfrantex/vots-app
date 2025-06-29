"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, CheckCircle, Vote } from "lucide-react";
import type { PollingOfficerVoterView } from "@/utils/contract-helpers";

interface AccreditedVotersListProps {
  voters: PollingOfficerVoterView[];
}

export function AccreditedVotersList({ voters }: AccreditedVotersListProps) {
  const votedVoters = voters.filter((voter) => voter.hasVoted);
  const accreditedButNotVoted = voters.filter(
    (voter) => voter.isAccredited && !voter.hasVoted,
  );

  return (
    <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-slate-100 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-400" />
          Accredited Voters ({voters.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {voters.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No accredited voters yet</p>
                <p className="text-sm text-slate-500 mt-2">
                  Accredited voters will appear here
                </p>
              </div>
            ) : (
              <>
                {/* Voted Voters */}
                {votedVoters.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-blue-400 font-medium">
                      <Vote className="h-4 w-4" />
                      Voted ({votedVoters.length})
                    </div>
                    {votedVoters.map((voter) => (
                      <div
                        key={voter.id}
                        className="p-3 bg-blue-900/20 rounded-lg border border-blue-700/50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-800/50 p-2 rounded-lg">
                              <User className="h-4 w-4 text-blue-400" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-100">
                                {voter.name}
                              </p>
                              <p className="text-sm text-slate-400 font-mono">
                                {voter.maskedMatricNumber}
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-blue-900/30 text-blue-400 border-blue-700/50">
                            Voted
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Accredited but not voted */}
                {accreditedButNotVoted.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-green-400 font-medium">
                      <CheckCircle className="h-4 w-4" />
                      Accredited ({accreditedButNotVoted.length})
                    </div>
                    {accreditedButNotVoted.map((voter) => (
                      <div
                        key={voter.id}
                        className="p-3 bg-green-900/20 rounded-lg border border-green-700/50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-green-800/50 p-2 rounded-lg">
                              <User className="h-4 w-4 text-green-400" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-100">
                                {voter.name}
                              </p>
                              <p className="text-sm text-slate-400 font-mono">
                                {voter.maskedMatricNumber}
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-green-900/30 text-green-400 border-green-700/50">
                            Accredited
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
