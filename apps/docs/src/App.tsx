import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

type RouteId = 'home' | 'counter' | 'resources'

const routes: { id: RouteId; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'counter', label: 'Counter' },
  { id: 'resources', label: 'Resources' },
]

const getRouteFromHash = (): RouteId => {
  const hash = window.location.hash.replace('#', '') as RouteId
  return routes.some((route) => route.id === hash) ? hash : 'home'
}

function App() {
  const [count, setCount] = useState(0)
  const [route, setRoute] = useState<RouteId>('home')

  useEffect(() => {
    setRoute(getRouteFromHash())

    const handleHashChange = () => {
      setRoute(getRouteFromHash())
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  return (
    <div className="app-shell">
      <header className="page-header">
        <h1>BridgeWise Demo Docs</h1>
        <nav className="page-nav">
          {routes.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={item.id === route ? 'active' : ''}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <main>
        {route === 'home' && (
          <section className="page-section">
            <div className="logo-row">
              <a href="https://vite.dev" target="_blank" rel="noreferrer">
                <img src={viteLogo} className="logo" alt="Vite logo" />
              </a>
              <a href="https://react.dev" target="_blank" rel="noreferrer">
                <img src={reactLogo} className="logo react" alt="React logo" />
              </a>
            </div>
            <h2>Vite + React Demo</h2>
            <p>
              Use the navigation links above to explore interactive demo sections.
            </p>
          </section>
        )}

        {route === 'counter' && (
          <section className="page-section">
            <h2>Interactive Counter</h2>
            <div className="card">
              <button onClick={() => setCount((count) => count + 1)}>
                count is {count}
              </button>
              <p>
                Edit <code>src/App.tsx</code> and save to test HMR
              </p>
            </div>
          </section>
        )}

        {route === 'resources' && (
          <section className="page-section">
            <h2>Resources</h2>
            <ul>
              <li>
                <a href="https://vite.dev" target="_blank" rel="noreferrer">
                  Vite Documentation
                </a>
              </li>
              <li>
                <a href="https://react.dev" target="_blank" rel="noreferrer">
                  React Documentation
                </a>
              </li>
              <li>
                <a href="https://github.com/MDTechLabs/BridgeWise" target="_blank" rel="noreferrer">
                  BridgeWise Repository
                </a>
              </li>
            </ul>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
