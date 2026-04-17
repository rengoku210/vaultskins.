const noNegative = (...values) => values.every((v) => v === null || v === undefined || Number(v) >= 0);

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

  if (!noNegative(rentHour, rentDay, buyPrice)) {
    return res.status(400).json({ error: 'Pricing cannot be negative.' });
  }

  return next();
};
