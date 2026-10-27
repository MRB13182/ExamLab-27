export interface SubjectInfo {
  id: string;
  name: string;
  nameEn: string;
  papers: string[];
  chapters: Record<string, string[]>;
  questionPattern: string;
}

/**
 * HSC 2027 preparation map, initially transcribed from the student-provided list.
 * Verify final chapter inclusion and official marks distribution against the current NCTB/college syllabus.
 * The generator uses questionPattern to avoid applying the science CQ structure to every subject.
 */
export const HSC_SUBJECTS: SubjectInfo[] = [
  {
    id: "physics",
    name: "পদার্থবিজ্ঞান",
    nameEn: "Physics",
    papers: ["১ম পত্র", "২য় পত্র"],
    questionPattern: "Science subject. Use HSC physics conventions: conceptual MCQ, numerical MCQ, formula-based problems, units and dimensions, diagrams or graphs where relevant. Each CQ should normally have a short stimulus and the four subparts ক knowledge (1), খ understanding (2), গ application/calculation (3), ঘ higher-order analysis (4), total 10 marks. Show equations and units clearly. Treat practical marks separately from this chapter practice test.",
    chapters: {
      "১ম পত্র": [
        "ভৌতজগৎ ও পরিমাপ", "ভেক্টর", "গতিবিদ্যা", "নিউটনীয় বলবিদ্যা",
        "কাজ, শক্তি ও ক্ষমতা", "মহাকর্ষ ও অভিকর্ষ", "পদার্থের গাঠনিক ধর্ম",
        "পর্যাবৃত্ত গতি", "তরঙ্গ", "আদর্শ গ্যাস ও গ্যাসের গতিতত্ত্ব"
      ],
      "২য় পত্র": [
        "তাপগতিবিদ্যা", "স্থির তড়িৎ", "চল তড়িৎ",
        "তড়িৎ প্রবাহের চৌম্বক ক্রিয়া ও চুম্বকত্ব",
        "তড়িৎচৌম্বকীয় আবেশ ও পরিবর্তী প্রবাহ", "জ্যামিতিক আলোকবিজ্ঞান",
        "ভৌত আলোকবিজ্ঞান", "আধুনিক পদার্থবিজ্ঞানের সূচনা",
        "পরমাণুর মডেল ও নিউক্লিয়ার পদার্থবিজ্ঞান", "সেমিকন্ডাক্টর ও ইলেকট্রনিক্স",
        "জ্যোতির্বিজ্ঞান"
      ]
    }
  },
  {
    id: "chemistry",
    name: "রসায়ন",
    nameEn: "Chemistry",
    papers: ["১ম পত্র", "২য় পত্র"],
    questionPattern: "Science chemistry style. MCQ should test concepts, equations, periodic trends, reaction conditions, calculations and safe lab practices as relevant. CQ follows the common science four-subpart structure (ক 1, খ 2, গ 3, ঘ 4; total 10) with balanced theory, reaction equations and calculations. Use correct chemical symbols, charges, states and units. Do not fabricate experimental results.",
    chapters: {
      "১ম পত্র": [
        "ল্যাবরেটরির নিরাপদ ব্যবহার", "গুণগত রসায়ন",
        "মৌলের পর্যায়বৃত্তিক ধর্ম ও রাসায়নিক বন্ধন",
        "রাসায়নিক পরিবর্তন", "কর্মমুখী রসায়ন"
      ],
      "২য় পত্র": [
        "পরিবেশ রসায়ন", "জৈব রসায়ন", "পরিমাণগত রসায়ন",
        "তড়িৎ রসায়ন", "অর্থনৈতিক রসায়ন"
      ]
    }
  },
  {
    id: "biology",
    name: "জীববিজ্ঞান",
    nameEn: "Biology",
    papers: ["১ম পত্র", "২য় পত্র"],
    questionPattern: "Science biology style. Build MCQs from accurate terminology, structures, functions, comparisons, processes and diagrams where relevant. Each CQ normally has stimulus plus ক (1 mark), খ (2), গ (3), ঘ (4) for 10 total. Require explanations tied to the stimulus, not unsupported memorisation alone. Never invent facts. Practical activities are separate unless explicitly requested.",
    chapters: {
      "১ম পত্র": [
        "কোষ ও এর গঠন", "কোষ বিভাজন", "কোষ রসায়ন", "অণুজীব", "শৈবাল ও ছত্রাক",
        "ব্রায়োফাইটা ও টেরিডোফাইটা", "নগ্নবীজী ও আবৃতবীজী উদ্ভিদ",
        "টিস্যু ও টিস্যুতন্ত্র", "উদ্ভিদ শারীরতত্ত্ব", "উদ্ভিদ প্রজনন",
        "জীবপ্রযুক্তি", "জীবের পরিবেশ, বিস্তার ও সংরক্ষণ"
      ],
      "২য় পত্র": [
        "প্রাণীর বিভিন্নতা ও শ্রেণিবিন্যাস", "প্রাণীর পরিচিতি", "পরিপাক ও শোষণ",
        "রক্ত ও সংবহন", "শ্বসন ও শ্বাসক্রিয়া", "বর্জ্য ও নিষ্কাশন",
        "চলন ও অঙ্গচালনা", "সমন্বয় ও নিয়ন্ত্রণ", "মানব জীবনের ধারাবাহিকতা",
        "মানবদেহের প্রতিরক্ষা", "জিনতত্ত্ব ও বিবর্তন", "প্রাণীর আচরণ"
      ]
    }
  },
  {
    id: "higher_math",
    name: "উচ্চতর গণিত",
    nameEn: "Higher Mathematics",
    papers: ["১ম পত্র", "২য় পত্র"],
    questionPattern: "HSC higher mathematics style. MCQs may include symbolic reasoning, identities, algebra and concise calculations. CQs should be multi-step mathematical problems with parts ক (1), খ (2), গ (3), ঘ (4) where suitable. Show the exact expression, required derivation, intermediate steps, units if applicable, and final result. Do not force a prose stimulus if a mathematical setup is more authentic. Verify all arithmetic and algebra.",
    chapters: {
      "১ম পত্র": [
        "ম্যাট্রিক্স ও নির্ণায়ক", "ভেক্টর", "সরলরেখা", "বৃত্ত",
        "বিন্যাস ও সমাবেশ", "ত্রিকোণমিতিক অনুপাত",
        "সংযুক্ত কোণের ত্রিকোণমিতিক অনুপাত", "ফাংশন ও ফাংশনের লেখচিত্র",
        "অন্তরীকরণ", "যোগজীকরণ"
      ],
      "২য় পত্র": [
        "বাস্তব সংখ্যা ও অসমতা", "যোগাশ্রয়ী প্রোগ্রাম", "জটিল সংখ্যা",
        "বহুপদী ও বহুপদী সমীকরণ", "দ্বিপদী বিস্তৃতি", "কণিক",
        "বিপরীত ত্রিকোণমিতিক ফাংশন", "স্থিতিবিদ্যা",
        "সমতলে বস্তুকণার গতি", "বিস্তার পরিমাপ ও সম্ভাবনা"
      ]
    }
  },
  {
    id: "ict",
    name: "তথ্য ও যোগাযোগ প্রযুক্তি",
    nameEn: "ICT",
    papers: ["আবশ্যিক"],
    questionPattern: "Bangladesh HSC ICT style. MCQs should include factual concepts, binary/octal/decimal/hexadecimal conversions, logic gates and truth tables, networking, HTML, C programming and DBMS/SQL as relevant. CQs should use a practical scenario or stimulus with four subparts ক (1), খ (2), গ (3), ঘ (4), total 10; match the chosen chapter and use code, tables, truth tables, HTML snippets or SQL queries only when relevant.",
    chapters: {
      "আবশ্যিক": [
        "তথ্য ও যোগাযোগ প্রযুক্তি: বিশ্ব ও বাংলাদেশ প্রেক্ষিত",
        "কমিউনিকেশন সিস্টেমস ও নেটওয়ার্কিং",
        "সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস",
        "ওয়েব ডিজাইন পরিচিতি এবং HTML",
        "প্রোগ্রামিং ভাষা (C Programming)",
        "ডেটাবেজ ম্যানেজমেন্ট সিস্টেম"
      ]
    }
  },
  {
    id: "bangla1",
    name: "বাংলা ১ম পত্র",
    nameEn: "Bangla 1st Paper",
    papers: ["পাঠ্য গদ্য", "পাঠ্য কবিতা", "সহপাঠ"],
    questionPattern: "Bangla 1st paper literature style. Generate text-centred MCQs from the selected story/poem/drama/novel and original stimulus-based creative questions that test comprehension, theme, character, language and literary interpretation. Do not impose maths/science CQ subparts when the chosen board-style format differs; use a clear 10-mark creative literature question with ক/খ/গ/ঘ subparts only when appropriate. Include author/poet context accurately. Do not reproduce long copyrighted passages; use a brief original stimulus or paraphrase.",
    chapters: {
      "পাঠ্য গদ্য": [
        "বাঙ্গালার নব্য লেখকদিগের প্রতি নিবেদন — বঙ্কিমচন্দ্র চট্টোপাধ্যায়",
        "অপরিচিতা — রবীন্দ্রনাথ ঠাকুর", "সাহিত্যে খেলা — প্রমথ চৌধুরী",
        "বিলাসী — শরৎচন্দ্র চট্টোপাধ্যায়", "অর্ধাঙ্গী — বেগম রোকেয়া সাখাওয়াত হোসেন",
        "যৌবনের গান — কাজী নজরুল ইসলাম", "জীবন ও বৃক্ষ — মোতাহের হোসেন চৌধুরী",
        "গন্তব্য কাবুল — সৈয়দ মুজতবা আলী", "মাসি-পিসি — মানিক বন্দ্যোপাধ্যায়",
        "কপিলদাস মুর্মুর শেষ কাজ — শওকত আলী", "নেকলেস — গী দ্য মোপাসাঁ",
        "রেইনকোট — আখতারুজ্জামান ইলিয়াস"
      ],
      "পাঠ্য কবিতা": [
        "ঋতু-বর্ণন — আলাওল", "বিভীষণের প্রতি মেঘনাদ — মাইকেল মধুসূদন দত্ত",
        "সোনার তরী — রবীন্দ্রনাথ ঠাকুর", "বিদ্রোহী — কাজী নজরুল ইসলাম",
        "সুচেতনা — জীবনানন্দ দাশ", "প্রতিদান — জসীমউদ্দীন",
        "তাহারেই পড়ে মনে — সুফিয়া কামাল", "পদ্মা — ফররুখ আহমদ",
        "ফেব্রুয়ারি ১৯৬৯ — শামসুর রাহমান", "আঠারো বছর বয়স — সুকান্ত ভট্টাচার্য",
        "আমি কিংবদন্তির কথা বলছি — আবু জাফর ওবায়দুল্লাহ",
        "প্রত্যাবর্তনের লজ্জা — আল মাহমুদ"
      ],
      "সহপাঠ": [
        "উপন্যাস: লালসালু — সৈয়দ ওয়ালীউল্লাহ",
        "নাটক: সিরাজউদ্দৌলা — সিকান্দার আবু জাফর"
      ]
    }
  },
  {
    id: "bangla2",
    name: "বাংলা ২য় পত্র",
    nameEn: "Bangla 2nd Paper",
    papers: ["ব্যাকরণ", "নির্মিতি"],
    questionPattern: "Bangla 2nd paper pattern, not science CQ. For MCQ focus on grammar rules, pronunciation, spelling, word classes, word formation, sentence structure, punctuation and correct usage. For CQ/written practice create the requested grammar transformations or writing task (summary, expansion, report, letter/application, dialogue/story if in the supplied syllabus, essay) with task-specific marking rubric rather than automatic ক/খ/গ/ঘ science subparts.",
    chapters: {
      "ব্যাকরণ": [
        "বাংলা উচ্চারণের নিয়ম", "বাংলা বানানের নিয়ম", "ব্যাকরণিক শব্দশ্রেণি",
        "শব্দ গঠন", "বাক্যতত্ত্ব", "শুদ্ধ ও অশুদ্ধ প্রয়োগ", "বিরামচিহ্নের ব্যবহার"
      ],
      "নির্মিতি": [
        "পারিভাষিক শব্দ", "সারাংশ ও সারমর্ম", "ভাবসম্প্রসারণ",
        "প্রতিবেদন রচনা", "আবেদনপত্র ও চিঠি", "ক্ষুদে গল্প/সংলাপ",
        "প্রবন্ধ রচনা"
      ]
    }
  },
  {
    id: "english1",
    name: "English 1st Paper",
    nameEn: "English 1st Paper",
    papers: ["Reading", "Writing", "Units / Topics"],
    questionPattern: "HSC English 1st Paper. Use English for the question text. Reading practice may include MCQ, comprehension, information transfer/flow chart, summary, cloze with or without clues and sentence rearrangement. Written practice may include paragraph, completing a story, informal letter/email, graph/chart analysis and appreciation of a short story/poem. Follow the selected task type; do not force Bengali science CQ format. Create a task-specific rubric and model response.",
    chapters: {
      "Reading": [
        "Multiple Choice Questions (MCQ)", "Comprehension Questions",
        "Information Transfer / Flow Chart", "Summary Writing",
        "Cloze Test with Clues", "Cloze Test without Clues", "Rearranging Sentences"
      ],
      "Writing": [
        "Paragraph Writing", "Completing a Story", "Informal Letter / E-mail",
        "Graph / Chart Analysis", "Appreciating Short Stories / Poems"
      ],
      "Units / Topics": [
        "Unit 1: People or Institutions Making History", "Unit 2: Dreams",
        "Unit 3: Traffic Education", "Unit 4: Youthful Encounters",
        "Unit 5: Adolescence", "Unit 6: Relationships", "Unit 7: Environment and Nature"
      ]
    }
  },
  {
    id: "english2",
    name: "English 2nd Paper",
    nameEn: "English 2nd Paper",
    papers: ["Grammar", "Composition"],
    questionPattern: "HSC English 2nd Paper. Use English throughout. MCQs should practise grammar only if requested and should be suitable for articles, prepositions, phrase use, verb forms, transformation, completing sentences, narration, pronoun reference, modifiers, connectors, synonyms/antonyms and punctuation. Written practice should focus on formal letter/email, report, paragraph and essay/composition. Evaluate with explicit task-specific criteria and sample answer, not Bengali science CQ subparts.",
    chapters: {
      "Grammar": [
        "Articles", "Prepositions", "Special Uses of Words and Phrases",
        "Right Forms of Verbs", "Transformation of Sentences", "Completing Sentences",
        "Narration", "Pronoun Reference", "Modifiers", "Sentence Connectors",
        "Synonyms and Antonyms", "Punctuation"
      ],
      "Composition": [
        "Formal Letter / E-mail", "Report Writing", "Paragraph Writing",
        "Essay / Composition"
      ]
    }
  }
];
