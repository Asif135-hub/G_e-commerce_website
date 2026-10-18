function Header({ cartCount }) {
  return (
    <header className="flex items-center justify-between bg-white px-8 py-4 shadow-sm">
      <a href="/" className="text-2xl font-bold text-blue-600">
        MyStore
      </a>

      <button
        type="button"
        className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Cart ({cartCount})
      </button>
    </header>
  )
}

export default Header