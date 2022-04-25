export const createUserStub = (pln: number, usd: number, eur: number) => {
  return {
    pln: {
      value: pln || 0,
    },
    eur: {
      value: eur || 0,
    },
    usd: {
      value: usd || 0,
    },
  };
};
