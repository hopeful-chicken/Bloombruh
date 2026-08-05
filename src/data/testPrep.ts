// Test Prep module data: firm-type process overviews, a technical question
// bank, real Pymetrics game descriptions, and real HireVue-style prompts.
// Grounded in real, publicly documented recruiting processes (verified via
// web research) — not invented. Where a specific firm is named as using a
// specific tool (Pymetrics, HireVue, McKinsey Solve), that's a real,
// checkable fact as of when this was written, not a guess. Processes
// change firm to firm and year to year, so this is a realistic composite,
// not a guarantee of what any one candidate will see.

export type FirmType = {
  id: string;
  name: string;
  category: string;
  summary: string;
  process: string[];
  realWorldNotes: string;
};

export const FIRM_TYPES: FirmType[] = [
  {
    id: "bulge-bracket-ib",
    name: "Bulge Bracket Investment Banks",
    category: "Investment Banking",
    summary:
      "The largest global banks (Goldman Sachs, Morgan Stanley, JPMorgan, Bank of America, Citi). High-volume recruiting, heavily standardized process, recruiting timelines that now run up to 18 months ahead of the actual start date.",
    process: [
      "Online application + resume screen",
      "Online assessment — numerical/logical reasoning, sometimes a recorded one-way video round (HireVue-style)",
      "First-round interview — behavioral + technical, phone or video, 30-45 minutes",
      "\"Superday\" — 3-5 back-to-back interviews in one day: behavioral/fit, technical, sometimes a case or modeling test",
    ],
    realWorldNotes:
      "Acceptance rates at top banks for these programs are commonly cited as below 1%. Fit and technical are both real bars — a strong technical answer with a flat, generic \"why banking\" answer can still lose to a strong all-rounder.",
  },
  {
    id: "elite-boutique-ib",
    name: "Elite Boutique & Middle-Market IB",
    category: "Investment Banking",
    summary:
      "Smaller, advisory-focused firms (e.g. Evercore, Lazard, Moelis, PJT, and regional middle-market shops). Smaller classes, often more technically demanding interviews since there's less brand-name draw doing the work for them.",
    process: [
      "Resume screen — networking and referrals matter more here than at bulge brackets",
      "First round — usually more technical, faster-paced, less scripted than a bulge bracket's standardized round",
      "Final round — partner/MD interviews, heavy emphasis on genuine interest in advisory work and the specific firm",
    ],
    realWorldNotes:
      "Boutiques often expect you to already know the technicals cold by first round, since there are fewer rounds total to figure out if you're capable. \"Why this boutique, specifically\" is asked more seriously here than \"why banking\" in general.",
  },
  {
    id: "asset-management",
    name: "Asset Management (Buy-Side)",
    category: "Asset Management",
    summary:
      "Firms managing others' money in public or private markets (e.g. BlackRock, Fidelity, Wellington, T. Rowe Price, hedge funds). Buy-side: analyzing markets and portfolios, not executing deals — a different day-to-day than banking.",
    process: [
      "Resume screen + online assessment — often HireVue or a traditional phone screen rather than a heavy numerical test",
      "First round — more market- and analytical-thinking focused than IB's deal-execution focus: stock pitches, macro views, portfolio construction logic",
      "Final rounds — often includes a live stock pitch or investment memo, presented to real portfolio managers",
    ],
    realWorldNotes:
      "AM interviews reward having genuine, current opinions on markets — being able to pitch a real stock (long or short) with real numbers is worth more here than reciting DCF steps. This site's own Company Profile and Pitch Builder modules are direct practice for this.",
  },
  {
    id: "mbb",
    name: "McKinsey, BCG & Bain (MBB)",
    category: "Management Consulting",
    summary:
      "The three most selective global strategy consultancies. Case interviews are the entire game here — technical finance knowledge matters far less than structured problem-solving under pressure.",
    process: [
      "Resume + cover letter screen",
      "Online assessment — McKinsey uses its own \"Solve\" game-based assessment (not Pymetrics); BCG uses a chatbot-based online case tool; Bain uses its own set of online test types",
      "First round — typically 2 case interviews + 1 behavioral/fit interview",
      "Final round — typically 2-3 more case interviews, often with senior partners",
    ],
    realWorldNotes:
      "McKinsey's case style is interviewer-led (a structured sequence: framework, then a chart, then math, then brainstorming). BCG and Bain are interviewee-led — you drive the structure, the interviewer mostly just feeds you data when you ask for it. These are genuinely different skills to practice, not just \"cases\" generically.",
  },
  {
    id: "other-consulting",
    name: "Big 4 & Other Consulting",
    category: "Management Consulting",
    summary:
      "Deloitte, PwC, EY, KPMG advisory arms, and other consultancies (Accenture, and specialist/boutique strategy firms). Larger classes than MBB, broader range of case difficulty, heaviest real-world use of HireVue of any firm type.",
    process: [
      "Online application + assessment (numerical/verbal reasoning is common)",
      "HireVue-style recorded video interview — Big 4 firms are the heaviest users of this format in the entire recruiting landscape",
      "Case + competency interview — usually 1-2 rounds, cases tend to be more business-operations focused (less abstract than MBB's classic market-sizing style)",
      "Assessment centre (common at Big 4 in some regions) — group exercise + case + interview, all in one day",
    ],
    realWorldNotes:
      "Because HireVue plays such a large role here, practicing answering out loud (or in writing first, then out loud) matters more for this firm type than almost any other — a strong written answer that you haven't rehearsed saying can come across flat on video.",
  },
];

