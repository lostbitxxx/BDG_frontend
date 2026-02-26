/**
 * PSC Question Bank - Sample Questions
 * Putonghua Shuiping Ceshi (普通话水平测试)
 */

export interface Question {
  id: string;
  section: 1 | 2 | 3 | 4 | 5;
  type: 'reading' | 'listening' | 'choice' | 'speaking';
  content: string;
  pinyin?: string;
  audioUrl?: string;
  options?: string[];
  correctAnswer?: string;
}

// Section 1: Single character reading (100 words) - 10%
export const section1Questions: Question[] = [
  { id: 's1-1', section: 1, type: 'reading', content: '八', pinyin: 'bā' },
  { id: 's1-2', section: 1, type: 'reading', content: '七', pinyin: 'qī' },
  { id: 's1-3', section: 1, type: 'reading', content: '六', pinyin: 'liù' },
  { id: 's1-4', section: 1, type: 'reading', content: '五', pinyin: 'wǔ' },
  { id: 's1-5', section: 1, type: 'reading', content: '四', pinyin: 'sì' },
  { id: 's1-6', section: 1, type: 'reading', content: '三', pinyin: 'sān' },
  { id: 's1-7', section: 1, type: 'reading', content: '二', pinyin: 'èr' },
  { id: 's1-8', section: 1, type: 'reading', content: '一', pinyin: 'yī' },
  { id: 's1-9', section: 1, type: 'reading', content: '九', pinyin: 'jiǔ' },
  { id: 's1-10', section: 1, type: 'reading', content: '十', pinyin: 'shí' },
];

// Section 2: Polysyllabic words (100 words) - 20%
export const section2Questions: Question[] = [
  { id: 's2-1', section: 2, type: 'reading', content: '春天', pinyin: 'chūntiān' },
  { id: 's2-2', section: 2, type: 'reading', content: '夏天', pinyin: 'xiàtiān' },
  { id: 's2-3', section: 2, type: 'reading', content: '秋天', pinyin: 'qiūtiān' },
  { id: 's2-4', section: 2, type: 'reading', content: '冬天', pinyin: 'dōngtiān' },
  { id: 's2-5', section: 2, type: 'reading', content: '中国', pinyin: 'zhōngguó' },
  { id: 's2-6', section: 2, type: 'reading', content: '学习', pinyin: 'xuéxí' },
  { id: 's2-7', section: 2, type: 'reading', content: '朋友', pinyin: 'péngyou' },
  { id: 's2-8', section: 2, type: 'reading', content: '老师', pinyin: 'lǎoshī' },
  { id: 's2-9', section: 2, type: 'reading', content: '学生', pinyin: 'xuéshēng' },
  { id: 's2-10', section: 2, type: 'reading', content: '工作', pinyin: 'gōngzuò' },
];

// Section 3: Vocabulary/Grammar choices - 10%
export const section3Questions: Question[] = [
  { 
    id: 's3-1', 
    section: 3, 
    type: 'choice', 
    content: '请问，去图书馆怎么走？',
    options: ['A. 往前走', 'B. 往左拐', 'C. 往右拐', 'D. 往回走'],
    correctAnswer: 'A'
  },
  { 
    id: 's3-2', 
    section: 3, 
    type: 'choice', 
    content: '今天天气真好，_______去公园玩吧！',
    options: ['A. 咱们', 'B. 她们', 'C. 它们', 'D. 别人'],
    correctAnswer: 'A'
  },
  { 
    id: 's3-3', 
    section: 3, 
    type: 'choice', 
    content: '这道题太难了，_______都做不出来。',
    options: ['A. 谁', 'B. 没人', 'C. 别人', 'D. 大家'],
    correctAnswer: 'B'
  },
];

// Section 4: Reading passage (400 characters) - 30%
export const section4Questions: Question[] = [
  {
    id: 's4-1',
    section: 4,
    type: 'reading',
    content: '春天来了，花儿开了，鸟儿在树枝上唱歌。',
    pinyin: 'chūn tiān lái le, huā ér kāi le, niǎo er zài shù zhī shàng chàng gē.'
  },
  {
    id: 's4-2',
    section: 4,
    type: 'reading',
    content: '今天天气很好，阳光明媚，适合出去游玩。',
    pinyin: 'jīn tiān tiān qì hěn hǎo, yáng guāng míng mèi, shì hé chū qù yóu wán.'
  },
  {
    id: 's4-3',
    section: 4,
    type: 'reading',
    content: '我爱我的祖国，我要努力学习，为国家做贡献。',
    pinyin: 'wǒ ài wǒ de zǔ guó, wǒ yào nǔ lì xué xí, wèi guó jiā zuò gòng xiàn.'
  },
  {
    id: 's4-4',
    section: 4,
    type: 'reading',
    content: '学习普通话很重要，特别是对于 Cantonese speakers。',
    pinyin: 'xué xí pǔ tōng huà hěn zhòng yào, tè bié shì duì yú Guǎngdōng huà shuō zhě.'
  },
];

// Section 5: Speaking (3 minutes) - 30%
export const section5Questions: Question[] = [
  {
    id: 's5-1',
    section: 5,
    type: 'speaking',
    content: '介绍你的家庭'
  },
  {
    id: 's5-2',
    section: 5,
    type: 'speaking',
    content: '你的爱好是什么？'
  },
  {
    id: 's5-3',
    section: 5,
    type: 'speaking',
    content: '描述你的一天'
  },
  {
    id: 's5-4',
    section: 5,
    type: 'speaking',
    content: '你最喜欢的季节'
  },
  {
    id: 's5-5',
    section: 5,
    type: 'speaking',
    content: '介绍你的学校或工作'
  },
];

// Get all questions for a specific section
export function getQuestionsBySection(section: 1 | 2 | 3 | 4 | 5): Question[] {
  switch (section) {
    case 1: return section1Questions;
    case 2: return section2Questions;
    case 3: return section3Questions;
    case 4: return section4Questions;
    case 5: return section5Questions;
    default: return [];
  }
}

// Get random questions for practice
export function getRandomQuestions(count: number = 5): Question[] {
  const allQuestions = [
    ...section1Questions,
    ...section2Questions,
    ...section3Questions,
    ...section4Questions,
  ];
  
  const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Get a sample test (mimics actual PSC test)
export function getSampleTest(): Question[] {
  // 10 questions from section 1
  const s1 = section1Questions.slice(0, 10);
  // 10 questions from section 2
  const s2 = section2Questions.slice(0, 10);
  // 5 questions from section 3
  const s3 = section3Questions.slice(0, 5);
  // 1 passage from section 4
  const s4 = [section4Questions[0]];
  
  return [...s1, ...s2, ...s3, ...s4];
}
