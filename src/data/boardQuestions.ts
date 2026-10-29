export interface BoardQuestionSet {
  id: string;
  board: string;
  year: number;
  subject: string;
  paper: string;
  type: "MCQ" | "CQ" | "Both";
  totalMarks: number;
  durationMinutes: number;
  topicsCovered: string[];
  description: string;
}

export const HSC_BOARD_QUESTIONS: BoardQuestionSet[] = [
  {
    id: "dhaka-2024-phy-1",
    board: "ঢাকা বোর্ড",
    year: 2024,
    subject: "পদার্থবিজ্ঞান",
    paper: "১ম পত্র",
    type: "Both",
    totalMarks: 75,
    durationMinutes: 150,
    topicsCovered: ["ভেক্টর", "গতিবিদ্যা", "নিউটনীয় বলবিদ্যা", "কাজ, শক্তি ও ক্ষমতা", "মহাকর্ষ ও অভিকর্ষ"],
    description: "ঢাকা বোর্ড ২০২৪ এর পূর্ণাঙ্গ বোর্ড স্ট্যান্ডার্ড প্রশ্নপত্র।"
  },
  {
    id: "rajshahi-2024-chem-1",
    board: "রাজশাহী বোর্ড",
    year: 2024,
    subject: "রসায়ন",
    paper: "১ম পত্র",
    type: "Both",
    totalMarks: 75,
    durationMinutes: 150,
    topicsCovered: ["গুণগত রসায়ন", "মৌলের পর্যায়বৃত্তিক ধর্ম ও রাসায়নিক বন্ধন", "রাসায়নিক পরিবর্তন"],
    description: "রাজশাহী বোর্ড ২০২৪ এর গুরুত্বপূর্ণ গাণিতিক ও সৃজনশীল সমন্বয়।"
  },
  {
    id: "chattogram-2024-math-1",
    board: "চট্টগ্রাম বোর্ড",
    year: 2024,
    subject: "উচ্চতর গণিত",
    paper: "১ম পত্র",
    type: "Both",
    totalMarks: 75,
    durationMinutes: 150,
    topicsCovered: ["ম্যাট্রিক্স ও নির্ণায়ক", "সরলরেখা", "বৃত্ত", "ত্রিকোণমিতি", "অন্তরীকরণ ও যোগজীকরণ"],
    description: "চট্টগ্রাম বোর্ড ২০২৪ ক্যালকুলাস ও জ্যামিতি অংশ প্রাধান্য।"
  },
  {
    id: "dhaka-2024-bio-1",
    board: "ঢাকা বোর্ড",
    year: 2024,
    subject: "জীববিজ্ঞান",
    paper: "১ম পত্র",
    type: "Both",
    totalMarks: 75,
    durationMinutes: 150,
    topicsCovered: ["কোষ ও এর গঠন", "কোষ বিভাজন", "উদ্ভিদ শারীরতত্ত্ব", "জীবপ্রযুক্তি"],
    description: "ঢাকা বোর্ড ২০২৪ এর চিত্রভিত্তিক বিশ্লেষণধর্মী সৃজনশীল।"
  },
  {
    id: "all-2024-ict",
    board: "সকল বোর্ড সমন্বিত",
    year: 2024,
    subject: "তথ্য ও যোগাযোগ প্রযুক্তি",
    paper: "আবশ্যিক",
    type: "Both",
    totalMarks: 75,
    durationMinutes: 150,
    topicsCovered: ["সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস", "ওয়েব ডিজাইন ও HTML", "C প্রোগ্রামিং", "DBMS"],
    description: "২০২৪ সালের বোর্ড পরীক্ষার সর্বাধিক রিপিটেড কনসেপ্ট সমৃদ্ধ প্রশ্নপত্র।"
  },
  {
    id: "dhaka-2023-phy-2",
    board: "ঢাকা বোর্ড",
    year: 2023,
    subject: "পদার্থবিজ্ঞান",
    paper: "২য় পত্র",
    type: "Both",
    totalMarks: 75,
    durationMinutes: 150,
    topicsCovered: ["তাপগতিবিদ্যা", "স্থির তড়িৎ", "চল তড়িৎ", "ভৌত আলোকবিজ্ঞান", "আধুনিক পদার্থবিজ্ঞান"],
    description: "ঢাকা বোর্ড ২০২৩ এর তড়িৎ ও আধুনিক পদার্থবিজ্ঞান ভিত্তিক প্রশ্ন।"
  },
  {
    id: "cumilla-2024-chem-2",
    board: "কুমিল্লা বোর্ড",
    year: 2024,
    subject: "রসায়ন",
    paper: "২য় পত্র",
    type: "Both",
    totalMarks: 75,
    durationMinutes: 150,
    topicsCovered: ["পরিবেশ রসায়ন", "জৈব রসায়ন", "পরিমাণগত রসায়ন", "তড়িৎ রসায়ন"],
    description: "কুমিল্লা বোর্ড ২০২৪ জৈব বিক্রিয়া ও পরিমাণগত বিশ্লেষণ।"
  },
  {
    id: "jashore-2024-math-2",
    board: "যশোর বোর্ড",
    year: 2024,
    subject: "উচ্চতর গণিত",
    paper: "২য় পত্র",
    type: "Both",
    totalMarks: 75,
    durationMinutes: 150,
    topicsCovered: ["জটিল সংখ্যা", "বহুপদী", "কণিক", "স্থিতিবিদ্যা", "গতিবিদ্যা"],
    description: "যশোর বোর্ড ২০২৪ মেকানিক্স ও বীজগণিতীয় সমস্যা সমাধান।"
  }
];
