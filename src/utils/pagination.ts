const MAX_TAKE_PER_QUERY = 30;

export const formatTake = (value: number): number => {
  let x = Number(value);
  if (x > MAX_TAKE_PER_QUERY || Number.isNaN(x)) {
    x = MAX_TAKE_PER_QUERY;
  }

  return x;
};

export const formatPage = (value: number): number => Number(value) || 1;
