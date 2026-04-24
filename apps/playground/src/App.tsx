import React, { useEffect, useState } from 'react'
import { I18nProvider, useI18n, LanguageSwitcher } from '../../../libs/ui-components/src/i18n'
import './App.css'

type RouteId = 'overview' | 'components' | 'bridge'

const routeConfig: { id: RouteId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'components', label: 'Components' },
  { id: 'bridge', label: 'Bridge Flow' },
]

const getRouteFromHash = (): RouteId => {
  const hash = window.location.hash.replace('#', '') as RouteId
  return routeConfig.some((route) => route.id === hash) ? hash : 'overview'
}

const BridgeFlowTester = () => {
  const { t } = useI18n()
  const [status, setStatus] = useState<'idle' | 'bridging' | 'success' | 'error'>('idle')

  const handleBridge = () => {
    setStatus('bridging')
    setTimeout(() => {
      setStatus('success')
    }, 2000)
  }

  return (
    <div className="card">
      <h3>{t('bridge.title')}</h3>
      <div className="form-group">
        <label>{t('bridge.source')}</label>
        <select className="bw-select">
          <option>Ethereum</option>
          <option>Stellar</option>
          <option>Polygon</option>
        </select>
      </div>
      <div className="form-group">
        <label>{t('bridge.destination')}</label>
        <select className="bw-select">
          <option>Stellar</option>
          <option>Ethereum</option>
          <option>Polygon</option>
        </select>
      </div>
      <div className="form-group">
        <label>{t('bridge.amount')}</label>
        <input type="number" placeholder="0.00" className="bw-input" />
      </div>
      <button
        onClick={handleBridge}
        disabled={status === 'bridging'}
        className={`bw-button ${status}`}
      >
        {status === 'bridging' ? t('common.loading') : t('bridge.transfer')}
      </button>
      {status === 'success' && <p className="success-msg">{t('common.success')}</p>}
    </div>
  )
}

function App() {
  const [route, setRoute] = useState<RouteId>('overview')

  useEffect(() => {
    setRoute(getRouteFromHash())

    const handleHashChange = () => setRoute(getRouteFromHash())
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  return (
    <I18nProvider>
      <div className="playground-container">
        <header>
          <div>
            <h1>BridgeWise Developer Playground</h1>
            <p>Navigate between demo pages using the toolbar below.</p>
          </div>
          <LanguageSwitcher />
        </header>

        <nav className="demo-nav">
          {routeConfig.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={item.id === route ? 'active' : ''}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <main>
          {route === 'overview' && (
            <section>
              <h2>Welcome</h2>
              <p>
                This playground demonstrates BridgeWise UI components and quick interactive flows.
                Choose a tab to inspect components or run a bridge test flow.
              </p>
            </section>
          )}

          {route === 'components' && (
            <section>
              <h2>Component Testing</h2>
              <div className="grid">
                <div className="card">
                  <h3>Buttons</h3>
                  <div className="flex-row">
                    <button className="bw-button primary">Primary</button>
                    <button className="bw-button secondary">Secondary</button>
                    <button className="bw-button outline">Outline</button>
                  </div>
                </div>
                <div className="card">
                  <h3>Inputs</h3>
                  <input type="text" placeholder="Default Input" className="bw-input" />
                </div>
              </div>
            </section>
          )}

          {route === 'bridge' && (
            <section>
              <h2>Bridge Flow</h2>
              <BridgeFlowTester />
            </section>
          )}
        </main>
      </div>
    </I18nProvider>
  )
}

export default App
