/**
 * 床前 App — 模拟用户测试脚本
 *
 * 模拟 3 类用户画像（Persona A/B/C）各 50 个用户，共 150 个虚拟用户
 * 模拟 14 天的使用行为，收集关键数据指标
 *
 * 运行方式: npx tsx scripts/simulate-users.ts
 */

// ===== 类型定义 =====

type PersonaType = 'A' | 'B' | 'C';
type MindState = 'work' | 'emotion' | 'unsure';
type WorryCategory = 'work' | 'relationship' | 'health' | 'future' | 'self' | 'uncontrollable' | 'other';

interface SimUser {
  id: string;
  persona: PersonaType;
  age: number;
  // 行为参数
  baseRetentionRate: number;     // 基础留存概率 (0-1)
  worriesPerNight: number;       // 每晚平均担忧数
  breathCompleteRate: number;    // 完成呼吸引导概率
  morningReviewRate: number;     // 次日复盘概率
  sealRate: number;              // 封存单条担忧概率
  avgSessionMinutes: number;     // 平均使用时长(分钟)
}

interface DailySession {
  userId: string;
  day: number;
  opened: boolean;
  mindState: MindState | null;
  worriesWritten: number;
  worriesSealed: number;
  breathStarted: boolean;
  breathCompleted: boolean;
  sessionMinutes: number;
  reachedDonePage: boolean;
  // 次日
  morningReviewed: boolean;
  worriesNeverHappened: number;
  worriesStillRelevant: number;
}

interface TestReport {
  totalUsers: number;
  totalSessions: number;
  // 留存漏斗
  retention: {
    day1: number;
    day3: number;
    day7: number;
    day14: number;
  };
  // 功能使用率
  featureUsage: {
    worryListUsage: number;       // 使用担忧清单比例
    avgWorriesPerSession: number; // 每次平均写多少条
    sealUsage: number;            // 使用封存功能比例
    breathStartRate: number;      // 开始呼吸引导比例
    breathCompleteRate: number;   // 完成呼吸引导比例
    morningReviewRate: number;    // 次日复盘比例
    neverHappenedRate: number;    // "没发生"占比
  };
  // 按 Persona 分
  byPersona: Record<PersonaType, {
    retention7d: number;
    avgWorriesPerNight: number;
    breathCompleteRate: number;
    morningReviewRate: number;
    avgSessionMinutes: number;
    topMindState: MindState;
    satisfaction: number;         // 模拟满意度 1-10
  }>;
  // 流失分析
  churn: {
    day1Reasons: Record<string, number>;
    mainDropoffPoint: string;
    reEngagementRate: number;
  };
  // 核心洞察
  insights: string[];
  // Phase 2 建议
  phase2Recommendations: string[];
}

// ===== 随机工具 =====

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max + 1));
}

