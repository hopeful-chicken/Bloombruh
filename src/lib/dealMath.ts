// Pure financial-modeling math for the LBO and M&A calculator blocks. No
// fetching, no React — just the same formulas an analyst would build in
// Excel, so these are genuinely computed rather than looked up. All
// inputs are numbers the student enters (or that get auto-filled from
// SEC fundamentals where available); every function tolerates missing/
// invalid inputs by returning null rather than NaN or a misleading 0.

function toNumber(v: string): number | null {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

export type LboInputs = {
  entryEbitda: string;
  entryMultiple: string;
  exitMultiple: string;
  leverageMultiple: string;
  years: string;
  ebitdaGrowthPct: string;
  debtPaydownPct: string;
};

export type LboResult = {
  entryEv: number;
  entryDebt: number;
  entryEquity: number;
  exitEbitda: number;
  exitEv: number;
  exitDebt: number;
  exitEquity: number;
  moic: number;
  irrPct: number;
};

/**
 * A simplified but real LBO model: entry EV from an EBITDA multiple,
 * entry debt from a leverage multiple, EBITDA grown at an assumed rate
 * to exit, exit EV from an exit multiple, and debt paid down by a flat
 * assumed percentage over the hold (a simplification for "cash sweep" —
 * real models build a full debt schedule, but this captures the core
 * mechanic: leverage + EBITDA growth + multiple change drive equity
 * returns).
 */
export function computeLbo(inputs: LboInputs): LboResult | null {
  const entryEbitda = toNumber(inputs.entryEbitda);
  const entryMultiple = toNumber(inputs.entryMultiple);
  const exitMultiple = toNumber(inputs.exitMultiple);
  const leverageMultiple = toNumber(inputs.leverageMultiple);
  const years = toNumber(inputs.years);
  const ebitdaGrowthPct = toNumber(inputs.ebitdaGrowthPct);
  const debtPaydownPct = toNumber(inputs.debtPaydownPct);

  if (
    entryEbitda === null ||
    entryMultiple === null ||
    exitMultiple === null ||
    leverageMultiple === null ||
    years === null ||
    years <= 0 ||
    ebitdaGrowthPct === null ||
    debtPaydownPct === null
  ) {
    return null;
  }

  const entryEv = entryEbitda * entryMultiple;
  const entryDebt = entryEbitda * leverageMultiple;
  const entryEquity = entryEv - entryDebt;
  if (entryEquity <= 0) return null;

  const exitEbitda = entryEbitda * Math.pow(1 + ebitdaGrowthPct / 100, years);
  const exitEv = exitEbitda * exitMultiple;
  const exitDebt = entryDebt * (1 - debtPaydownPct / 100);
  const exitEquity = exitEv - exitDebt;

  const moic = exitEquity / entryEquity;
  const irrPct = (Math.pow(moic, 1 / years) - 1) * 100;

  return { entryEv, entryDebt, entryEquity, exitEbitda, exitEv, exitDebt, exitEquity, moic, irrPct };
}

export type MandaInputs = {
  acquirerNetIncome: string;
  acquirerShares: string;
  acquirerSharePrice: string;
  acquirerDebt: string;
  acquirerEbitda: string;
  targetNetIncome: string;
  targetShares: string;
  targetStockholdersEquity: string;
  targetDebt: string;
  targetEbitda: string;
  targetCurrentPrice: string;
  offerPricePerShare: string;
  cashPct: string;
  newDebtRaised: string;
  interestRatePct: string;
  taxRatePct: string;
  synergiesPreTax: string;
};

export type MandaResult = {
  dealValue: number;
  premiumPct: number | null;
  cashConsideration: number;
  stockConsideration: number;
  newSharesIssued: number;
  proFormaShares: number;
  synergiesAfterTax: number;
  newDebtInterestAfterTax: number;
  standaloneAcquirerEps: number | null;
  proFormaEps: number | null;
  accretionDilutionPct: number | null;
  goodwill: number | null;
  proFormaDebt: number | null;
  proFormaEbitda: number | null;
  proFormaLeverage: number | null;
};

/**
 * Standard accretion/dilution math: pro-forma combined net income (adding
 * after-tax synergies, subtracting after-tax interest on any new deal
 * debt) divided by pro-forma shares (existing acquirer shares + new
 * shares issued to fund the stock portion), compared against the
 * acquirer's standalone EPS. Goodwill = deal value paid over the
 * target's book equity. Pro-forma leverage = combined debt / combined
 * EBITDA (including run-rate synergies, as is conventional).
 */
export function computeManda(inputs: MandaInputs): MandaResult | null {
  const acquirerNetIncome = toNumber(inputs.acquirerNetIncome);
  const acquirerShares = toNumber(inputs.acquirerShares);
  const acquirerSharePrice = toNumber(inputs.acquirerSharePrice);
  const targetShares = toNumber(inputs.targetShares);
  const offerPricePerShare = toNumber(inputs.offerPricePerShare);
  const cashPct = toNumber(inputs.cashPct);
  const taxRatePct = toNumber(inputs.taxRatePct);

  if (
    acquirerShares === null ||
    targetShares === null ||
    offerPricePerShare === null ||
    cashPct === null ||
    taxRatePct === null
  ) {
    return null;
  }

  const targetNetIncome = toNumber(inputs.targetNetIncome);
  const targetCurrentPrice = toNumber(inputs.targetCurrentPrice);
  const targetStockholdersEquity = toNumber(inputs.targetStockholdersEquity);
  const acquirerDebt = toNumber(inputs.acquirerDebt);
  const targetDebt = toNumber(inputs.targetDebt);
  const acquirerEbitda = toNumber(inputs.acquirerEbitda);
  const targetEbitda = toNumber(inputs.targetEbitda);
  const newDebtRaised = toNumber(inputs.newDebtRaised) ?? 0;
  const interestRatePct = toNumber(inputs.interestRatePct) ?? 0;
  const synergiesPreTax = toNumber(inputs.synergiesPreTax) ?? 0;

  const dealValue = offerPricePerShare * targetShares;
  const premiumPct =
    targetCurrentPrice !== null && targetCurrentPrice > 0
      ? ((offerPricePerShare - targetCurrentPrice) / targetCurrentPrice) * 100
      : null;

  const cashConsideration = dealValue * (cashPct / 100);
  const stockConsideration = dealValue * (1 - cashPct / 100);
  const newSharesIssued =
    acquirerSharePrice !== null && acquirerSharePrice > 0
      ? stockConsideration / acquirerSharePrice
      : 0;
  const proFormaShares = acquirerShares + newSharesIssued;

  const synergiesAfterTax = synergiesPreTax * (1 - taxRatePct / 100);
  const newDebtInterestAfterTax =
    newDebtRaised * (interestRatePct / 100) * (1 - taxRatePct / 100);

  const standaloneAcquirerEps =
    acquirerNetIncome !== null && acquirerShares > 0
      ? acquirerNetIncome / acquirerShares
      : null;

  const proFormaEps =
    acquirerNetIncome !== null && targetNetIncome !== null && proFormaShares > 0
      ? (acquirerNetIncome + targetNetIncome + synergiesAfterTax - newDebtInterestAfterTax) /
        proFormaShares
      : null;

  const accretionDilutionPct =
    proFormaEps !== null && standaloneAcquirerEps !== null && standaloneAcquirerEps !== 0
      ? ((proFormaEps - standaloneAcquirerEps) / standaloneAcquirerEps) * 100
      : null;

  const goodwill =
    targetStockholdersEquity !== null ? dealValue - targetStockholdersEquity : null;

  const proFormaDebt =
    acquirerDebt !== null && targetDebt !== null
      ? acquirerDebt + targetDebt + newDebtRaised
      : null;

  const proFormaEbitda =
    acquirerEbitda !== null && targetEbitda !== null
      ? acquirerEbitda + targetEbitda + synergiesPreTax
      : null;

  const proFormaLeverage =
    proFormaDebt !== null && proFormaEbitda !== null && proFormaEbitda !== 0
      ? proFormaDebt / proFormaEbitda
      : null;

  return {
    dealValue,
    premiumPct,
    cashConsideration,
    stockConsideration,
    newSharesIssued,
    proFormaShares,
    synergiesAfterTax,
    newDebtInterestAfterTax,
    standaloneAcquirerEps,
    proFormaEps,
    accretionDilutionPct,
    goodwill,
    proFormaDebt,
    proFormaEbitda,
    proFormaLeverage,
  };
}