export type TechQuestion = {
  id: string;
  category: "Accounting & Three-Statement" | "Valuation & Technicals" | "Deal & Case";
  firmTypes: string[];
  question: string;
  answer: string;
};

export const TECH_QUESTIONS: TechQuestion[] = [
  {
    id: "dep-flow-through",
    category: "Accounting & Three-Statement",
    firmTypes: ["bulge-bracket-ib", "elite-boutique-ib", "asset-management"],
    question: "Walk me through what happens to the three statements if depreciation increases by $10.",
    answer:
      "Income statement: operating income falls $10, taxes fall $2.50 (at 25%), net income falls $7.50. Cash flow: start from net income (−$7.50), add back the non-cash $10 depreciation → cash from operations is actually UP $2.50. Balance sheet: cash up $2.50, net PP&E down $10 (assets down $7.50 net); retained earnings down $7.50 (equity down $7.50) — balances. See the full worked version in Lesson 2: Three-Statement Modeling.",
  },
  {
    id: "wc-change",
    category: "Accounting & Three-Statement",
    firmTypes: ["bulge-bracket-ib", "elite-boutique-ib"],
    question: "A company's accounts receivable increases by $20. What happens on the cash flow statement, and why?",
    answer:
      "Net income is unaffected (the sale was already booked as revenue). But cash flow from operations falls by $20 — the company recorded the sale but hasn't actually collected the cash yet, so the increase in receivables is a real use of cash that has to be subtracted out on the cash flow statement.",
  },
  {
    id: "goodwill-impairment",
    category: "Accounting & Three-Statement",
    firmTypes: ["bulge-bracket-ib", "asset-management"],
    question: "What is goodwill, and what happens across the three statements if a company writes off $100 of it as impaired?",
    answer:
      "Goodwill is the premium paid over a target's identifiable net assets in an acquisition (it sits on the balance sheet, not amortized, but tested annually for impairment). A $100 impairment is a non-cash expense: pre-tax income falls $100 (often NOT tax-deductible, so unlike depreciation there may be no offsetting tax benefit — a common trap), net income falls, cash flow statement adds the $100 back as non-cash, and on the balance sheet goodwill falls $100 while retained earnings falls by the same after-tax net income hit.",
  },
  {
    id: "negative-equity",
    category: "Accounting & Three-Statement",
    firmTypes: ["elite-boutique-ib", "asset-management"],
    question: "Can a company have negative shareholders' equity, and what does that actually mean?",
    answer:
      "Yes — it means accumulated losses (or large debt-funded buybacks/dividends) have eroded equity below zero, so liabilities exceed assets on a book basis. It doesn't automatically mean insolvency (book value isn't market value, and the company can still generate real cash flow) — leveraged buyout targets and some mature cash-generative businesses with aggressive buyback programs commonly show negative book equity.",
  },
  {
    id: "dcf-walkthrough",
    category: "Valuation & Technicals",
    firmTypes: ["bulge-bracket-ib", "elite-boutique-ib", "asset-management"],
    question: "Walk me through a DCF.",
    answer:
      "Forecast unlevered free cash flow for ~5 years, discount it back at WACC, estimate a terminal value (perpetuity growth or exit multiple) and discount that too, sum for Enterprise Value, subtract net debt to bridge to equity value, divide by shares outstanding. Always volunteer that a DCF is only as good as its assumptions and should be sensitized across a range, not presented as one precise number. Full walkthrough in Lesson 3: Technical Interview Fundamentals.",
  },
  {
    id: "wacc-vs-cost-of-equity",
    category: "Valuation & Technicals",
    firmTypes: ["bulge-bracket-ib", "asset-management"],
    question: "When would you use WACC as your discount rate, and when would you use cost of equity instead?",
    answer:
      "Use WACC when discounting unlevered (pre-financing) free cash flows to get Enterprise Value — the standard DCF. Use cost of equity when discounting levered free cash flow (post-interest, post-debt-paydown) directly to equity value, or in a dividend discount model for financial institutions like banks, where a traditional EV-based DCF doesn't work well because debt is a raw material for a bank, not a financing choice.",
  },
  {
    id: "ev-vs-equity-value",
    category: "Valuation & Technicals",
    firmTypes: ["bulge-bracket-ib", "elite-boutique-ib", "asset-management", "mbb"],
    question: "What's the difference between Enterprise Value and Equity Value, and why does it matter which one a multiple uses?",
    answer:
      "Enterprise Value is the value of the whole operating business (equity + debt − cash) — capital-structure-neutral. Equity Value is just the value of the shares. That's why EV/EBITDA and EV/Sales use Enterprise Value (EBITDA and Sales are pre-financing-cost metrics) while P/E uses Equity Value (net income is post-interest, i.e. already capital-structure-dependent) — mixing an equity-value multiple with a pre-financing metric double-counts or omits the debt effect.",
  },
  {
    id: "lbo-walkthrough",
    category: "Valuation & Technicals",
    firmTypes: ["bulge-bracket-ib", "elite-boutique-ib"],
    question: "Walk me through an LBO, and what are the three levers that drive returns?",
    answer:
      "Sources & uses (debt vs. sponsor equity, ~60-70% debt typical), build a debt paydown schedule off the company's own free cash flow, project an exit multiple (usually flat to entry, conservatively), back out IRR/MOIC. The three return levers: debt paydown, multiple expansion (not guaranteed), and EBITDA growth. A strong answer names which lever is doing the most work in a specific deal.",
  },
  {
    id: "accretion-dilution",
    category: "Valuation & Technicals",
    firmTypes: ["bulge-bracket-ib", "elite-boutique-ib"],
    question: "When is an M&A deal accretive vs. dilutive, and does accretive automatically mean it's a good deal?",
    answer:
      "Accretive means pro forma EPS rises above the acquirer's standalone EPS. A cash-funded deal is almost always accretive if the target is cheap enough; a stock-funded deal is accretive mainly when the acquirer's own P/E is higher than the target's (buying lower-multiple earnings with higher-multiple stock). No — accretive/dilutive is just EPS mechanics, not value creation; a strategically sound deal can be dilutive for a year or two before it pays off, and a purely accretive deal can still destroy value if the strategic logic is weak.",
  },
  {
    id: "options-theta",
    category: "Valuation & Technicals",
    firmTypes: ["bulge-bracket-ib", "asset-management"],
    question: "I own a call option and the stock doesn't move at all for a week. What happens to my option's value, and why?",
    answer:
      "It loses value, purely from time decay (theta) — with no favorable directional move to offset it, the option's time value shrinks as expiration approaches and there are fewer days left for a favorable move to happen. See Lesson 4: Options & Derivatives for the full Greeks walkthrough.",
  },
  {
    id: "rate-bond-price",
    category: "Valuation & Technicals",
    firmTypes: ["asset-management", "bulge-bracket-ib"],
    question: "Why do bond prices fall when interest rates rise?",
    answer:
      "A bond's coupon is fixed at issuance. If new bonds start being issued at a higher rate, nobody will pay full price for an old, lower-coupon bond anymore — so its price has to fall until its effective yield becomes competitive with new issuance. See Lesson 1: Fixed Income & Credit.",
  },
  {
    id: "case-market-entry",
    category: "Deal & Case",
    firmTypes: ["mbb", "other-consulting"],
    question: "A classic MBB-style case: should our client, a mid-size grocery chain, enter the meal-kit delivery market?",
    answer:
      "Structure before you calculate: market size and growth, competitive intensity, the client's own capabilities/existing assets that transfer (distribution, supplier relationships, brand trust), cost to enter and expected payback, and risk (would this cannibalize existing grocery sales?). McKinsey-style: expect the interviewer to hand you data partway through and ask you to calculate a market size or breakeven. BCG/Bain-style: you propose the structure and ask the interviewer for the data you need, section by section — practice driving the case, not just answering when prompted.",
  },
  {
    id: "case-profitability",
    category: "Deal & Case",
    firmTypes: ["mbb", "other-consulting"],
    question: "A profitability case: our client's profits have declined 20% over the past year despite stable revenue. Why, and what should they do?",
    answer:
      "Profit = Revenue − Costs, so if revenue is stable, the whole story is on the cost side (or a revenue-mix shift hiding under stable top-line, e.g. selling more of a lower-margin product). Structure: break costs into fixed vs. variable, and into major categories (COGS, labor, overhead, marketing) — ask for data on each, look for the one line that moved. This is the single most common consulting case archetype; the skill being tested is issue-tree structuring under time pressure, not a memorized answer.",
  },
  {
    id: "case-real-deal",
    category: "Deal & Case",
    firmTypes: ["bulge-bracket-ib", "elite-boutique-ib", "asset-management"],
    question: "Tell me about a real M&A deal you've been following. Walk me through it.",
    answer:
      "A strong answer states the consideration mix (cash/stock), the premium paid over the undisturbed share price, the implied EV/EBITDA multiple vs. peers, how BOTH the target's and acquirer's stock reacted on announcement (the acquirer's reaction is the more informative one), and a genuine view on the strategic rationale. See Lesson 6: Reading a Real Deal for the full framework — this is a rehearsed-fluency question, not a one-off answer, so pick one real deal and know it cold.",
  },
  {
    id: "case-fx-view",
    category: "Deal & Case",
    firmTypes: ["asset-management"],
    question: "What's your current view on GBPUSD, and why?",
    answer:
      "A strong structure: (1) rate differential — which central bank is more hawkish right now (check this site's own Central Bank Room for real current rates), (2) growth differential, (3) risk sentiment (risk-on typically favors higher-yielding currencies), (4) flows/positioning (trade balances, large capital flows). Name which input you're weighting most and why — a framework beats a directional guess with no reasoning. See Lesson 5: FX as an Asset Class.",
  },
];

