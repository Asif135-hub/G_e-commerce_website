import { useState } from 'react'
import Header from './components/Header'
import ProductCard from './components/ProductCard'

const products = [
  {
    id: 1,
    name: 'Classic T-Shirt',
    price: 24.99,
    description: 'A comfortable cotton T-shirt for everyday wear.',
  },
  {
    id: 2,
    name: 'Everyday Backpack',
    price: 49.99,
    description: 'A practical backpack for your daily essentials.',
  },
  {
    id: 3,
    name: 'Running Shoes',
    price: 79.99,
    description: 'Lightweight shoes for your daily activities.',
  },
]

function App() {
  const [cartCount, setCartCount] = useState(0)

function handleAddToCart() {
  setCartCount((currentCount) => currentCount + 1)
}
  return (
    <div className="min-h-screen bg-slate-100">
      <Header cartCount={cartCount} />

      <main className="p-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Our Products
        </h1>
        <p className="mt-2 text-slate-600">
          Discover something you’ll love.
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              price={product.price}
              description={product.description}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </main>
    </div>
  )
}


export default App