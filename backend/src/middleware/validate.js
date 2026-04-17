const toNullableNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

export const validateListingPayload = (req, res, next) => {
  const {
    title,
    description,
    riotId,
    riotPassword,
    contactEmail,
    rentHour,
    rentDay,
    buyPrice,
    listingType
  } = req.body;

  if (!title || !description || !riotId || !riotPassword || !contactEmail || !listingType) {
    return res.status(400).json({ error: 'Missing required listing fields.' });
  }

  if (!['rent', 'sell', 'both'].includes(listingType)) {
    return res.status(400).json({ error: 'Invalid listing type.' });
  }

  const normalizedRentHour = toNullableNumber(rentHour);
  const normalizedRentDay = toNullableNumber(rentDay);
  const normalizedBuyPrice = toNullableNumber(buyPrice);

  if ([normalizedRentHour, normalizedRentDay, normalizedBuyPrice].some(Number.isNaN)) {
    return res.status(400).json({ error: 'Prices must be valid numbers.' });
  }

  if ([normalizedRentHour, normalizedRentDay, normalizedBuyPrice].some((value) => value !== null && value < 0)) {
    return res.status(400).json({ error: 'Pricing cannot be negative.' });
  }

  const hasRentPrice = normalizedRentHour !== null || normalizedRentDay !== null;
  if (listingType === 'rent' && !hasRentPrice) {
    return res.status(400).json({ error: 'Rent listings require rent/hour or rent/day price.' });
  }

  if (listingType === 'sell' && normalizedBuyPrice === null) {
    return res.status(400).json({ error: 'Sell listings require buy price.' });
  }

  if (listingType === 'both' && (!hasRentPrice || normalizedBuyPrice === null)) {
    return res.status(400).json({ error: 'Both listings require rent and buy prices.' });
  }

  req.body.rentHour = normalizedRentHour;
  req.body.rentDay = normalizedRentDay;
  req.body.buyPrice = normalizedBuyPrice;

  return next();
};
