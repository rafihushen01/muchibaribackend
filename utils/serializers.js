export function publicUser(user) {
  const value = user.toJSON ? user.toJSON() : user
  return { id: value.id, full_name: value.fullName ?? value.full_name, email: value.email, phone: value.phone ?? '', address: value.address ?? '', is_admin: Boolean(value.isAdmin ?? value.is_admin), created_at: value.createdAt ?? value.created_at }
}

export function productResponse(product) {
  const value = product.toJSON ? product.toJSON() : product
  const category = product.categoryId && typeof product.categoryId === 'object' && product.categoryId.name
    ? { id: product.categoryId.id, name: product.categoryId.name, slug: product.categoryId.slug }
    : value.categories
  return { ...value, categories: category }
}

export function reviewResponse(review) {
  const value = review.toJSON ? review.toJSON() : review
  const user = review.userId && typeof review.userId === 'object' && review.userId.fullName ? review.userId : null
  const product = review.productId && typeof review.productId === 'object' && review.productId.name ? review.productId : null
  return { ...value, profiles: user ? { full_name: user.fullName } : undefined, products: product ? { name: product.name } : undefined }
}
