/**
 * Returns skip + limit values for Mongoose queries, plus pagination metadata.
 *
 * Usage in a service:
 *   const { skip, limit, currentPage } = paginate(req.query);
 *   const items = await Model.find(filter).skip(skip).limit(limit);
 *   const total = await Model.countDocuments(filter);
 *   const totalPages = Math.ceil(total / limit);
 *
 * Defaults: page=1, limit=10. Max limit capped at 50.
 */
const paginate = (query = {}) => {
  const currentPage = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 10));
  const skip = (currentPage - 1) * limit;

  return { skip, limit, currentPage };
};

export default paginate;
