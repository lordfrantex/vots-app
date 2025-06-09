import { Election } from "@/types/election";

// Mock data
const mockElections: Election[] = [
  {
    id: "1",
    name: "Student Council Election 2023",
    startTime: new Date("2023-05-15"),
    endTime: new Date("2025-06-15T18:00:00"), // Future date for demo
    status: "ACTIVE",
    categories: [
      "President",
      "Vice President",
      "General Secretary",
      "Treasurer",
      "PRO",
      "D.O Socials",
      "D.O Welfare",
    ],
    totalVoters: 1248,
    totalVotes: 846,
    candidates: [
      // President Candidates
      {
        id: "c1",
        name: "Michael Johnson",
        category: "President",
        voteCount: 324,
        photo: "/images/michael.jpg",
        matricNumber: "ENG/19/0001",
      },
      {
        id: "c2",
        name: "Sarah Williams",
        category: "President",
        voteCount: 286,
        photo: "/images/sarah.jpg",
        matricNumber: "SCI/18/0045",
      },
      {
        id: "c3",
        name: "David Chen",
        category: "President",
        voteCount: 236,
        photo: "/images/david.jpg",
        matricNumber: "MED/20/0123",
      },

      // Vice President Candidates
      {
        id: "c4",
        name: "Emily Rodriguez",
        category: "Vice President",
        voteCount: 298,
        photo: "/images/emily.jpg",
        matricNumber: "LAW/19/0067",
      },
      {
        id: "c5",
        name: "James Thompson",
        category: "Vice President",
        voteCount: 245,
        photo: "/images/james.jpg",
        matricNumber: "BUS/18/0089",
      },
      {
        id: "c6",
        name: "Aisha Patel",
        category: "Vice President",
        voteCount: 203,
        photo: "/images/aisha.jpg",
        matricNumber: "ART/20/0034",
      },

      // General Secretary Candidates
      {
        id: "c7",
        name: "Robert Kim",
        category: "General Secretary",
        voteCount: 312,
        photo: "/images/robert.jpg",
        matricNumber: "ENG/19/0078",
      },
      {
        id: "c8",
        name: "Lisa Anderson",
        category: "General Secretary",
        voteCount: 289,
        photo: "/images/lisa.jpg",
        matricNumber: "EDU/18/0156",
      },

      // Treasurer Candidates
      {
        id: "c9",
        name: "Mohammed Ali",
        category: "Treasurer",
        voteCount: 267,
        photo: "/images/mohammed.jpg",
        matricNumber: "BUS/19/0234",
      },
      {
        id: "c10",
        name: "Grace Okafor",
        category: "Treasurer",
        voteCount: 234,
        photo: "/images/grace.jpg",
        matricNumber: "ACC/20/0091",
      },
      {
        id: "c11",
        name: "Daniel Smith",
        category: "Treasurer",
        voteCount: 198,
        photo: "/images/daniel.jpg",
        matricNumber: "ECO/18/0167",
      },

      // PRO Candidates
      {
        id: "c12",
        name: "Jessica Brown",
        category: "PRO",
        voteCount: 276,
        photo: "/images/jessica.jpg",
        matricNumber: "MCM/19/0088",
      },
      {
        id: "c13",
        name: "Kevin Wilson",
        category: "PRO",
        voteCount: 243,
        photo: "/images/kevin.jpg",
        matricNumber: "JOU/20/0145",
      },

      // D.O Socials Candidates
      {
        id: "c14",
        name: "Fatima Hassan",
        category: "D.O Socials",
        voteCount: 289,
        photo: "/images/fatima.jpg",
        matricNumber: "THE/19/0076",
      },
      {
        id: "c15",
        name: "Mark Davis",
        category: "D.O Socials",
        voteCount: 201,
        photo: "/images/mark.jpg",
        matricNumber: "MUS/18/0134",
      },

      // D.O Welfare Candidates
      {
        id: "c16",
        name: "Blessing Adebayo",
        category: "D.O Welfare",
        voteCount: 256,
        photo: "/images/blessing.jpg",
        matricNumber: "PSY/20/0089",
      },
      {
        id: "c17",
        name: "Anthony Garcia",
        category: "D.O Welfare",
        voteCount: 234,
        photo: "/images/anthony.jpg",
        matricNumber: "SOC/19/0123",
      },
    ],
    voters: [],
    pollingOfficers: ["0x123...", "0x456..."],
    pollingUnits: ["0x789..."],
    description:
      "Annual election for selecting student representatives across departments",
    bannerImage: "/images/student-council.jpg",
    createdBy: "0xadmin1",
    isPublished: true,
    metadata: {},
  },
  {
    id: "2",
    name: "Faculty Representatives Election",
    startTime: new Date("2025-07-10"),
    endTime: new Date("2025-07-20"),
    status: "UPCOMING",
    categories: [
      "Faculty President",
      "Faculty Secretary",
      "Faculty Treasurer",
      "Academic Representative",
    ],
    totalVoters: 542,
    totalVotes: 0,
    candidates: [
      // Faculty President Candidates
      {
        id: "c18",
        name: "Olumide Adeyemi",
        category: "Faculty President",
        voteCount: 0,
        photo: "/images/olumide.jpg",
        matricNumber: "FAC/15/0001",
      },
      {
        id: "c19",
        name: "Jennifer Clarke",
        category: "Faculty President",
        voteCount: 0,
        photo: "/images/jennifer.jpg",
        matricNumber: "FAC/12/0034",
      },

      // Faculty Secretary Candidates
      {
        id: "c20",
        name: "Ibrahim Musa",
        category: "Faculty Secretary",
        voteCount: 0,
        photo: "/images/ibrahim.jpg",
        matricNumber: "FAC/16/0067",
      },
      {
        id: "c21",
        name: "Mary Okoro",
        category: "Faculty Secretary",
        voteCount: 0,
        photo: "/images/mary.jpg",
        matricNumber: "FAC/14/0089",
      },

      // Faculty Treasurer Candidates
      {
        id: "c22",
        name: "Samuel Ogundimu",
        category: "Faculty Treasurer",
        voteCount: 0,
        photo: "/images/samuel.jpg",
        matricNumber: "FAC/17/0045",
      },
      {
        id: "c23",
        name: "Rachel Nwosu",
        category: "Faculty Treasurer",
        voteCount: 0,
        photo: "/images/rachel.jpg",
        matricNumber: "FAC/13/0078",
      },

      // Academic Representative Candidates
      {
        id: "c24",
        name: "Ahmed Bello",
        category: "Academic Representative",
        voteCount: 0,
        photo: "/images/ahmed.jpg",
        matricNumber: "FAC/18/0123",
      },
      {
        id: "c25",
        name: "Catherine Ejike",
        category: "Academic Representative",
        voteCount: 0,
        photo: "/images/catherine.jpg",
        matricNumber: "FAC/15/0156",
      },
    ],
    voters: [],
    pollingOfficers: ["0xjkl..."],
    pollingUnits: ["0xmno..."],
    description:
      "Election for faculty representatives and leadership positions",
    bannerImage: "/images/faculty.jpg",
    createdBy: "0xadmin1",
    isPublished: true,
    metadata: {},
  },
  {
    id: "3",
    name: "Departmental Representatives Election",
    startTime: new Date("2023-04-05"),
    endTime: new Date("2023-04-15"),
    status: "COMPLETED",
    categories: [
      "Department President",
      "Department Secretary",
      "Class Representative",
      "Sports Representative",
    ],
    totalVoters: 189,
    totalVotes: 167,
    candidates: [
      // Department President Candidates
      {
        id: "c26",
        name: "Chioma Okafor",
        category: "Department President",
        voteCount: 89,
        photo: "/images/chioma.jpg",
        matricNumber: "CSC/19/0234",
      },
      {
        id: "c27",
        name: "Tunde Adebisi",
        category: "Department President",
        voteCount: 78,
        photo: "/images/tunde.jpg",
        matricNumber: "CSC/18/0167",
      },

      // Department Secretary Candidates
      {
        id: "c28",
        name: "Kemi Lawal",
        category: "Department Secretary",
        voteCount: 94,
        photo: "/images/kemi.jpg",
        matricNumber: "CSC/20/0089",
      },
      {
        id: "c29",
        name: "Felix Okoye",
        category: "Department Secretary",
        voteCount: 73,
        photo: "/images/felix.jpg",
        matricNumber: "CSC/19/0145",
      },

      // Class Representative Candidates
      {
        id: "c30",
        name: "Amina Yusuf",
        category: "Class Representative",
        voteCount: 87,
        photo: "/images/amina.jpg",
        matricNumber: "CSC/20/0076",
      },
      {
        id: "c31",
        name: "Peter Eze",
        category: "Class Representative",
        voteCount: 80,
        photo: "/images/peter.jpg",
        matricNumber: "CSC/19/0198",
      },

      // Sports Representative Candidates
      {
        id: "c32",
        name: "John Obiora",
        category: "Sports Representative",
        voteCount: 91,
        photo: "/images/john.jpg",
        matricNumber: "CSC/18/0223",
      },
      {
        id: "c33",
        name: "Hauwa Garba",
        category: "Sports Representative",
        voteCount: 76,
        photo: "/images/hauwa.jpg",
        matricNumber: "CSC/20/0134",
      },
    ],
    voters: [],
    pollingOfficers: ["0xvwx...", "0xyz1..."],
    pollingUnits: ["0x234..."],
    description: "Election for departmental representatives and class leaders",
    bannerImage: "/images/department.jpg",
    createdBy: "0xadmin2",
    isPublished: true,
    metadata: {},
  },
  {
    id: "4",
    name: "Students' Union Executive Election",
    startTime: new Date("2025-08-01"),
    endTime: new Date("2025-08-10"),
    status: "UPCOMING",
    categories: [
      "SU President",
      "SU Vice President",
      "SU General Secretary",
      "SU Treasurer",
      "SU PRO",
      "SU Social Director",
      "SU Welfare Director",
    ],
    totalVoters: 2156,
    totalVotes: 0,
    candidates: [
      // SU President Candidates
      {
        id: "c34",
        name: "Adebayo Kunle",
        category: "SU President",
        voteCount: 0,
        photo: "/images/adebayo.jpg",
        matricNumber: "POL/18/0001",
      },
      {
        id: "c35",
        name: "Ngozi Emeka",
        category: "SU President",
        voteCount: 0,
        photo: "/images/ngozi.jpg",
        matricNumber: "LAW/17/0034",
      },
      {
        id: "c36",
        name: "Hassan Mohammed",
        category: "SU President",
        voteCount: 0,
        photo: "/images/hassan.jpg",
        matricNumber: "ENG/18/0067",
      },

      // SU Vice President Candidates
      {
        id: "c37",
        name: "Funmi Adeyinka",
        category: "SU Vice President",
        voteCount: 0,
        photo: "/images/funmi.jpg",
        matricNumber: "MED/19/0089",
      },
      {
        id: "c38",
        name: "Chukwu Emmanuel",
        category: "SU Vice President",
        voteCount: 0,
        photo: "/images/chukwu.jpg",
        matricNumber: "BUS/18/0123",
      },

      // SU General Secretary Candidates
      {
        id: "c39",
        name: "Aisha Ibrahim",
        category: "SU General Secretary",
        voteCount: 0,
        photo: "/images/aisha2.jpg",
        matricNumber: "EDU/19/0156",
      },
      {
        id: "c40",
        name: "Victor Oseh",
        category: "SU General Secretary",
        voteCount: 0,
        photo: "/images/victor.jpg",
        matricNumber: "ENG/20/0078",
      },

      // SU Treasurer Candidates
      {
        id: "c41",
        name: "Mercy Akpan",
        category: "SU Treasurer",
        voteCount: 0,
        photo: "/images/mercy.jpg",
        matricNumber: "ACC/19/0234",
      },
      {
        id: "c42",
        name: "Yakubu Sule",
        category: "SU Treasurer",
        voteCount: 0,
        photo: "/images/yakubu.jpg",
        matricNumber: "ECO/18/0167",
      },

      // SU PRO Candidates
      {
        id: "c43",
        name: "Gloria Nnamdi",
        category: "SU PRO",
        voteCount: 0,
        photo: "/images/gloria.jpg",
        matricNumber: "MCM/20/0091",
      },
      {
        id: "c44",
        name: "Abdullahi Garba",
        category: "SU PRO",
        voteCount: 0,
        photo: "/images/abdullahi.jpg",
        matricNumber: "JOU/19/0145",
      },

      // SU Social Director Candidates
      {
        id: "c45",
        name: "Stella Okwu",
        category: "SU Social Director",
        voteCount: 0,
        photo: "/images/stella.jpg",
        matricNumber: "THE/18/0176",
      },
      {
        id: "c46",
        name: "Ibrahim Baba",
        category: "SU Social Director",
        voteCount: 0,
        photo: "/images/ibrahim2.jpg",
        matricNumber: "MUS/19/0198",
      },

      // SU Welfare Director Candidates
      {
        id: "c47",
        name: "Joy Okoronkwo",
        category: "SU Welfare Director",
        voteCount: 0,
        photo: "/images/joy.jpg",
        matricNumber: "PSY/20/0223",
      },
      {
        id: "c48",
        name: "Musa Danjuma",
        category: "SU Welfare Director",
        voteCount: 0,
        photo: "/images/musa.jpg",
        matricNumber: "SOC/18/0245",
      },
    ],
    voters: [],
    pollingOfficers: ["0xabc...", "0xdef..."],
    pollingUnits: ["0xghi..."],
    description: "University-wide Students' Union Executive election",
    bannerImage: "/images/su-election.jpg",
    createdBy: "0xadmin3",
    isPublished: true,
    metadata: {},
  },
];

export default mockElections;

export async function fetchElectionById(
  electionId: string,
): Promise<Election | null> {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Find election by ID
    const election = mockElections.find((e) => e.id === electionId);

    if (!election) {
      return null;
    }

    return election;
  } catch (error) {
    console.error("Error fetching election:", error);
    throw new Error("Failed to fetch election data");
  }
}