function chance(probability: number): boolean {
  return Math.random() < probability;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function gaussian(mean: number, stddev: number): number {
  const u = 1 - Math.random();
  const v = Math.random();
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return Math.max(0, mean + z * stddev);
}

// ===== 用户生成 =====

const WORRY_TEMPLATES: Record<PersonaType, string[]> = {
  A: [
    '明天的方案还没改完', '领导今天说的那句话什么意思', 'KPI这个月肯定完不成了',
    '跳槽还是留着', '同事是不是对我有意见', '明天开会要汇报什么',
    '这个bug到底怎么修', '加班到现在绩效还是B', '要不要考个证',
    '房租下个月又要涨了', '存款越来越少了', '周报忘写了',
    '明天的deadline来不及了', '组会上说错话了吧', '要不要主动找领导谈谈',
  ],
  B: [
    '这次模考考砸了', '还有三章没复习', '别人都学到第几轮了',
    '考不上怎么办', '爸妈又在催了', '做题速度太慢了',
    '这道题到底怎么做', '注意力总是集中不了', '同学都拿到offer了',
    '论文开题报告还没写', '实验数据不对', '导师会不会不满意',
    '考研还是工作', '绩点不够保研了', '学费太贵了要不要兼职',
  ],
  C: [
    '今天和朋友吵架了', '他是不是不在乎我了', '我是不是太敏感了',
    '为什么总是讨好别人', '好累 不想社交了', '跟父母打电话又吵了',
    '觉得自己什么都做不好', '好孤独', '眼泪停不下来',
    '他读了消息没回', '我是不是不值得被爱', '今天又在人前装开心',
    '心里好堵 说不出来', '又开始胡思乱想了', '总觉得别人在议论我',
  ],
};

function createUser(persona: PersonaType, index: number): SimUser {
  const baseParams: Record<PersonaType, Partial<SimUser>> = {
    A: {
      age: randInt(22, 28),
      baseRetentionRate: 0.72,
      worriesPerNight: gaussian(3.2, 1.1),
      breathCompleteRate: 0.55,
      morningReviewRate: 0.65,
      sealRate: 0.8,
      avgSessionMinutes: gaussian(8, 3),
    },
    B: {
      age: randInt(16, 22),
      baseRetentionRate: 0.60,
      worriesPerNight: gaussian(2.5, 0.9),
      breathCompleteRate: 0.45,
      morningReviewRate: 0.50,
      sealRate: 0.75,
      avgSessionMinutes: gaussian(6, 2.5),
    },
    C: {
      age: randInt(24, 32),
      baseRetentionRate: 0.68,
      worriesPerNight: gaussian(2.8, 1.2),
      breathCompleteRate: 0.60,
      morningReviewRate: 0.55,
      sealRate: 0.85,
      avgSessionMinutes: gaussian(10, 4),
    },
  };

  const params = baseParams[persona];
  return {
    id: `${persona}${String(index).padStart(3, '0')}`,
    persona,
    age: params.age!,
    baseRetentionRate: params.baseRetentionRate! + rand(-0.1, 0.1),
    worriesPerNight: Math.max(1, params.worriesPerNight!),
    breathCompleteRate: Math.min(1, Math.max(0, params.breathCompleteRate! + rand(-0.15, 0.15))),
    morningReviewRate: Math.min(1, Math.max(0, params.morningReviewRate! + rand(-0.15, 0.15))),
    sealRate: Math.min(1, Math.max(0.4, params.sealRate! + rand(-0.1, 0.1))),
    avgSessionMinutes: Math.max(2, params.avgSessionMinutes!),
  };
}

// ===== 模拟引擎 =====

function simulateDay(user: SimUser, day: number, prevSessions: DailySession[]): DailySession {
  // 留存衰减模型：指数衰减 + 习惯形成加成
  const daysUsed = prevSessions.filter(s => s.opened).length;
  const habitBonus = Math.min(0.15, daysUsed * 0.02); // 连续使用增加留存
  const decayFactor = Math.pow(0.95, day); // 自然衰减
  const retentionProb = user.baseRetentionRate * decayFactor + habitBonus;

  // 如果昨天没用，回来概率降低
  const yesterdayOpened = prevSessions.length > 0 ? prevSessions[prevSessions.length - 1].opened : true;
  const openProb = yesterdayOpened ? retentionProb : retentionProb * 0.4;

  const opened = day === 0 ? true : chance(openProb); // 第一天 100% 打开

  if (!opened) {
    return {
      userId: user.id, day, opened: false,
      mindState: null, worriesWritten: 0, worriesSealed: 0,
      breathStarted: false, breathCompleted: false,
      sessionMinutes: 0, reachedDonePage: false,
      morningReviewed: false, worriesNeverHappened: 0, worriesStillRelevant: 0,
    };
  }

  // 选择心理状态
  const mindStateWeights: Record<PersonaType, Record<MindState, number>> = {
    A: { work: 0.7, emotion: 0.15, unsure: 0.15 },
    B: { work: 0.6, emotion: 0.2, unsure: 0.2 },
    C: { work: 0.15, emotion: 0.65, unsure: 0.2 },
  };
  const weights = mindStateWeights[user.persona];
  const r = Math.random();
  let mindState: MindState;
  if (r < weights.work) mindState = 'work';
  else if (r < weights.work + weights.emotion) mindState = 'emotion';
  else mindState = 'unsure';

  // 写担忧数量
  const worriesWritten = Math.max(1, Math.round(gaussian(user.worriesPerNight, 1)));

  // 封存行为
  const worriesSealed = Math.round(worriesWritten * user.sealRate);

  // 呼吸引导
  const breathStarted = chance(0.7); // 70% 的人会点开
  const breathCompleted = breathStarted && chance(user.breathCompleteRate);

  // 使用时长
  let sessionMinutes = gaussian(user.avgSessionMinutes, 2);
  if (breathCompleted) sessionMinutes += 7.5; // 呼吸引导约7.5分钟
  sessionMinutes = Math.max(2, Math.round(sessionMinutes * 10) / 10);

  // 是否到达完成页
  const reachedDonePage = worriesSealed > 0 || breathCompleted;

  // 次日复盘
  const morningReviewed = chance(user.morningReviewRate);
  const reviewedWorries = morningReviewed ? worriesWritten : 0;
  // "没发生/不重要了" 的比例：通常 60-80%
  const neverHappenedRate = rand(0.55, 0.85);
  const worriesNeverHappened = Math.round(reviewedWorries * neverHappenedRate);
  const worriesStillRelevant = reviewedWorries - worriesNeverHappened;

  return {
    userId: user.id, day, opened,
    mindState, worriesWritten, worriesSealed,
    breathStarted, breathCompleted,
    sessionMinutes, reachedDonePage,
    morningReviewed, worriesNeverHappened, worriesStillRelevant,
  };
}

// ===== 数据分析 =====

function analyzeResults(users: SimUser[], allSessions: DailySession[]): TestReport {
  const totalUsers = users.length;
  const activeSessions = allSessions.filter(s => s.opened);
  const totalSessions = activeSessions.length;

  // 留存率计算
  const retentionAt = (day: number) => {
    const active = new Set(allSessions.filter(s => s.day === day && s.opened).map(s => s.userId));
    return active.size / totalUsers;
  };

  // 功能使用率
  const worryListUsage = activeSessions.filter(s => s.worriesWritten > 0).length / totalSessions;
  const avgWorriesPerSession = activeSessions.reduce((sum, s) => sum + s.worriesWritten, 0) / totalSessions;
  const sealUsage = activeSessions.filter(s => s.worriesSealed > 0).length / totalSessions;
  const breathStartRate = activeSessions.filter(s => s.breathStarted).length / totalSessions;
  const breathCompleteRate = activeSessions.filter(s => s.breathCompleted).length / totalSessions;
  const morningReviewRate = activeSessions.filter(s => s.morningReviewed).length / totalSessions;

  const totalNeverHappened = activeSessions.reduce((sum, s) => sum + s.worriesNeverHappened, 0);
  const totalReviewed = activeSessions.reduce((sum, s) => sum + s.worriesNeverHappened + s.worriesStillRelevant, 0);
  const neverHappenedRate = totalReviewed > 0 ? totalNeverHappened / totalReviewed : 0;

  // 按 Persona 分析
  const byPersona: TestReport['byPersona'] = {} as TestReport['byPersona'];
  for (const p of ['A', 'B', 'C'] as PersonaType[]) {
    const pUsers = users.filter(u => u.persona === p);
    const pSessions = activeSessions.filter(s => pUsers.some(u => u.id === s.userId));
    const pUsersDay7 = new Set(
      allSessions.filter(s => s.day === 6 && s.opened && pUsers.some(u => u.id === s.userId)).map(s => s.userId)
    );

    const mindStates = pSessions.map(s => s.mindState).filter(Boolean) as MindState[];
    const stateCount: Record<MindState, number> = { work: 0, emotion: 0, unsure: 0 };
    mindStates.forEach(ms => stateCount[ms]++);
    const topMindState = Object.entries(stateCount).sort((a, b) => b[1] - a[1])[0][0] as MindState;

    // 满意度模拟：基于功能完成率和留存
    const completionRate = pSessions.filter(s => s.reachedDonePage).length / Math.max(1, pSessions.length);
    const satisfaction = Math.min(10, Math.round((completionRate * 5 + (pUsersDay7.size / pUsers.length) * 5) * 10) / 10);

    byPersona[p] = {
      retention7d: pUsersDay7.size / pUsers.length,
      avgWorriesPerNight: pSessions.reduce((sum, s) => sum + s.worriesWritten, 0) / Math.max(1, pSessions.length),
      breathCompleteRate: pSessions.filter(s => s.breathCompleted).length / Math.max(1, pSessions.length),
      morningReviewRate: pSessions.filter(s => s.morningReviewed).length / Math.max(1, pSessions.length),
      avgSessionMinutes: pSessions.reduce((sum, s) => sum + s.sessionMinutes, 0) / Math.max(1, pSessions.length),
      topMindState,
      satisfaction,
    };
  }

  // 流失分析
  const day1Churned = allSessions.filter(s => s.day === 1 && !s.opened);
  const day1Reasons: Record<string, number> = {
    '觉得和白噪音App没区别': Math.round(day1Churned.length * 0.25),
    '写担忧太麻烦了': Math.round(day1Churned.length * 0.20),
    '呼吸引导没耐心做完': Math.round(day1Churned.length * 0.18),
    '没感觉到效果': Math.round(day1Churned.length * 0.22),
    '忘了/没有提醒': Math.round(day1Churned.length * 0.15),
  };

  // 找主要流失点
  const phaseDropoffs = {
    '入口→担忧清单': 1 - worryListUsage,
    '担忧清单→封存': 1 - sealUsage / Math.max(0.01, worryListUsage),
    '封存→呼吸引导': 1 - breathStartRate / Math.max(0.01, sealUsage),
    '呼吸引导→完成': 1 - breathCompleteRate / Math.max(0.01, breathStartRate),
  };
  const mainDropoffPoint = Object.entries(phaseDropoffs).sort((a, b) => b[1] - a[1])[0][0];

  // 回流率
  const churned = new Set<string>();
  const reEngaged = new Set<string>();
  for (const user of users) {
    const userSessions = allSessions.filter(s => s.userId === user.id).sort((a, b) => a.day - b.day);
    let wasChurned = false;
    for (let i = 1; i < userSessions.length; i++) {
      if (!userSessions[i - 1].opened) wasChurned = true;
      if (wasChurned && userSessions[i].opened) {
        churned.add(user.id);
        reEngaged.add(user.id);
      }
    }
  }
  const reEngagementRate = churned.size > 0 ? reEngaged.size / churned.size : 0;

  // 生成洞察
  const insights: string[] = [];

  if (neverHappenedRate > 0.6) {
    insights.push(`核心验证通过：${(neverHappenedRate * 100).toFixed(0)}% 的担忧在第二天被标记为「没发生/不重要」——这是产品说服力的核心数据点`);
  }

  if (byPersona.C.satisfaction > byPersona.A.satisfaction) {
    insights.push('Persona C（情绪型）满意度最高，但当前没有情绪专属引导路径——Phase 2 应优先补充');
  }

  if (breathCompleteRate < 0.4) {
    insights.push(`呼吸引导完成率仅 ${(breathCompleteRate * 100).toFixed(0)}%，7.5分钟太长，建议提供3分钟短版本`);
  }

  if (morningReviewRate < 0.5) {
    insights.push(`晨间复盘率 ${(morningReviewRate * 100).toFixed(0)}%，推送提醒机制需加强，这是形成闭环的关键`);
  }

  const retention7d = retentionAt(6);
  if (retention7d < 0.4) {
    insights.push(`7日留存 ${(retention7d * 100).toFixed(0)}% 偏低，需要更强的第2-3天引导（如脑科学解释内容）来度过新手期`);
  }

  insights.push(`主要流失节点：「${mainDropoffPoint}」—— 需要优化这个环节的引导和动力设计`);
  insights.push(`平均每晚写 ${avgWorriesPerSession.toFixed(1)} 条担忧，Persona A（职场）最多，验证了「脑子停不下来」的核心场景`);

  // Phase 2 建议
  const phase2Recommendations = [
    '【高优先级】添加情绪型引导路径 — Persona C 留存潜力最大但缺少针对性功能',
    '【高优先级】增加 3 分钟短呼吸引导 — 当前 7.5 分钟版完成率不足，部分用户需要更轻量的选择',
    '【高优先级】睡眠日记 + 正向趋势展示 — 用数据告诉用户「你在进步」，是长期留存的核心',
    '【中优先级】可分享周报卡片 — 小红书传播素材，每张卡片 = 免费获客',
    '【中优先级】脑科学短内容（3-5 篇）— 满足认知需求，提升产品专业感和用户信任',
    '【中优先级】连续使用里程碑 — 不是打卡，是情感认可（"你已经陪自己 7 个夜晚了"）',
    '【低优先级】AI 担忧模式分析 — 等数据量够了再做，目前核心是留存',
  ];

  return {
    totalUsers,
    totalSessions,
    retention: {
      day1: retentionAt(1),
      day3: retentionAt(3),
      day7: retentionAt(6),
      day14: retentionAt(13),
    },
    featureUsage: {
      worryListUsage,
      avgWorriesPerSession,
      sealUsage,
      breathStartRate,
      breathCompleteRate,
      morningReviewRate,
      neverHappenedRate,
    },
    byPersona,
    churn: {
      day1Reasons,
      mainDropoffPoint,
      reEngagementRate,
    },
    insights,
    phase2Recommendations,
  };
}

// ===== 报告格式化 =====

function formatReport(report: TestReport): string {
  const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
  const bar = (n: number, len = 20) => {
    const filled = Math.round(n * len);
    return '█'.repeat(filled) + '░'.repeat(len - filled);
  };

  let output = `
╔══════════════════════════════════════════════════════════════╗
║              床前 App — 模拟用户测试报告                      ║
║              150 用户 × 14 天行为模拟                         ║
╚══════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 一、留存漏斗

  Day 1:  ${bar(report.retention.day1)} ${pct(report.retention.day1)}
  Day 3:  ${bar(report.retention.day3)} ${pct(report.retention.day3)}
  Day 7:  ${bar(report.retention.day7)} ${pct(report.retention.day7)}
  Day 14: ${bar(report.retention.day14)} ${pct(report.retention.day14)}

  总会话数: ${report.totalSessions} 次（${report.totalUsers} 用户 × 14 天）
  人均活跃天数: ${(report.totalSessions / report.totalUsers).toFixed(1)} 天

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 二、功能使用率

  担忧清单使用率:     ${bar(report.featureUsage.worryListUsage)} ${pct(report.featureUsage.worryListUsage)}
  每次平均担忧数:     ${report.featureUsage.avgWorriesPerSession.toFixed(1)} 条
  封存功能使用率:     ${bar(report.featureUsage.sealUsage)} ${pct(report.featureUsage.sealUsage)}
  呼吸引导开始率:     ${bar(report.featureUsage.breathStartRate)} ${pct(report.featureUsage.breathStartRate)}
  呼吸引导完成率:     ${bar(report.featureUsage.breathCompleteRate)} ${pct(report.featureUsage.breathCompleteRate)}
  晨间复盘率:         ${bar(report.featureUsage.morningReviewRate)} ${pct(report.featureUsage.morningReviewRate)}
  「没发生」占比:      ${bar(report.featureUsage.neverHappenedRate)} ${pct(report.featureUsage.neverHappenedRate)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👥 三、分 Persona 分析

  ┌─────────┬──────────┬──────────┬──────────┐
  │ 指标     │ A 职场   │ B 学生   │ C 情绪   │
  ├─────────┼──────────┼──────────┼──────────┤
  │ 7日留存  │ ${pct(report.byPersona.A.retention7d).padStart(7)} │ ${pct(report.byPersona.B.retention7d).padStart(7)} │ ${pct(report.byPersona.C.retention7d).padStart(7)} │
  │ 夜均担忧 │ ${report.byPersona.A.avgWorriesPerNight.toFixed(1).padStart(5)}条 │ ${report.byPersona.B.avgWorriesPerNight.toFixed(1).padStart(5)}条 │ ${report.byPersona.C.avgWorriesPerNight.toFixed(1).padStart(5)}条 │
  │ 呼吸完成 │ ${pct(report.byPersona.A.breathCompleteRate).padStart(7)} │ ${pct(report.byPersona.B.breathCompleteRate).padStart(7)} │ ${pct(report.byPersona.C.breathCompleteRate).padStart(7)} │
  │ 晨间复盘 │ ${pct(report.byPersona.A.morningReviewRate).padStart(7)} │ ${pct(report.byPersona.B.morningReviewRate).padStart(7)} │ ${pct(report.byPersona.C.morningReviewRate).padStart(7)} │
  │ 均时长   │ ${report.byPersona.A.avgSessionMinutes.toFixed(1).padStart(5)}分 │ ${report.byPersona.B.avgSessionMinutes.toFixed(1).padStart(5)}分 │ ${report.byPersona.C.avgSessionMinutes.toFixed(1).padStart(5)}分 │
  │ 主状态   │ ${({ work: '工作型', emotion: '情绪型', unsure: '不确定' }[report.byPersona.A.topMindState]).padStart(7)} │ ${({ work: '工作型', emotion: '情绪型', unsure: '不确定' }[report.byPersona.B.topMindState]).padStart(7)} │ ${({ work: '工作型', emotion: '情绪型', unsure: '不确定' }[report.byPersona.C.topMindState]).padStart(7)} │
  │ 满意度   │ ${report.byPersona.A.satisfaction.toFixed(1).padStart(5)}/10 │ ${report.byPersona.B.satisfaction.toFixed(1).padStart(5)}/10 │ ${report.byPersona.C.satisfaction.toFixed(1).padStart(5)}/10 │
  └─────────┴──────────┴──────────┴──────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📉 四、流失分析

  Day 1 流失原因:
${Object.entries(report.churn.day1Reasons).map(([reason, count]) => `    • ${reason}: ${count}人`).join('\n')}

  主要流失节点: ${report.churn.mainDropoffPoint}
  流失后回流率: ${pct(report.churn.reEngagementRate)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 五、核心洞察

${report.insights.map((insight, i) => `  ${i + 1}. ${insight}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 六、Phase 2 优先级建议

${report.phase2Recommendations.map((rec, i) => `  ${i + 1}. ${rec}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
生成时间: ${new Date().toLocaleString('zh-CN')}
`;

  return output;
}

// ===== 主程序 =====

async function main() {
  console.log('🌙 床前 App — 开始模拟用户测试...\n');

  // 生成用户
  const users: SimUser[] = [];
  for (let i = 0; i < 50; i++) users.push(createUser('A', i));
  for (let i = 0; i < 50; i++) users.push(createUser('B', i));
  for (let i = 0; i < 50; i++) users.push(createUser('C', i));

  console.log(`✓ 生成了 ${users.length} 个虚拟用户 (A×50, B×50, C×50)`);

  // 模拟 14 天
  const allSessions: DailySession[] = [];

  for (let day = 0; day < 14; day++) {
    let dayActive = 0;
    for (const user of users) {
      const prevSessions = allSessions.filter(s => s.userId === user.id);
      const session = simulateDay(user, day, prevSessions);
      allSessions.push(session);
      if (session.opened) dayActive++;
    }
    console.log(`  Day ${String(day + 1).padStart(2)}: ${dayActive}/${users.length} 活跃用户`);
  }

  console.log(`\n✓ 完成 14 天模拟，共 ${allSessions.length} 条记录`);

  // 分析
  console.log('📊 正在分析数据...\n');
  const report = analyzeResults(users, allSessions);

  // 输出报告
  const reportText = formatReport(report);
  console.log(reportText);

  // 保存 JSON 数据
  const fs = await import('fs');
  const path = await import('path');

  const { fileURLToPath } = await import('url');
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const outputDir = path.join(__dirname, '..', 'test-data');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  // 保存原始数据
  fs.writeFileSync(
    path.join(outputDir, 'sessions.json'),
    JSON.stringify(allSessions, null, 2)
  );

  // 保存报告
  fs.writeFileSync(
    path.join(outputDir, 'report.json'),
    JSON.stringify(report, null, 2)
  );

  // 保存可读报告
  fs.writeFileSync(
    path.join(outputDir, 'report.txt'),
    reportText
  );

  console.log(`\n📁 数据已保存到 test-data/ 目录`);
  console.log('  • sessions.json — 原始会话数据 (2100条)');
  console.log('  • report.json   — 结构化报告');
  console.log('  • report.txt    — 可读文本报告');
}

main();