export type PymetricsGame = {
  id: string;
  name: string;
  measures: string;
  description: string;
  playable: boolean;
};

export const PYMETRICS_GAMES: PymetricsGame[] = [
  {
    id: "balloon",
    name: "Balloon Game",
    measures: "Risk tolerance",
    description:
      "Inflate a virtual balloon in small increments. Each pump adds a small amount to your banked total for that balloon, but the balloon can pop at any time, losing everything pumped into it so far. Cash out any time to lock in that balloon's total and move to the next one. Real users: JPMorgan, Unilever, Mastercard, and others.",
    playable: true,
  },
  {
    id: "money-exchange-1",
    name: "Money Exchange Game (Trust)",
    measures: "Trust & fairness",
    description:
      "You're given a small sum and decide how much to send to an anonymous counterpart; whatever you send gets multiplied, and the counterpart decides how much to send back. Measures your baseline trust in a stranger's reciprocity.",
    playable: false,
  },
  {
    id: "money-exchange-2",
    name: "Money Exchange Game (Reciprocity)",
    measures: "Fairness & generosity",
    description:
      "The reverse role of the trust game — you're the one deciding how much to send back after receiving a multiplied amount. Measures how fairly you treat a counterpart when you hold the power in the exchange.",
    playable: false,
  },
  {
    id: "keypress",
    name: "Keypress Game",
    measures: "Sustained attention",
    description:
      "Press a key as fast as possible when you see one shape, and withhold pressing for a different shape, over several minutes. Measures sustained attention and impulse control under monotony.",
    playable: false,
  },
  {
    id: "digits",
    name: "Digits Game",
    measures: "Working memory",
    description:
      "A sequence of digits flashes briefly; you type back as much of the sequence as you can recall, with sequences growing longer. A fairly direct working-memory span test.",
    playable: false,
  },
  {
    id: "arrows",
    name: "Arrows Game",
    measures: "Attention & focus",
    description:
      "Identify the direction a central arrow points while ignoring flanking arrows pointing a different direction (a classic \"flanker task\"). Measures selective attention under distraction.",
    playable: false,
  },
  {
    id: "lengths",
    name: "Lengths Game",
    measures: "Perception",
    description: "Quickly judge which of two lines is longer, repeated rapidly. Measures perceptual speed and accuracy under time pressure.",
    playable: false,
  },
  {
    id: "cards",
    name: "Cards Game",
    measures: "Reward sensitivity",
    description:
      "Choose cards from different decks with different, initially-unknown risk/reward profiles across many rounds — a version of the well-known Iowa Gambling Task. Measures how you learn from wins and losses over time.",
    playable: false,
  },
  {
    id: "tower",
    name: "Tower Game",
    measures: "Planning",
    description:
      "Rearrange stacked disks across pegs to match a target configuration in the minimum number of moves (a version of the Tower of London task). Measures forward planning ability.",
    playable: false,
  },
  {
    id: "hard-or-easy",
    name: "Hard or Easy Game",
    measures: "Motivation & effort",
    description:
      "Repeatedly choose between an easy, low-reward task and a hard, high-reward task. Measures how reward size changes your willingness to exert effort.",
    playable: false,
  },
  {
    id: "stop",
    name: "Stop Game",
    measures: "Impulse control",
    description:
      "Respond quickly to a repeating stimulus, then withhold your response entirely when a stop signal appears. A classic \"stop-signal task\" measuring impulse inhibition.",
    playable: false,
  },
  {
    id: "faces",
    name: "Faces Game",
    measures: "Emotional recognition",
    description: "Quickly identify the emotion shown in a series of human facial expressions. Measures speed and accuracy of emotional recognition.",
    playable: false,
  },
];

