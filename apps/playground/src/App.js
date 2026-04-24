"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const i18n_1 = require("../../../libs/ui-components/src/i18n");
require("./App.css");
const routeConfig = [
    { id: 'overview', label: 'Overview' },
    { id: 'components', label: 'Components' },
    { id: 'bridge', label: 'Bridge Flow' },
];
const getRouteFromHash = () => {
    const hash = window.location.hash.replace('#', '');
    return routeConfig.some((route) => route.id === hash) ? hash : 'overview';
};
const BridgeFlowTester = () => {
    const { t } = (0, i18n_1.useI18n)();
    const [status, setStatus] = (0, react_1.useState)('idle');
    const handleBridge = () => {
        setStatus('bridging');
        setTimeout(() => {
            setStatus('success');
        }, 2000);
    };
    return (<div className="card">
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
        <input type="number" placeholder="0.00" className="bw-input"/>
      </div>
      <button onClick={handleBridge} disabled={status === 'bridging'} className={`bw-button ${status}`}>
        {status === 'bridging' ? t('common.loading') : t('bridge.transfer')}
      </button>
      {status === 'success' && <p className="success-msg">{t('common.success')}</p>}
    </div>);
};
function App() {
    const [route, setRoute] = (0, react_1.useState)('overview');
    (0, react_1.useEffect)(() => {
        setRoute(getRouteFromHash());
        const handleHashChange = () => setRoute(getRouteFromHash());
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);
    return (<i18n_1.I18nProvider>
      <div className="playground-container">
        <header>
          <div>
            <h1>BridgeWise Developer Playground</h1>
            <p>Navigate between demo pages using the toolbar below.</p>
          </div>
          <i18n_1.LanguageSwitcher />
        </header>

        <nav className="demo-nav">
          {routeConfig.map((item) => (<a key={item.id} href={`#${item.id}`} className={item.id === route ? 'active' : ''}>
              {item.label}
            </a>))}
        </nav>

        <main>
          {route === 'overview' && (<section>
              <h2>Welcome</h2>
              <p>
                This playground demonstrates BridgeWise UI components and quick interactive flows.
                Choose a tab to inspect components or run a bridge test flow.
              </p>
            </section>)}

          {route === 'components' && (<section>
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
                  <input type="text" placeholder="Default Input" className="bw-input"/>
                </div>
              </div>
            </section>)}

          {route === 'bridge' && (<section>
              <h2>Bridge Flow</h2>
              <BridgeFlowTester />
            </section>)}
        </main>
      </div>
    </i18n_1.I18nProvider>);
}
exports.default = App;
//# sourceMappingURL=App.js.map