function ProductCard({ name, price, description, onAddToCart }) {
  return (
    <article className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">
        {name}
      </h2>

      <p className="mt-2 text-slate-600">{description}</p>

      <p className="mt-4 text-lg font-bold text-blue-600">
        €{price.toFixed(2)}
      </p>

      <button
        type="button"
        onClick={onAddToCart}
        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Add to cart
      </button>
    </article>
  )
}

export default ProductCard