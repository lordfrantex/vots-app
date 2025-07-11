export const abi = [
  {
    inputs: [
      { internalType: "address", name: "_electionCreator", type: "address" },
      { internalType: "address", name: "_nftAddress", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  { inputs: [], name: "VotsEngine__DuplicateElectionName", type: "error" },
  { inputs: [], name: "VotsEngine__ElectionNameCannotBeEmpty", type: "error" },
  { inputs: [], name: "VotsEngine__ElectionNotFound", type: "error" },
  { inputs: [], name: "VotsEngine__ElectionNotFound", type: "error" },
  { inputs: [], name: "VotsEngine__FunctionClientNotSet", type: "error" },
  { inputs: [], name: "VotsEngine__OnlyFunctionClient", type: "error" },
  { inputs: [], name: "VotsEngine__VaultAddressNotSet", type: "error" },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "newElectionTokenId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "electionName",
        type: "string",
      },
    ],
    name: "ElectionContractedCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "oldClient",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newClient",
        type: "address",
      },
    ],
    name: "FunctionClientUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "oldVaultAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newVaultAddress",
        type: "address",
      },
    ],
    name: "VaultAddressUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "requestId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "string",
        name: "voterMatricNo",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "electionTokenId",
        type: "uint256",
      },
    ],
    name: "VerificationRequestSent",
    type: "event",
  },
  {
    inputs: [
      { internalType: "string", name: "voterMatricNo", type: "string" },
      { internalType: "uint256", name: "electionTokenId", type: "uint256" },
    ],
    name: "accrediteVoter",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "uint256", name: "startTimeStamp", type: "uint256" },
          { internalType: "uint256", name: "endTimeStamp", type: "uint256" },
          { internalType: "string", name: "electionName", type: "string" },
          { internalType: "string", name: "description", type: "string" },
          {
            components: [
              { internalType: "string", name: "name", type: "string" },
              { internalType: "string", name: "matricNo", type: "string" },
              { internalType: "string", name: "category", type: "string" },
              { internalType: "uint256", name: "voteFor", type: "uint256" },
              { internalType: "uint256", name: "voteAgainst", type: "uint256" },
            ],
            internalType: "struct IElection.CandidateInfoDTO[]",
            name: "candidatesList",
            type: "tuple[]",
          },
          {
            components: [
              { internalType: "string", name: "name", type: "string" },
              { internalType: "string", name: "matricNo", type: "string" },
              { internalType: "string", name: "department", type: "string" },
              { internalType: "uint256", name: "level", type: "uint256" },
            ],
            internalType: "struct IElection.VoterInfoDTO[]",
            name: "votersList",
            type: "tuple[]",
          },
          {
            components: [
              { internalType: "string", name: "pollRoleName", type: "string" },
              { internalType: "address", name: "pollAddress", type: "address" },
            ],
            internalType: "struct IElection.PollIdentifier[]",
            name: "pollingUnits",
            type: "tuple[]",
          },
          {
            components: [
              { internalType: "string", name: "pollRoleName", type: "string" },
              { internalType: "address", name: "pollAddress", type: "address" },
            ],
            internalType: "struct IElection.PollIdentifier[]",
            name: "pollingOfficers",
            type: "tuple[]",
          },
          {
            internalType: "string[]",
            name: "electionCategories",
            type: "string[]",
          },
        ],
        internalType: "struct IElection.ElectionParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "createElection",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "electionTokenId", type: "uint256" },
    ],
    name: "electionExistsByTokenId",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "voterMatricNo", type: "string" },
      { internalType: "uint256", name: "electionTokenId", type: "uint256" },
      { internalType: "address", name: "messageSender", type: "address" },
    ],
    name: "fulfillVoterAccreditation",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "functionClient",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "electionTokenId", type: "uint256" },
    ],
    name: "getAllAccreditedVoters",
    outputs: [
      {
        components: [
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "department", type: "string" },
          { internalType: "uint256", name: "level", type: "uint256" },
          {
            internalType: "enum IElection.VoterState",
            name: "voterState",
            type: "uint8",
          },
        ],
        internalType: "struct IElection.ElectionVoter[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "electionTokenId", type: "uint256" },
    ],
    name: "getAllCandidates",
    outputs: [
      {
        components: [
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "matricNo", type: "string" },
          { internalType: "string", name: "category", type: "string" },
          { internalType: "uint256", name: "voteFor", type: "uint256" },
          { internalType: "uint256", name: "voteAgainst", type: "uint256" },
        ],
        internalType: "struct IElection.CandidateInfoDTO[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "electionTokenId", type: "uint256" },
    ],
    name: "getAllCandidatesInDto",
    outputs: [
      {
        components: [
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "matricNo", type: "string" },
          { internalType: "string", name: "category", type: "string" },
          { internalType: "uint256", name: "voteFor", type: "uint256" },
          { internalType: "uint256", name: "voteAgainst", type: "uint256" },
        ],
        internalType: "struct IElection.CandidateInfoDTO[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllElectionsSummary",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "electionId", type: "uint256" },
          { internalType: "string", name: "electionName", type: "string" },
          {
            internalType: "string",
            name: "electionDescription",
            type: "string",
          },
          {
            internalType: "enum IElection.ElectionState",
            name: "state",
            type: "uint8",
          },
          { internalType: "uint256", name: "startTimestamp", type: "uint256" },
          { internalType: "uint256", name: "endTimestamp", type: "uint256" },
          {
            internalType: "uint256",
            name: "registeredVotersCount",
            type: "uint256",
          },
        ],
        internalType: "struct IVotsEngine.ElectionSummary[]",
        name: "electionsSummaryList",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "electionTokenId", type: "uint256" },
    ],
    name: "getAllVotedVoters",
    outputs: [
      {
        components: [
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "department", type: "string" },
          { internalType: "uint256", name: "level", type: "uint256" },
          {
            internalType: "enum IElection.VoterState",
            name: "voterState",
            type: "uint8",
          },
        ],
        internalType: "struct IElection.ElectionVoter[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "electionTokenId", type: "uint256" },
    ],
    name: "getAllVoters",
    outputs: [
      {
        components: [
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "department", type: "string" },
          { internalType: "uint256", name: "level", type: "uint256" },
          {
            internalType: "enum IElection.VoterState",
            name: "voterState",
            type: "uint8",
          },
        ],
        internalType: "struct IElection.ElectionVoter[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "electionTokenId", type: "uint256" },
    ],
    name: "getEachCategoryWinner",
    outputs: [
      {
        components: [
          { internalType: "string", name: "matricNo", type: "string" },
          {
            components: [
              { internalType: "string", name: "name", type: "string" },
              { internalType: "uint256", name: "votes", type: "uint256" },
              {
                internalType: "uint256",
                name: "votesAgainst",
                type: "uint256",
              },
              {
                internalType: "enum IElection.CandidateState",
                name: "state",
                type: "uint8",
              },
            ],
            internalType: "struct IElection.ElectionCandidate",
            name: "electionCandidate",
            type: "tuple",
          },
          { internalType: "string", name: "category", type: "string" },
        ],
        internalType: "struct IElection.ElectionWinner[][]",
        name: "",
        type: "tuple[][]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "electionTokenId", type: "uint256" },
    ],
    name: "getElectionAddress",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "electionTokenId", type: "uint256" },
    ],
    name: "getElectionInfo",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "electionId", type: "uint256" },
          { internalType: "address", name: "createdBy", type: "address" },
          { internalType: "string", name: "electionName", type: "string" },
          {
            internalType: "string",
            name: "electionDescription",
            type: "string",
          },
          {
            internalType: "enum IElection.ElectionState",
            name: "state",
            type: "uint8",
          },
          { internalType: "uint256", name: "startTimestamp", type: "uint256" },
          { internalType: "uint256", name: "endTimestamp", type: "uint256" },
          {
            internalType: "uint256",
            name: "registeredVotersCount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "accreditedVotersCount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "votedVotersCount",
            type: "uint256",
          },
          {
            internalType: "string[]",
            name: "electionCategories",
            type: "string[]",
          },
          {
            components: [
              { internalType: "string", name: "pollRoleName", type: "string" },
              { internalType: "address", name: "pollAddress", type: "address" },
            ],
            internalType: "struct IElection.PollIdentifier[]",
            name: "pollingOfficers",
            type: "tuple[]",
          },
          {
            components: [
              { internalType: "string", name: "pollRoleName", type: "string" },
              { internalType: "address", name: "pollAddress", type: "address" },
            ],
            internalType: "struct IElection.PollIdentifier[]",
            name: "pollingUnits",
            type: "tuple[]",
          },
          {
            components: [
              { internalType: "string", name: "name", type: "string" },
              { internalType: "string", name: "matricNo", type: "string" },
              { internalType: "string", name: "category", type: "string" },
              { internalType: "uint256", name: "voteFor", type: "uint256" },
              { internalType: "uint256", name: "voteAgainst", type: "uint256" },
            ],
            internalType: "struct IElection.CandidateInfoDTO[]",
            name: "candidatesList",
            type: "tuple[]",
          },
        ],
        internalType: "struct IVotsEngine.ElectionInfo",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "electionTokenId", type: "uint256" },
    ],
    name: "getElectionStats",
    outputs: [
      {
        internalType: "uint256",
        name: "registeredVotersCount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "accreditedVotersCount",
        type: "uint256",
      },
      { internalType: "uint256", name: "votedVotersCount", type: "uint256" },
      {
        internalType: "uint256",
        name: "registeredCandidatesCount",
        type: "uint256",
      },
      { internalType: "uint256", name: "pollingOfficerCount", type: "uint256" },
      { internalType: "uint256", name: "pollingUnitCount", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "electionName", type: "string" }],
    name: "getElectionTokenId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getFunctionClient",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getNFTAddres",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getOwner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalElectionsCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "ninNumber", type: "string" },
      { internalType: "string", name: "firstName", type: "string" },
      { internalType: "string", name: "lastName", type: "string" },
      { internalType: "string", name: "voterMatricNo", type: "string" },
      { internalType: "uint256", name: "slotId", type: "uint256" },
      { internalType: "uint256", name: "version", type: "uint256" },
      { internalType: "uint256", name: "electionTokenId", type: "uint256" },
      { internalType: "uint64", name: "subscriptionId", type: "uint64" },
    ],
    name: "sendVerificationRequestForElection",
    outputs: [{ internalType: "bytes32", name: "requestId", type: "bytes32" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_functionClient", type: "address" },
    ],
    name: "setFunctionClient",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "electionTokenId", type: "uint256" },
    ],
    name: "updateElectionState",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "electionTokenId", type: "uint256" },
    ],
    name: "validateAddressAsPollingOfficer",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "electionTokenId", type: "uint256" },
    ],
    name: "validateAddressAsPollingUnit",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "voterMatricNo", type: "string" },
      { internalType: "string", name: "voterName", type: "string" },
      { internalType: "uint256", name: "electionTokenId", type: "uint256" },
    ],
    name: "validateVoterForVoting",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "voterMatricNo", type: "string" },
      { internalType: "string", name: "voterName", type: "string" },
      {
        components: [
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "matricNo", type: "string" },
          { internalType: "string", name: "category", type: "string" },
          { internalType: "uint256", name: "voteFor", type: "uint256" },
          { internalType: "uint256", name: "voteAgainst", type: "uint256" },
        ],
        internalType: "struct IElection.CandidateInfoDTO[]",
        name: "candidatesList",
        type: "tuple[]",
      },
      { internalType: "uint256", name: "electionTokenId", type: "uint256" },
    ],
    name: "voteCandidates",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "VotsEngine__VoterNotAccredited",
    type: "error",
  },
  {
    inputs: [],
    name: "VotsEngine__ElectionNotActive",
    type: "error",
  },
  {
    inputs: [],
    name: "VotsEngine__InvalidVoterDetails",
    type: "error",
  },
] as const;
