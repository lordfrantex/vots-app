// constants/election-testimonials.ts

export interface ElectionTestimonialProps {
  id: number;
  name: string;
  role: string;
  institution: string;
  avatar: string;
  content: string;
  rating: number;
  username?: string; // Optional for marquee display
}

export const electionTestimonials: ElectionTestimonialProps[] = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    role: "Dean of Student Affairs",
    institution: "Stanford University",
    avatar: "/placeholder.svg?height=60&width=60",
    content:
      "Votes has revolutionized our student elections. The transparency and security it provides has increased student participation by 40%.",
    rating: 5,
    username: "@sarah_stanford",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Student Body President",
    institution: "MIT",
    avatar: "/placeholder.svg?height=60&width=60",
    content:
      "As someone who's experienced traditional voting systems, the difference is night and day. Students trust the process completely now.",
    rating: 5,
    username: "@mike_mit",
  },
  {
    id: 3,
    name: "Prof. Emily Rodriguez",
    role: "Computer Science Department",
    institution: "UC Berkeley",
    avatar: "/placeholder.svg?height=60&width=60",
    content:
      "The smart contract implementation is flawless. We've audited the code and can confidently say it's the most secure voting system we've seen.",
    rating: 5,
    username: "@emily_ucb",
  },
  {
    id: 4,
    name: "David Thompson",
    role: "Elections Committee Chair",
    institution: "Harvard University",
    avatar: "/placeholder.svg?height=60&width=60",
    content:
      "The real-time results and audit trail features have made our elections more transparent than ever before. Students can verify their votes instantly.",
    rating: 5,
    username: "@david_harvard",
  },
  {
    id: 5,
    name: "Lisa Wang",
    role: "Student Government VP",
    institution: "Yale University",
    avatar: "/placeholder.svg?height=60&width=60",
    content:
      "Mobile voting has been a game-changer for student engagement. We saw a 60% increase in voter turnout in our last election.",
    rating: 5,
    username: "@lisa_yale",
  },
  {
    id: 6,
    name: "Dr. James Mitchell",
    role: "IT Security Director",
    institution: "Princeton University",
    avatar: "/placeholder.svg?height=60&width=60",
    content:
      "The blockchain-based verification system provides an unprecedented level of security and transparency for our democratic processes.",
    rating: 5,
    username: "@james_princeton",
  },
  {
    id: 7,
    name: "Rebecca Torres",
    role: "Student Council President",
    institution: "Columbia University",
    avatar: "/placeholder.svg?height=60&width=60",
    content:
      "The user interface is incredibly intuitive. Even first-time voters can navigate the system without any confusion or assistance.",
    rating: 5,
    username: "@rebecca_columbia",
  },
  {
    id: 8,
    name: "Prof. Alan Foster",
    role: "Political Science Department",
    institution: "University of Pennsylvania",
    avatar: "/placeholder.svg?height=60&width=60",
    content:
      "This platform has restored faith in our electoral process. The combination of security, transparency, and accessibility is remarkable.",
    rating: 5,
    username: "@alan_upenn",
  },
  {
    id: 9,
    name: "Maria Gonzalez",
    role: "Graduate Student Rep",
    institution: "Cornell University",
    avatar: "/placeholder.svg?height=60&width=60",
    content:
      "The anonymous voting feature while maintaining verifiability is brilliant. Students feel safe expressing their true preferences.",
    rating: 5,
    username: "@maria_cornell",
  },
  {
    id: 10,
    name: "Dr. Robert Kim",
    role: "Vice Provost",
    institution: "Brown University",
    avatar: "/placeholder.svg?height=60&width=60",
    content:
      "Implementation was seamless and the support team was exceptional. Our election ran without a single technical issue.",
    rating: 5,
    username: "@robert_brown",
  },
  {
    id: 11,
    name: "Jennifer Lee",
    role: "Student Activities Director",
    institution: "Dartmouth College",
    avatar: "/placeholder.svg?height=60&width=60",
    content:
      "The analytics dashboard provides incredible insights into voting patterns and helps us improve our democratic processes.",
    rating: 5,
    username: "@jennifer_dartmouth",
  },
  {
    id: 12,
    name: "Marcus Johnson",
    role: "IT Coordinator",
    institution: "University of Chicago",
    avatar: "/placeholder.svg?height=60&width=60",
    content:
      "The system's scalability is impressive. We went from 500 to 5000 voters without any performance issues.",
    rating: 5,
    username: "@marcus_uchicago",
  },
];

// Split testimonials into two rows for marquee
export const firstRowTestimonials = electionTestimonials.slice(
  0,
  Math.ceil(electionTestimonials.length / 2),
);
export const secondRowTestimonials = electionTestimonials.slice(
  Math.ceil(electionTestimonials.length / 2),
);