export type HireVuePrompt = {
  id: string;
  category: "Behavioral" | "Technical" | "Motivational";
  firmTypes: string[];
  prompt: string;
  tip: string;
};

export const HIREVUE_PROMPTS: HireVuePrompt[] = [
  {
    id: "why-this-firm",
    category: "Motivational",
    firmTypes: ["bulge-bracket-ib", "elite-boutique-ib", "asset-management", "mbb", "other-consulting"],
    prompt: "Why do you want to work at this firm specifically, and not one of our competitors?",
    tip: "Name something real and specific — a deal, a fund, a practice area, a person you've spoken to — not \"strong culture\" or \"great people,\" which every firm claims about itself.",
  },
  {
    id: "why-ib",
    category: "Motivational",
    firmTypes: ["bulge-bracket-ib", "elite-boutique-ib"],
    prompt: "Why investment banking, and not consulting or asset management?",
    tip: "A strong answer contrasts the actual day-to-day (deal execution, pitch books, live transactions) against the alternatives you're implicitly ruling out — showing you understand the real difference, not just that banking sounds prestigious.",
  },
  {
    id: "walk-through-resume",
    category: "Behavioral",
    firmTypes: ["bulge-bracket-ib", "elite-boutique-ib", "asset-management", "mbb", "other-consulting"],
    prompt: "Walk me through your resume.",
    tip: "Practice a tight 90-second version. Chronological, but every sentence should build toward why you're a fit for this specific seat — cut anything that doesn't.",
  },
  {
    id: "conflict-team",
    category: "Behavioral",
    firmTypes: ["bulge-bracket-ib", "elite-boutique-ib", "asset-management", "mbb", "other-consulting"],
    prompt: "Tell me about a time you disagreed with someone on a team. What happened, and what was the outcome?",
    tip: "Use a real, specific example with a real outcome — including what you'd do differently, if relevant. Structure it: situation, your specific action, the result. Vague or hypothetical answers read as unprepared.",
  },
  {
    id: "failure",
    category: "Behavioral",
    firmTypes: ["bulge-bracket-ib", "elite-boutique-ib", "asset-management", "mbb", "other-consulting"],
    prompt: "Tell me about a time you failed at something. What did you learn?",
    tip: "Pick a genuine failure with real stakes, not a humble-brag disguised as a failure (\"I worked too hard\"). The learning should be specific and something you can show evidence of having actually applied since.",
  },
  {
    id: "leadership",
    category: "Behavioral",
    firmTypes: ["bulge-bracket-ib", "elite-boutique-ib", "mbb", "other-consulting"],
    prompt: "Describe a time you led a team or project under a tight deadline.",
    tip: "Quantify it where you can (team size, deadline length, outcome) — specific numbers make an answer far more credible on video than general description.",
  },
  {
    id: "why-you",
    category: "Motivational",
    firmTypes: ["bulge-bracket-ib", "elite-boutique-ib", "asset-management", "mbb", "other-consulting"],
    prompt: "Why should we hire you over another candidate with a similar background?",
    tip: "Answer with something genuinely differentiating and demonstrable (a specific project, a specific skill you can point to evidence of) rather than generic traits like \"hardworking\" or \"passionate,\" which are unfalsifiable and forgettable.",
  },
  {
    id: "market-view",
    category: "Technical",
    firmTypes: ["asset-management", "bulge-bracket-ib"],
    prompt: "Pitch me a stock — long or short — in two minutes.",
    tip: "Structure: the thesis in one sentence, 2-3 supporting data points, the main risk to your thesis, and what would make you wrong. This site's own Pitch Builder is built for exactly this practice — use it to build a real one before trying this cold.",
  },
  {
    id: "recent-deal",
    category: "Technical",
    firmTypes: ["bulge-bracket-ib", "elite-boutique-ib"],
    prompt: "Tell me about a recent deal in the news and why you think the acquirer did it.",
    tip: "See Lesson 6: Reading a Real Deal for the exact framework — consideration mix, premium, multiple, both stocks' reactions, and a genuine view on the strategic logic.",
  },
  {
    id: "case-prompt",
    category: "Technical",
    firmTypes: ["mbb", "other-consulting"],
    prompt: "Our client is a national coffee chain considering entering the packaged-grocery aisle. How would you think about this?",
    tip: "State your structure out loud before diving in — market size/growth, competitive intensity, client capability fit, financial viability, risk. On video, narrating your structure matters more than it would face to face, since the interviewer can't nod you along.",
  },
  {
    id: "handle-pressure",
    category: "Behavioral",
    firmTypes: ["bulge-bracket-ib", "elite-boutique-ib", "other-consulting"],
    prompt: "Describe a high-pressure situation with a tight deadline and how you handled it.",
    tip: "Banking and Big 4 interviewers are listening for evidence you can sustain long hours calmly, not just that you survived one busy week — pick an example with real stakes.",
  },
  {
    id: "weakness",
    category: "Behavioral",
    firmTypes: ["bulge-bracket-ib", "elite-boutique-ib", "asset-management", "mbb", "other-consulting"],
    prompt: "What's a genuine weakness of yours, and what are you doing about it?",
    tip: "A real weakness with a real, ongoing corrective action beats a disguised strength (\"I'm too much of a perfectionist\") every time — interviewers have heard the disguised version thousands of times.",
  },
];
