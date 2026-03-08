/**
 * PSC Question Bank - Sample Questions
 * Putonghua Shuiping Ceshi (普通话水平测试)
 *
 * Official PSC Structure:
 * - Section 1: 讀單音節字詞 (100 chars, 3.5 min, 10 pts)
 * - Section 2: 讀多音節詞語 (50 words, 2.5 min, 20 pts)
 * - Section 3: 選擇判斷 (25 questions, 3 min, 10 pts)
 *   - 10 詞語判斷 (vocabulary contrast)
 *   - 10 量詞搭配 (classifier matching)
 *   - 5 語法判斷 (grammar judgment)
 * - Section 4: 朗讀短文 (400 chars, 4 min, 30 pts)
 * - Section 5: 命題說話 (3 min, 30 pts)
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
  // Section 3 specific fields
  subType?: 'vocab' | 'classifier' | 'grammar';
  correctMandarin?: string;
  cantoneseOption?: string;
}

// Section 1: Single character reading (100 words) - 10%
// Focus: tones, retroflex (zh/ch/sh), nasal (n/l)
export const section1Questions: Question[] = [
  // Numbers
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
  // Retroflex initials (difficult for Cantonese speakers)
  { id: 's1-11', section: 1, type: 'reading', content: '中', pinyin: 'zhōng' },
  { id: 's1-12', section: 1, type: 'reading', content: '是', pinyin: 'shì' },
  { id: 's1-13', section: 1, type: 'reading', content: '时', pinyin: 'shí' },
  { id: 's1-14', section: 1, type: 'reading', content: '事', pinyin: 'shì' },
  { id: 's1-15', section: 1, type: 'reading', content: '出', pinyin: 'chū' },
  { id: 's1-16', section: 1, type: 'reading', content: '吃', pinyin: 'chī' },
  { id: 's1-17', section: 1, type: 'reading', content: '车', pinyin: 'chē' },
  { id: 's1-18', section: 1, type: 'reading', content: '书', pinyin: 'shū' },
  { id: 's1-19', section: 1, type: 'reading', content: '树', pinyin: 'shù' },
  { id: 's1-20', section: 1, type: 'reading', content: '知', pinyin: 'zhī' },
  // n vs l (common for Cantonese)
  { id: 's1-21', section: 1, type: 'reading', content: '南', pinyin: 'nán' },
  { id: 's1-22', section: 1, type: 'reading', content: '兰', pinyin: 'lán' },
  { id: 's1-23', section: 1, type: 'reading', content: '年', pinyin: 'nián' },
  { id: 's1-24', section: 1, type: 'reading', content: '连', pinyin: 'lián' },
  { id: 's1-25', section: 1, type: 'reading', content: '女', pinyin: 'nǚ' },
  { id: 's1-26', section: 1, type: 'reading', content: '绿', pinyin: 'lǜ' },
  { id: 's1-27', section: 1, type: 'reading', content: '怒', pinyin: 'nù' },
  { id: 's1-28', section: 1, type: 'reading', content: '路', pinyin: 'lù' },
  { id: 's1-29', section: 1, type: 'reading', content: '脑', pinyin: 'nǎo' },
  { id: 's1-30', section: 1, type: 'reading', content: '老', pinyin: 'lǎo' },
  // Common pronouns & basics
  { id: 's1-31', section: 1, type: 'reading', content: '我', pinyin: 'wǒ' },
  { id: 's1-32', section: 1, type: 'reading', content: '你', pinyin: 'nǐ' },
  { id: 's1-33', section: 1, type: 'reading', content: '他', pinyin: 'tā' },
  { id: 's1-34', section: 1, type: 'reading', content: '她', pinyin: 'tā' },
  { id: 's1-35', section: 1, type: 'reading', content: '它', pinyin: 'tā' },
  { id: 's1-36', section: 1, type: 'reading', content: '人', pinyin: 'rén' },
  { id: 's1-37', section: 1, type: 'reading', content: '大', pinyin: 'dà' },
  { id: 's1-38', section: 1, type: 'reading', content: '小', pinyin: 'xiǎo' },
  { id: 's1-39', section: 1, type: 'reading', content: '好', pinyin: 'hǎo' },
  { id: 's1-40', section: 1, type: 'reading', content: '看', pinyin: 'kàn' },
  // More retroflex
  { id: 's1-41', section: 1, type: 'reading', content: '找', pinyin: 'zhǎo' },
  { id: 's1-42', section: 1, type: 'reading', content: '照', pinyin: 'zhào' },
  { id: 's1-43', section: 1, type: 'reading', content: '住', pinyin: 'zhù' },
  { id: 's1-44', section: 1, type: 'reading', content: '主', pinyin: 'zhǔ' },
  { id: 's1-45', section: 1, type: 'reading', content: '做', pinyin: 'zuò' },
  { id: 's1-46', section: 1, type: 'reading', content: '坐', pinyin: 'zuò' },
  { id: 's1-47', section: 1, type: 'reading', content: '左', pinyin: 'zuǒ' },
  { id: 's1-48', section: 1, type: 'reading', content: '座', pinyin: 'zuò' },
  { id: 's1-49', section: 1, type: 'reading', content: '再', pinyin: 'zài' },
  { id: 's1-50', section: 1, type: 'reading', content: '在', pinyin: 'zài' },
  // Common verbs
  { id: 's1-51', section: 1, type: 'reading', content: '来', pinyin: 'lái' },
  { id: 's1-52', section: 1, type: 'reading', content: '去', pinyin: 'qù' },
  { id: 's1-53', section: 1, type: 'reading', content: '有', pinyin: 'yǒu' },
  { id: 's1-54', section: 1, type: 'reading', content: '没', pinyin: 'méi' },
  { id: 's1-55', section: 1, type: 'reading', content: '这', pinyin: 'zhè' },
  { id: 's1-56', section: 1, type: 'reading', content: '那', pinyin: 'nà' },
  { id: 's1-57', section: 1, type: 'reading', content: '哪', pinyin: 'nǎ' },
  { id: 's1-58', section: 1, type: 'reading', content: '谁', pinyin: 'shéi' },
  { id: 's1-59', section: 1, type: 'reading', content: '什', pinyin: 'shén' },
  { id: 's1-60', section: 1, type: 'reading', content: '么', pinyin: 'me' },
  // Structural words
  { id: 's1-61', section: 1, type: 'reading', content: '的', pinyin: 'de' },
  { id: 's1-62', section: 1, type: 'reading', content: '得', pinyin: 'de' },
  { id: 's1-63', section: 1, type: 'reading', content: '地', pinyin: 'de' },
  { id: 's1-64', section: 1, type: 'reading', content: '和', pinyin: 'hé' },
  { id: 's1-65', section: 1, type: 'reading', content: '与', pinyin: 'yǔ' },
  { id: 's1-66', section: 1, type: 'reading', content: '或', pinyin: 'huò' },
  { id: 's1-67', section: 1, type: 'reading', content: '而', pinyin: 'ér' },
  { id: 's1-68', section: 1, type: 'reading', content: '但', pinyin: 'dàn' },
  { id: 's1-69', section: 1, type: 'reading', content: '又', pinyin: 'yòu' },
  { id: 's1-70', section: 1, type: 'reading', content: '可', pinyin: 'kě' },
  // Common adjectives
  { id: 's1-71', section: 1, type: 'reading', content: '也', pinyin: 'yě' },
  { id: 's1-72', section: 1, type: 'reading', content: '还', pinyin: 'hái' },
  { id: 's1-73', section: 1, type: 'reading', content: '就', pinyin: 'jiù' },
  { id: 's1-74', section: 1, type: 'reading', content: '都', pinyin: 'dōu' },
  { id: 's1-75', section: 1, type: 'reading', content: '常', pinyin: 'cháng' },
  { id: 's1-76', section: 1, type: 'reading', content: '长', pinyin: 'cháng' },
  { id: 's1-77', section: 1, type: 'reading', content: '短', pinyin: 'duǎn' },
  { id: 's1-78', section: 1, type: 'reading', content: '高', pinyin: 'gāo' },
  { id: 's1-79', section: 1, type: 'reading', content: '低', pinyin: 'dī' },
  { id: 's1-80', section: 1, type: 'reading', content: '新', pinyin: 'xīn' },
  // More common
  { id: 's1-81', section: 1, type: 'reading', content: '旧', pinyin: 'jiù' },
  { id: 's1-82', section: 1, type: 'reading', content: '快', pinyin: 'kuài' },
  { id: 's1-83', section: 1, type: 'reading', content: '慢', pinyin: 'màn' },
  { id: 's1-84', section: 1, type: 'reading', content: '多', pinyin: 'duō' },
  { id: 's1-85', section: 1, type: 'reading', content: '少', pinyin: 'shǎo' },
  { id: 's1-86', section: 1, type: 'reading', content: '轻', pinyin: 'qīng' },
  { id: 's1-87', section: 1, type: 'reading', content: '重', pinyin: 'zhòng' },
  { id: 's1-88', section: 1, type: 'reading', content: '深', pinyin: 'shēn' },
  { id: 's1-89', section: 1, type: 'reading', content: '浅', pinyin: 'qiǎn' },
  { id: 's1-90', section: 1, type: 'reading', content: '黑', pinyin: 'hēi' },
  { id: 's1-91', section: 1, type: 'reading', content: '白', pinyin: 'bái' },
  { id: 's1-92', section: 1, type: 'reading', content: '红', pinyin: 'hóng' },
  { id: 's1-93', section: 1, type: 'reading', content: '黄', pinyin: 'huáng' },
  { id: 's1-94', section: 1, type: 'reading', content: '蓝', pinyin: 'lán' },
  { id: 's1-95', section: 1, type: 'reading', content: '绿', pinyin: 'lǜ' },
  { id: 's1-96', section: 1, type: 'reading', content: '上', pinyin: 'shàng' },
  { id: 's1-97', section: 1, type: 'reading', content: '下', pinyin: 'xià' },
  { id: 's1-98', section: 1, type: 'reading', content: '前', pinyin: 'qián' },
  { id: 's1-99', section: 1, type: 'reading', content: '后', pinyin: 'hòu' },
  { id: 's1-100', section: 1, type: 'reading', content: '里', pinyin: 'lǐ' },
];

// Section 2: Polysyllabic words (100 words) - 20%
// Focus: compound tones, retroflex in context, nasal finals
export const section2Questions: Question[] = [
  // Seasons
  { id: 's2-1', section: 2, type: 'reading', content: '春天', pinyin: 'chūntiān' },
  { id: 's2-2', section: 2, type: 'reading', content: '夏天', pinyin: 'xiàtiān' },
  { id: 's2-3', section: 2, type: 'reading', content: '秋天', pinyin: 'qiūtiān' },
  { id: 's2-4', section: 2, type: 'reading', content: '冬天', pinyin: 'dōngtiān' },
  // Common words
  { id: 's2-5', section: 2, type: 'reading', content: '中国', pinyin: 'zhōngguó' },
  { id: 's2-6', section: 2, type: 'reading', content: '学习', pinyin: 'xuéxí' },
  { id: 's2-7', section: 2, type: 'reading', content: '朋友', pinyin: 'péngyou' },
  { id: 's2-8', section: 2, type: 'reading', content: '老师', pinyin: 'lǎoshī' },
  { id: 's2-9', section: 2, type: 'reading', content: '学生', pinyin: 'xuéshēng' },
  { id: 's2-10', section: 2, type: 'reading', content: '工作', pinyin: 'gōngzuò' },
  // PSC-related
  { id: 's2-11', section: 2, type: 'reading', content: '普通话', pinyin: 'pǔtōnghuà' },
  { id: 's2-12', section: 2, type: 'reading', content: '水平', pinyin: 'shuǐpíng' },
  { id: 's2-13', section: 2, type: 'reading', content: '测试', pinyin: 'cèshì' },
  { id: 's2-14', section: 2, type: 'reading', content: '考试', pinyin: 'kǎoshì' },
  { id: 's2-15', section: 2, type: 'reading', content: '成绩', pinyin: 'chéngjì' },
  { id: 's2-16', section: 2, type: 'reading', content: '发音', pinyin: 'fāyīn' },
  { id: 's2-17', section: 2, type: 'reading', content: '声调', pinyin: 'shēngdiào' },
  { id: 's2-18', section: 2, type: 'reading', content: '拼音', pinyin: 'pīnyīn' },
  { id: 's2-19', section: 2, type: 'reading', content: '汉字', pinyin: 'hànzì' },
  { id: 's2-20', section: 2, type: 'reading', content: '中文', pinyin: 'zhōngwén' },
  // Nasal finals (common difficulty)
  { id: 's2-21', section: 2, type: 'reading', content: '安全', pinyin: 'ānquán' },
  { id: 's2-22', section: 2, type: 'reading', content: '欢迎', pinyin: 'huānyíng' },
  { id: 's2-23', section: 2, type: 'reading', content: '困难', pinyin: 'kùnnan' },
  { id: 's2-24', section: 2, type: 'reading', content: '认真', pinyin: 'rènzhēn' },
  { id: 's2-25', section: 2, type: 'reading', content: '英语', pinyin: 'yīngyǔ' },
  { id: 's2-26', section: 2, type: 'reading', content: '汉语', pinyin: 'hànyǔ' },
  { id: 's2-27', section: 2, type: 'reading', content: '语言', pinyin: 'yǔyán' },
  { id: 's2-28', section: 2, type: 'reading', content: '经常', pinyin: 'jīngcháng' },
  { id: 's2-29', section: 2, type: 'reading', content: '练习', pinyin: 'liànxí' },
  { id: 's2-30', section: 2, type: 'reading', content: '说话', pinyin: 'shuōhuà' },
  // Common phrases
  { id: 's2-31', section: 2, type: 'reading', content: '大家', pinyin: 'dàjiā' },
  { id: 's2-32', section: 2, type: 'reading', content: '时候', pinyin: 'shíhou' },
  { id: 's2-33', section: 2, type: 'reading', content: '地方', pinyin: 'dìfang' },
  { id: 's2-34', section: 2, type: 'reading', content: '知道', pinyin: 'zhīdào' },
  { id: 's2-35', section: 2, type: 'reading', content: '觉得', pinyin: 'juéde' },
  { id: 's2-36', section: 2, type: 'reading', content: '可以', pinyin: 'kěyǐ' },
  { id: 's2-37', section: 2, type: 'reading', content: '没有', pinyin: 'méiyǒu' },
  { id: 's2-38', section: 2, type: 'reading', content: '这样', pinyin: 'zhèyàng' },
  { id: 's2-39', section: 2, type: 'reading', content: '怎样', pinyin: 'zěnyàng' },
  { id: 's2-40', section: 2, type: 'reading', content: '他们', pinyin: 'tāmen' },
  // More words
  { id: 's2-41', section: 2, type: 'reading', content: '我们', pinyin: 'wǒmen' },
  { id: 's2-42', section: 2, type: 'reading', content: '自己', pinyin: 'zìjǐ' },
  { id: 's2-43', section: 2, type: 'reading', content: '现在', pinyin: 'xiànzài' },
  { id: 's2-44', section: 2, type: 'reading', content: '今天', pinyin: 'jīntiān' },
  { id: 's2-45', section: 2, type: 'reading', content: '明天', pinyin: 'míngtiān' },
  { id: 's2-46', section: 2, type: 'reading', content: '昨天', pinyin: 'zuótiān' },
  { id: 's2-47', section: 2, type: 'reading', content: '时间', pinyin: 'shíjiān' },
  { id: 's2-48', section: 2, type: 'reading', content: '开始', pinyin: 'kāishǐ' },
  { id: 's2-49', section: 2, type: 'reading', content: '希望', pinyin: 'xīwàng' },
  { id: 's2-50', section: 2, type: 'reading', content: '喜欢', pinyin: 'xǐhuan' },
  // Daily life
  { id: 's2-51', section: 2, type: 'reading', content: '学校', pinyin: 'xuéxiào' },
  { id: 's2-52', section: 2, type: 'reading', content: '公司', pinyin: 'gōngsī' },
  { id: 's2-53', section: 2, type: 'reading', content: '家庭', pinyin: 'jiātíng' },
  { id: 's2-54', section: 2, type: 'reading', content: '问题', pinyin: 'wèntí' },
  { id: 's2-55', section: 2, type: 'reading', content: '答案', pinyin: 'dáàn' },
  { id: 's2-56', section: 2, type: 'reading', content: '原因', pinyin: 'yuányīn' },
  { id: 's2-57', section: 2, type: 'reading', content: '结果', pinyin: 'jiéguǒ' },
  { id: 's2-58', section: 2, type: 'reading', content: '但是', pinyin: 'dànshì' },
  { id: 's2-59', section: 2, type: 'reading', content: '因为', pinyin: 'yīnwèi' },
  { id: 's2-60', section: 2, type: 'reading', content: '所以', pinyin: 'suǒyǐ' },
  // Connectors & more
  { id: 's2-61', section: 2, type: 'reading', content: '如果', pinyin: 'rúguǒ' },
  { id: 's2-62', section: 2, type: 'reading', content: '虽然', pinyin: 'suīrán' },
  { id: 's2-63', section: 2, type: 'reading', content: '然后', pinyin: 'ránhòu' },
  { id: 's2-64', section: 2, type: 'reading', content: '之前', pinyin: 'zhīqián' },
  { id: 's2-65', section: 2, type: 'reading', content: '之后', pinyin: 'zhīhòu' },
  { id: 's2-66', section: 2, type: 'reading', content: '非常', pinyin: 'fēicháng' },
  { id: 's2-67', section: 2, type: 'reading', content: '特别', pinyin: 'tèbié' },
  { id: 's2-68', section: 2, type: 'reading', content: '声音', pinyin: 'shēngyīn' },
  { id: 's2-69', section: 2, type: 'reading', content: '音乐', pinyin: 'yīnyuè' },
  { id: 's2-70', section: 2, type: 'reading', content: '应该', pinyin: 'yīnggāi' },
  // More common
  { id: 's2-71', section: 2, type: 'reading', content: '必须', pinyin: 'bìxū' },
  { id: 's2-72', section: 2, type: 'reading', content: '可能', pinyin: 'kěnéng' },
  { id: 's2-73', section: 2, type: 'reading', content: '一定', pinyin: 'yídìng' },
  { id: 's2-74', section: 2, type: 'reading', content: '当然', pinyin: 'dāngrán' },
  { id: 's2-75', section: 2, type: 'reading', content: '自然', pinyin: 'zìrán' },
  { id: 's2-76', section: 2, type: 'reading', content: '需要', pinyin: 'xūyào' },
  { id: 's2-77', section: 2, type: 'reading', content: '努力', pinyin: 'nǔlì' },
  { id: 's2-78', section: 2, type: 'reading', content: '提高', pinyin: 'tígāo' },
  { id: 's2-79', section: 2, type: 'reading', content: '重要', pinyin: 'zhòngyào' },
  { id: 's2-80', section: 2, type: 'reading', content: '意思', pinyin: 'yìsi' },
  // Continue
  { id: 's2-81', section: 2, type: 'reading', content: '帮助', pinyin: 'bāngzhù' },
  { id: 's2-82', section: 2, type: 'reading', content: '发展', pinyin: 'fāzhǎn' },
  { id: 's2-83', section: 2, type: 'reading', content: '完成', pinyin: 'wánchéng' },
  { id: 's2-84', section: 2, type: 'reading', content: '世界', pinyin: 'shìjiè' },
  { id: 's2-85', section: 2, type: 'reading', content: '国家', pinyin: 'guójiā' },
  { id: 's2-86', section: 2, type: 'reading', content: '人民', pinyin: 'rénmín' },
  { id: 's2-87', section: 2, type: 'reading', content: '社会', pinyin: 'shèhuì' },
  { id: 's2-88', section: 2, type: 'reading', content: '生活', pinyin: 'shēnghuó' },
  { id: 's2-89', section: 2, type: 'reading', content: '历史', pinyin: 'lìshǐ' },
  { id: 's2-90', section: 2, type: 'reading', content: '文化', pinyin: 'wénhuà' },
  // Final 10
  { id: 's2-91', section: 2, type: 'reading', content: '经济', pinyin: 'jīngjì' },
  { id: 's2-92', section: 2, type: 'reading', content: '科学', pinyin: 'kēxué' },
  { id: 's2-93', section: 2, type: 'reading', content: '技术', pinyin: 'jìshù' },
  { id: 's2-94', section: 2, type: 'reading', content: '教育', pinyin: 'jiàoyù' },
  { id: 's2-95', section: 2, type: 'reading', content: '环境', pinyin: 'huánjìng' },
  { id: 's2-96', section: 2, type: 'reading', content: '健康', pinyin: 'jiànkāng' },
  { id: 's2-97', section: 2, type: 'reading', content: '旅游', pinyin: 'lǚyóu' },
  { id: 's2-98', section: 2, type: 'reading', content: '电影', pinyin: 'diànyǐng' },
  { id: 's2-99', section: 2, type: 'reading', content: '电视', pinyin: 'diànshì' },
  { id: 's2-100', section: 2, type: 'reading', content: '电脑', pinyin: 'diànnǎo' },
];

// Section 3: 選擇判斷 (Choice & Judgment) - 10%
// PSC Official: 25 questions = 10 詞語判斷 + 10 量詞搭配 + 5 語法判斷
// Each question tests vocabulary contrast, classifier matching, or grammar judgment
export const section3Questions: Question[] = [
  // =========================================================================
  // Part 1: 詞語判斷 (Vocabulary Contrast) - 10 questions
  // Tests: Cantonese vs Mandarin vocabulary
  // =========================================================================
  {
    id: 's3-v1',
    section: 3,
    type: 'choice',
    subType: 'vocab',
    content: '请问，去图书馆______走？',
    options: ['A. 邊度', 'B. 哪裡', 'C. 邊處', 'D. 邊'],
    correctAnswer: 'B',
    correctMandarin: '哪裡',
    cantoneseOption: '邊度'
  },
  {
    id: 's3-v2',
    section: 3,
    type: 'choice',
    subType: 'vocab',
    content: '我們明天去______玩。',
    options: ['A. 公園', 'B. 公園', 'C. 花園', 'D. 場'],
    correctAnswer: 'A',
    correctMandarin: '公園'
  },
  {
    id: 's3-v3',
    section: 3,
    type: 'choice',
    subType: 'vocab',
    content: '這個______多少錢？',
    options: ['A. 幾多', 'B. 多少', 'C. 幾銀', 'D. 幾錢'],
    correctAnswer: 'B',
    correctMandarin: '多少',
    cantoneseOption: '幾多'
  },
  {
    id: 's3-v4',
    section: 3,
    type: 'choice',
    subType: 'vocab',
    content: '______，請問多少錢？',
    options: ['A. 伙計', 'B. 服務員', 'C. 姑娘', 'D. 小姐'],
    correctAnswer: 'B',
    correctMandarin: '服務員',
    cantoneseOption: '伙計'
  },
  {
    id: 's3-v5',
    section: 3,
    type: 'choice',
    subType: 'vocab',
    content: '我喜歡聽______。',
    options: ['A. 歌', 'B. 歌曲', 'C. 歌唱', 'D. 歌謠'],
    correctAnswer: 'A',
    correctMandarin: '歌'
  },
  {
    id: 's3-v6',
    section: 3,
    type: 'choice',
    subType: 'vocab',
    content: '昨天夜裡______下了一場大雨。',
    options: ['A. 咁', 'B. 咁樣', 'C. 這麼', 'D. 噉'],
    correctAnswer: 'C',
    correctMandarin: '這麼',
    cantoneseOption: '咁'
  },
  {
    id: 's3-v7',
    section: 3,
    type: 'choice',
    subType: 'vocab',
    content: '______是誰告訴你的？',
    options: ['A. 邊個', 'B. 邊', 'C.邊位', 'D. 誰'],
    correctAnswer: 'D',
    correctMandarin: '誰',
    cantoneseOption: '邊個'
  },
  {
    id: 's3-v8',
    section: 3,
    type: 'choice',
    subType: 'vocab',
    content: '你______學校？',
    options: ['A. 去先', 'B. 先去', 'C. 去先', 'D. 先去'],
    correctAnswer: 'B',
    correctMandarin: '先去'
  },
  {
    id: 's3-v9',
    section: 3,
    type: 'choice',
    subType: 'vocab',
    content: '______天氣真好，我們去郊遊吧！',
    options: ['A. 今日', 'B. 今天', 'C. 今日', 'D. 今'],
    correctAnswer: 'B',
    correctMandarin: '今天',
    cantoneseOption: '今日'
  },
  {
    id: 's3-v10',
    section: 3,
    type: 'choice',
    subType: 'vocab',
    content: '______已經告訴過你了。',
    options: ['A. 已前', 'B. 之前', 'C. 之前', 'D. 以前的'],
    correctAnswer: 'B',
    correctMandarin: '之前',
    cantoneseOption: '已前'
  },

  // =========================================================================
  // Part 2: 量詞搭配 (Classifier Matching) - 10 questions
  // Tests: Correct classifier-noun pairing
  // =========================================================================
  {
    id: 's3-c1',
    section: 3,
    type: 'choice',
    subType: 'classifier',
    content: '我要買______蘋果。',
    options: ['A. 個', 'B. 條', 'C. 張', 'D. 本'],
    correctAnswer: 'A',
    correctMandarin: '個'
  },
  {
    id: 's3-c2',
    section: 3,
    type: 'choice',
    subType: 'classifier',
    content: '他有一______汽車。',
    options: ['A. 架', 'B. 輛', 'C. 臺', 'D. 張'],
    correctAnswer: 'B',
    correctMandarin: '輛'
  },
  {
    id: 's3-c3',
    section: 3,
    type: 'choice',
    subType: 'classifier',
    content: '那是______飛機。',
    options: ['A. 架', 'B. 輛', 'C. 艘', 'D. 匹'],
    correctAnswer: 'A',
    correctMandarin: '架'
  },
  {
    id: 's3-c4',
    section: 3,
    type: 'choice',
    subType: 'classifier',
    content: '桌子上放著______書。',
    options: ['A. 本', 'B. 張', 'C. 個', 'D. 支'],
    correctAnswer: 'A',
    correctMandarin: '本'
  },
  {
    id: 's3-c5',
    section: 3,
    type: 'choice',
    subType: 'classifier',
    content: '河裡有______魚。',
    options: ['A. 隻', 'B. 條', 'C. 尾', 'D. 頭'],
    correctAnswer: 'B',
    correctMandarin: '條'
  },
  {
    id: 's3-c6',
    section: 3,
    type: 'choice',
    subType: 'classifier',
    content: '他養了______狗。',
    options: ['A. 頭', 'B. 隻', 'C. 條', 'D. 匹'],
    correctAnswer: 'B',
    correctMandarin: '隻'
  },
  {
    id: 's3-c7',
    section: 3,
    type: 'choice',
    subType: 'classifier',
    content: '請給我______鉛筆。',
    options: ['A. 枝', 'B. 支', 'C. 桿', 'D. 筒'],
    correctAnswer: 'B',
    correctMandarin: '支'
  },
  {
    id: 's3-c8',
    section: 3,
    type: 'choice',
    subType: 'classifier',
    content: '我們家有______人。',
    options: ['A. 個', 'B. 口', 'C. 位', 'D. 名'],
    correctAnswer: 'B',
    correctMandarin: '口'
  },
  {
    id: 's3-c9',
    section: 3,
    type: 'choice',
    subType: 'classifier',
    content: '他是一位______。',
    options: ['A. 名', 'B. 個', 'C. 位', 'D. 種'],
    correctAnswer: 'C',
    correctMandarin: '位'
  },
  {
    id: 's3-c10',
    section: 3,
    type: 'choice',
    subType: 'classifier',
    content: '這是______好辦法。',
    options: ['A. 種', 'B. 類', 'C. 樣', 'D. 項'],
    correctAnswer: 'A',
    correctMandarin: '種'
  },

  // =========================================================================
  // Part 3: 語法判斷 (Grammar Judgment) - 5 questions
  // Tests: Grammar structure and word order
  // =========================================================================
  {
    id: 's3-g1',
    section: 3,
    type: 'choice',
    subType: 'grammar',
    content: '我______吃飯了。',
    options: ['A. 已經', 'B. 正在', 'C. 將要', 'D. 常常'],
    correctAnswer: 'A',
    correctMandarin: '已經'
  },
  {
    id: 's3-g2',
    section: 3,
    type: 'choice',
    subType: 'grammar',
    content: '這件事______很重要。',
    options: ['A. 非常', 'B. 經常', 'C. 常常', 'D. 一直'],
    correctAnswer: 'A',
    correctMandarin: '非常'
  },
  {
    id: 's3-g3',
    section: 3,
    type: 'choice',
    subType: 'grammar',
    content: '他是學生，______是老師？',
    options: ['A. 那麼', 'B. 還是', 'C. 是不是', 'D. 非常'],
    correctAnswer: 'B',
    correctMandarin: '還是'
  },
  {
    id: 's3-g4',
    section: 3,
    type: 'choice',
    subType: 'grammar',
    content: '我______告訴你。',
    options: ['A. 一', 'B. 就要', 'C. 一定', 'D. 一起'],
    correctAnswer: 'C',
    correctMandarin: '一定'
  },
  {
    id: 's3-g5',
    section: 3,
    type: 'choice',
    subType: 'grammar',
    content: '你______說普通話嗎？',
    options: ['A. 會', 'B. 能', 'C. 可以', 'D. 要'],
    correctAnswer: 'A',
    correctMandarin: '會'
  },
];

// Section 4: Reading passage (400 characters) - 30%
// Real PSC passages (simplified for practice)
export const section4Questions: Question[] = [
  // Passage 1 - Short practice passage
  {
    id: 's4-1',
    section: 4,
    type: 'reading',
    content: '春天来了，花儿开了，鸟儿在树枝上唱歌。',
    pinyin: 'chūn tiān lái le, huā ér kāi le, niǎo er zài shù zhī shàng chàng gē.'
  },
  // Passage 2
  {
    id: 's4-2',
    section: 4,
    type: 'reading',
    content: '今天天气很好，阳光明媚，适合出去游玩。我想去公园散步。',
    pinyin: 'jīn tiān tiān qì hěn hǎo, yáng guāng míng mèi, shì hé chū qù yóu wán. wǒ xiǎng qù gōng yuán sàn bù.'
  },
  // Passage 3 - About learning Mandarin
  {
    id: 's4-3',
    section: 4,
    type: 'reading',
    content: '学习普通话很重要。普通话是中国的官方语言，学好普通话可以更好地与中国人交流。',
    pinyin: 'xué xí pǔ tōng huà hěn zhòng yào. pǔ tōng huà shì zhōng guó de guān fāng yǔ yán, xué hǎo pǔ tōng huà kě yǐ gèng hǎo de yǔ zhōng guó rén jiāo liú.'
  },
  // Passage 4
  {
    id: 's4-4',
    section: 4,
    type: 'reading',
    content: '我的朋友小明很喜欢学习。他每天早上都读中文，晚上也练习说普通话。他的发音越来越标准了。',
    pinyin: 'wǒ de péng yǒu xiǎo míng hěn xǐ huan xué xí. tā měi tiān zǎo shàng dōu dú zhōng wén, wǎn shang yě liàn xí shuō pǔ tōng huà. tā de fā yīn yuè lái yuè biāo zhǔn le.'
  },
  // Passage 5 - About travel
  {
    id: 's4-5',
    section: 4,
    type: 'reading',
    content: '去年夏天，我去了北京旅游。北京是中国的首都，有很多著名的景点。我去了天安门、故宫和长城，留下了美好的回忆。',
    pinyin: 'qù nián xià tiān, wǒ qù le běi jīng lǚ yóu. běi jīng shì zhōng guó de shǒu dū, yǒu hěn duō zhù míng de jǐng diǎn. wǒ qù le tiān ān mén, gù gōng hé cháng chéng, liú xià le měi hǎo de huí yì.'
  },
  // Passage 6 - About food
  {
    id: 's4-6',
    section: 4,
    type: 'reading',
    content: '中国有很多美食。北方人喜欢吃面食，南方人喜欢吃米饭。每个地方都有自己的特色菜肴，值得一试。',
    pinyin: 'zhōng guó yǒu hěn duō měi shí. běi fāng rén xǐ huan chī miàn shí, nán fāng rén xǐ huan chī mǐ fàn. měi gè dì fang dōu yǒu zì jǐ de tè sè cài yáo, zhí de yí shì.'
  },
  // Passage 7 - About family
  {
    id: 's4-7',
    section: 4,
    type: 'reading',
    content: '我的家庭很幸福。爸爸妈妈都很爱我，他们每天辛苦工作，供我上学。我一定要好好学习，报答他们的养育之恩。',
    pinyin: 'wǒ de jiā tíng hěn xìng fú. bà ba mā ma dōu hěn ài wǒ, tā men měi tiān xīn kǔ gōng zuò, gōng wǒ shàng xué. wǒ yí dìng yào hǎo hǎo xué xí, bào dá tā men de yǎng yù zhī ēn.'
  },
  // Passage 8 - About seasons
  {
    id: 's4-8',
    section: 4,
    type: 'reading',
    content: '春天是万物复苏的季节，花儿盛开，鸟儿歌唱。夏天很热，人们喜欢去海边游泳。秋天是收获的季节，果实累累。冬天很冷，有时会下雪。',
    pinyin: 'chūn tiān shì wàn wù fù sū de jì jié, huā er shèng kāi, niǎo er gē chàng. xià tiān hěn rè, rén men xǐ huan qù hǎi yóu yǒng. qiū tiān shì shōu huò de jì jié, guǒ shí lěi lěi. dōng tiān hěn lěng, yǒu shí huì xià xuě.'
  },
  // Passage 9 - About hobbies
  {
    id: 's4-9',
    section: 4,
    type: 'reading',
    content: '我有很多爱好，比如看书、听音乐、打篮球。其中我最喜欢的是看书，因为书籍可以开阔眼界，增长知识。',
    pinyin: 'wǒ yǒu hěn duō ài hǎo, bǐ rú kàn shū, tīng yīn yuè, dǎ lán qiú. qí zhōng wǒ zuì xǐ huan de shì kàn shū, yīn wèi shū jí kě yǐ kāi kuò yǎn jiè, zēng zhǎng zhī shí.'
  },
  // Passage 10 - About technology
  {
    id: 's4-10',
    section: 4,
    type: 'reading',
    content: '现代科技发展很快，手机已经成为人们生活中不可缺少的东西。通过手机，我们可以随时随地和朋友聊天，了解新闻，学习知识。',
    pinyin: 'xiàn dài kē jì fā zhǎn hěn kuài, shǒu jī yǐ jīng chéng wéi rén men shēng huó zhōng bù kě quē shǎo de dōng xi. tōng guò shǒu jī, wǒ men kě yǐ suí shì suí dì hé péng yǒu liáo tiān, liǎo jiě xī wén, xué xí zhī shí.'
  },
  // Passage 11 - About friendship
  {
    id: 's4-11',
    section: 4,
    type: 'reading',
    content: '朋友是我们生命中很重要的人。好的朋友会在我们遇到困难时帮助我们，在我们取得成绩时为我们高兴。',
    pinyin: 'péng yǒu shì wǒ men shēng mìng zhōng hěn zhòng yào de rén. hǎo de péng yǒu huì zài wǒ men yù dào kùn nan shí bāng zhù wǒ men, zài wǒ men qǔ dé chéng jì shí wèi wǒ men gāo xìng.'
  },
  // Passage 12 - About health
  {
    id: 's4-12',
    section: 4,
    type: 'reading',
    content: '健康对我们来说非常重要。我们应该每天保持充足的睡眠，适量运动，多吃蔬菜和水果，这样才能保持身体健康。',
    pinyin: 'jiàn kāng duì wǒ men lái shuō fēi cháng zhòng yào. wǒ men yīng gāi měi tiān bǎo chí chōng zú de shuì mián, shì liàng yùn dòng, duō chī shū cài hé shuǐ guǒ, zhè yàng cái néng bǎo chí shēn tǐ jiàn kāng.'
  },
  // Passage 13 - About education
  {
    id: 's4-13',
    section: 4,
    type: 'reading',
    content: '教育是国家的根本。一个国家要发展，必须重视教育。只有通过教育，才能培养出更多优秀的人才，推动社会进步。',
    pinyin: 'jiào yù shì guó jiā de gēn běn. yí gè guó jiā yào fā zhǎn, bì xū zhòng shì jiào yù. zhǐ yǒu tōng guò jiào yù, cái néng péi yǎng chū gèng duō yōu xiù de rén cái, tuī dòng shè huì jìn bù.'
  },
  // Passage 14 - About environment
  {
    id: 's4-14',
    section: 4,
    type: 'reading',
    content: '现在越来越多的人开始关注环境问题。我们应该保护环境，减少污染，节约资源，让我们的地球更加美好。',
    pinyin: 'xiàn zài yuè lái yuè duō de rén kāi shǐ guān zhù huán jìng wèn tí. wǒ men yīng gāi bǎo hù huán jìng, jiǎn shǎo wū rǎn, jié yuē zī yuán, ràng wǒ men de dì qiú gèng jiā měi hǎo.'
  },
  // Passage 15 - About dreams
  {
    id: 's4-15',
    section: 4,
    type: 'reading',
    content: '每个人都有自己的梦想。有的人的梦想是成为一名医生，有的人想当老师，还有的人希望环游世界。无论什么梦想，都需要我们努力去实现。',
    pinyin: 'měi gè rén dōu yǒu zì jǐ de mèng xiǎng. yǒu de rén de mèng xiǎng shì chéng wéi yì míng yī shēng, yǒu de rén xiǎng dāng lǎo shī, hái yǒu de rén xī wàng huán yóu shì jiè. wú lùn shén me mèng xiǎng, dōu xū yào wǒ men nǔ lì qù shí xiàn.'
  },
];

// Section 5: Speaking (3 minutes) - 30%
// PSC official topics
export const section5Questions: Question[] = [
  // Family & Life
  {
    id: 's5-1',
    section: 5,
    type: 'speaking',
    content: '介绍你的家庭 (Introduce Your Family)'
  },
  {
    id: 's5-2',
    section: 5,
    type: 'speaking',
    content: '我的学习生活 (My Study Life)'
  },
  {
    id: 's5-3',
    section: 5,
    type: 'speaking',
    content: '我的一天 (My Day)'
  },
  // Hobbies & Interests
  {
    id: 's5-4',
    section: 5,
    type: 'speaking',
    content: '我的爱好 (My Hobby)'
  },
  {
    id: 's5-5',
    section: 5,
    type: 'speaking',
    content: '我最喜欢的一本书 (My Favorite Book)'
  },
  {
    id: 's5-6',
    section: 5,
    type: 'speaking',
    content: '我最喜欢的一部電影 (My Favorite Movie)'
  },
  // Seasons & Nature
  {
    id: 's5-7',
    section: 5,
    type: 'speaking',
    content: '我最喜欢的季节 (My Favorite Season)'
  },
  {
    id: 's5-8',
    section: 5,
    type: 'speaking',
    content: '谈谈春節 (About Chinese New Year)'
  },
  // Travel & Places
  {
    id: 's5-9',
    section: 5,
    type: 'speaking',
    content: '我的旅行经历 (My Travel Experience)'
  },
  {
    id: 's5-10',
    section: 5,
    type: 'speaking',
    content: '我向往的地方 (A Place I Want to Visit)'
  },
  // Food & Culture
  {
    id: 's5-11',
    section: 5,
    type: 'speaking',
    content: '我最喜欢的一种食物 (My Favorite Food)'
  },
  {
    id: 's5-12',
    section: 5,
    type: 'speaking',
    content: '谈谈中国的节日 (Chinese Festivals)'
  },
  // People
  {
    id: 's5-13',
    section: 5,
    type: 'speaking',
    content: '我最好的朋友 (My Best Friend)'
  },
  {
    id: 's5-14',
    section: 5,
    type: 'speaking',
    content: '我最尊敬的人 (The Person I Respect Most)'
  },
  // Dreams & Goals
  {
    id: 's5-15',
    section: 5,
    type: 'speaking',
    content: '我的理想 (My Dream)'
  },
  {
    id: 's5-16',
    section: 5,
    type: 'speaking',
    content: '谈谈学习方法 (About Learning Methods)'
  },
  // Technology & Modern Life
  {
    id: 's5-17',
    section: 5,
    type: 'speaking',
    content: '谈谈手机 (About Mobile Phones)'
  },
  {
    id: 's5-18',
    section: 5,
    type: 'speaking',
    content: '网络对生活的影响 (Internet Impact on Life)'
  },
  // Education & Work
  {
    id: 's5-19',
    section: 5,
    type: 'speaking',
    content: '我的学校或工作 (My School/Work)'
  },
  {
    id: 's5-20',
    section: 5,
    type: 'speaking',
    content: '谈谈普通話的重要性 (Importance of Mandarin)'
  },
  // Abstract topics
  {
    id: 's5-21',
    section: 5,
    type: 'speaking',
    content: '幸福是什么？ (What is Happiness?)'
  },
  {
    id: 's5-22',
    section: 5,
    type: 'speaking',
    content: '谈谈环境保护 (Environmental Protection)'
  },
  {
    id: 's5-23',
    section: 5,
    type: 'speaking',
    content: '我的业余生活 (My Free Time)'
  },
  {
    id: 's5-24',
    section: 5,
    type: 'speaking',
    content: '谈谈健康 (About Health)'
  },
  {
    id: 's5-25',
    section: 5,
    type: 'speaking',
    content: '如何交朋友 (How to Make Friends)'
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
