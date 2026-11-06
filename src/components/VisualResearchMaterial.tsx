import React, { useState } from 'react';
import { ResearchItem } from '../types/research';
import { Eye, Database, GitBranch, Layers, MapPin, Activity, Sliders, CheckCircle2 } from 'lucide-react';

interface VisualResearchMaterialProps {
  item: ResearchItem;
}

export const VisualResearchMaterial: React.FC<VisualResearchMaterialProps> = ({ item }) => {
  // State for interactive widgets
  const [selectedCluster, setSelectedCluster] = useState<string>('pos');
  const [nudgeScenario, setNudgeScenario] = useState<'control' | 'availability' | 'points' | 'combined'>('combined');
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [selectedSchemaTable, setSelectedSchemaTable] = useState<'products' | 'consortia' | 'regions'>('products');
  const [activeDigitalStage, setActiveDigitalStage] = useState<number>(1);
  const [activeCrop, setActiveCrop] = useState<string>('buckwheat');

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Section Header */}
      <div className="border-b border-[#141414]/15 pb-3 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B]">
            VISUAL RESEARCH EVIDENCE · FIG. ARCH-{item.number}
          </span>
          <h3 className="font-serif text-lg font-medium text-[#141414] mt-0.5">
            {item.visualMaterial.title}
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 border border-[#141414]/20 uppercase">
          {item.visualMaterial.type}
        </span>
      </div>

      {/* Primary Interactive Scientific Canvas */}
      <div className="w-full rounded-[2px] border border-[#141414]/15 bg-[#EDEBE6] p-4 md:p-6 overflow-hidden">
        {/* ITEM 01: PRISMA & Bibliometric Synthesis Network */}
        {item.id === 'item-01' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#77736B]">INTERACTIVE CORPUS CLUSTER EXPLORER:</span>
              <div className="flex gap-1">
                {(['pos', 'loyalty', 'wearables', 'nutrition'] as const).map((k) => (
                  <button
                    key={k}
                    onClick={() => setSelectedCluster(k)}
                    className={`px-2 py-0.5 text-[11px] font-mono border transition-colors ${
                      selectedCluster === k
                        ? 'bg-[#1F3FB0] text-white border-[#1F3FB0]'
                        : 'bg-white text-[#141414] border-[#141414]/20 hover:border-[#141414]'
                    }`}
                  >
                    {k.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual SVG Network Graph */}
            <div className="relative w-full h-56 bg-white border border-[#141414]/10 rounded flex items-center justify-center p-2">
              <svg viewBox="0 0 400 200" className="w-full h-full">
                {/* Background grid */}
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#F0EFEA" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="400" height="200" fill="url(#grid)" />

                {/* Connecting Lines */}
                <line x1="80" y1="100" x2="160" y2="70" stroke={selectedCluster === 'pos' ? '#1F3FB0' : '#D1D5DB'} strokeWidth={selectedCluster === 'pos' ? 2 : 1} strokeDasharray={selectedCluster === 'pos' ? 'none' : '2 2'} />
                <line x1="80" y1="100" x2="160" y2="130" stroke={selectedCluster === 'loyalty' ? '#1F3FB0' : '#D1D5DB'} strokeWidth={selectedCluster === 'loyalty' ? 2 : 1} />
                <line x1="160" y1="70" x2="260" y2="80" stroke="#9CA3AF" strokeWidth="1" />
                <line x1="160" y1="130" x2="260" y2="80" stroke="#9CA3AF" strokeWidth="1" />
                <line x1="260" y1="80" x2="330" y2="60" stroke={selectedCluster === 'nutrition' ? '#536B52' : '#D1D5DB'} strokeWidth={2} />
                <line x1="260" y1="80" x2="330" y2="120" stroke={selectedCluster === 'wearables' ? '#1F3FB0' : '#D1D5DB'} strokeWidth={2} />

                {/* Primary Nodes */}
                <g className="cursor-pointer" onClick={() => setSelectedCluster('pos')}>
                  <circle cx="80" cy="100" r={selectedCluster === 'pos' ? 24 : 18} fill={selectedCluster === 'pos' ? '#1F3FB0' : '#3B82F6'} fillOpacity="0.15" stroke="#1F3FB0" strokeWidth="2" />
                  <circle cx="80" cy="100" r="4" fill="#1F3FB0" />
                  <text x="80" y="104" textAnchor="middle" fontSize="9" fontWeight="bold" fontFamily="monospace" fill="#141414">POS</text>
                  <text x="80" y="132" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="#77736B">Scanner Data</text>
                </g>

                <g className="cursor-pointer" onClick={() => setSelectedCluster('loyalty')}>
                  <circle cx="160" cy="130" r={selectedCluster === 'loyalty' ? 22 : 16} fill={selectedCluster === 'loyalty' ? '#1F3FB0' : '#60A5FA'} fillOpacity="0.15" stroke="#1F3FB0" strokeWidth="1.5" />
                  <circle cx="160" cy="130" r="3.5" fill="#1F3FB0" />
                  <text x="160" y="133" textAnchor="middle" fontSize="8" fontWeight="bold" fontFamily="monospace" fill="#141414">LOYALTY</text>
                  <text x="160" y="158" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="#77736B">Card Telemetry</text>
                </g>

                <g className="cursor-pointer" onClick={() => setSelectedCluster('wearables')}>
                  <circle cx="330" cy="120" r={selectedCluster === 'wearables' ? 22 : 16} fill={selectedCluster === 'wearables' ? '#1F3FB0' : '#93C5FD'} fillOpacity="0.15" stroke="#1F3FB0" strokeWidth="1.5" />
                  <circle cx="330" cy="120" r="3" fill="#1F3FB0" />
                  <text x="330" y="123" textAnchor="middle" fontSize="8" fontWeight="bold" fontFamily="monospace" fill="#141414">SENSORS</text>
                  <text x="330" y="146" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="#77736B">Wearable Streams</text>
                </g>

                <g className="cursor-pointer" onClick={() => setSelectedCluster('nutrition')}>
                  <circle cx="330" cy="60" r={selectedCluster === 'nutrition' ? 24 : 18} fill={selectedCluster === 'nutrition' ? '#536B52' : '#86EFAC'} fillOpacity="0.2" stroke="#536B52" strokeWidth="2" />
                  <circle cx="330" cy="60" r="4" fill="#536B52" />
                  <text x="330" y="63" textAnchor="middle" fontSize="8" fontWeight="bold" fontFamily="monospace" fill="#536B52">SUSTAIN</text>
                  <text x="330" y="40" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="#536B52">Dietary Index</text>
                </g>

                {/* Central Synthesizing Node */}
                <circle cx="260" cy="80" r="26" fill="#141414" fillOpacity="0.05" stroke="#141414" strokeWidth="1.5" strokeDasharray="3 3" />
                <circle cx="260" cy="80" r="4" fill="#141414" />
                <text x="260" y="83" textAnchor="middle" fontSize="8" fontWeight="bold" fontFamily="monospace" fill="#141414">SYNTHESIS</text>
              </svg>
            </div>

            {/* Evidence Callout */}
            <div className="bg-white p-3 border border-[#141414]/15 text-xs font-mono">
              <span className="text-[#1F3FB0] font-semibold">SYNTHESIS NOTE: </span>
              {selectedCluster === 'pos' &&
                'High-frequency point-of-sale scanner data effectively removes survey recall bias, capturing instant weekly substitution between high-carbon and plant-based staples.'}
              {selectedCluster === 'loyalty' &&
                'Loyalty card logs enable multi-year household panel tracking, uncovering how inflation shocks disproportionately trigger organic-to-conventional downgrades.'}
              {selectedCluster === 'wearables' &&
                'Continuous biometric data (glucose, sleep, activity) links food procurement directly with postprandial physiological metrics.'}
              {selectedCluster === 'nutrition' &&
                'Planetary-Health EAT-Lancet dietary indexes mapped against transaction baskets quantify macro-environmental footprints with 0.82 validation r.'}
            </div>
          </div>
        )}

        {/* ITEM 02: Digital Food Interactions Touchpoint Model */}
        {item.id === 'item-02' && (
          <div className="flex flex-col gap-4">
            <span className="text-xs font-mono text-[#77736B]">
              COGNITIVE DECISION STAGES IN DIGITAL GROCERY ENVIRONMENTS:
            </span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
              {[
                { stage: 1, name: 'Search & Sort', heuristic: 'Default ranking bias', impact: '-46% Eco Visibility' },
                { stage: 2, name: 'Product View', heuristic: 'Screen real estate', impact: 'Heuristic shortcutting' },
                { stage: 3, name: 'Basket Adding', heuristic: 'Algorithmic bundles', impact: 'Impulse add-ons' },
                { stage: 4, name: 'One-Click Pay', heuristic: 'Frictionless exit', impact: 'Supressed deliberation' },
              ].map((s) => (
                <button
                  key={s.stage}
                  onClick={() => setActiveDigitalStage(s.stage)}
                  className={`p-2.5 text-left border transition-all ${
                    activeDigitalStage === s.stage
                      ? 'bg-white border-[#1F3FB0] shadow-sm'
                      : 'bg-white/60 border-[#141414]/15 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-[#77736B]">
                    <span>0{s.stage}</span>
                    {activeDigitalStage === s.stage && <div className="w-1.5 h-1.5 bg-[#1F3FB0] rounded-full" />}
                  </div>
                  <div className="font-semibold text-[#141414] mt-1">{s.name}</div>
                  <div className="text-[10px] text-[#1F3FB0] mt-1">{s.impact}</div>
                </button>
              ))}
            </div>

            <div className="bg-white p-3.5 border border-[#141414]/15 text-xs font-mono flex items-start gap-3">
              <Activity className="w-4 h-4 text-[#1F3FB0] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#141414]">STAGE 0{activeDigitalStage} EMPIRICAL IMPLICATION: </span>
                {activeDigitalStage === 1 &&
                  'Sorting by "Popularity" or "Best Selling" systematically pushes high-margin ultra-processed items above certified organic choices. Re-ranking algorithms using carbon-parity scores restores sustainable visibility by 52%.'}
                {activeDigitalStage === 2 &&
                  'Mobile screen viewports constrain cognitive comparison to top 2 items. Interactive visual tooltips showing real vehicle-km carbon savings outperform abstract gram counts by 2.1×.'}
                {activeDigitalStage === 3 &&
                  'Automated recommendation carousels trigger heuristic inertia. Adding explicit eco-swap micro-prompts ("Switch to organic wholegrain for +0.15€") achieves 31% conversion.'}
                {activeDigitalStage === 4 &&
                  'Frictionless checkouts eliminate final reflective pauses. Introducing a 5-second "Green Basket Review" summary reinforces long-term brand trust.'}
              </div>
            </div>
          </div>
        )}

        {/* ITEM 03: Social Supermarket Nudging 2x2 Factorial */}
        {item.id === 'item-03' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#77736B]">FIELD EXPERIMENT SCENARIO:</span>
              <div className="flex gap-1 flex-wrap">
                {(
                  [
                    { key: 'control', label: 'CONTROL' },
                    { key: 'availability', label: 'AVAILABILITY (50%)' },
                    { key: 'points', label: 'POINTS (+50)' },
                    { key: 'combined', label: 'COMBINED (OPTIMAL)' },
                  ] as const
                ).map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setNudgeScenario(s.key)}
                    className={`px-2 py-0.5 text-[11px] font-mono border transition-colors ${
                      nudgeScenario === s.key
                        ? 'bg-[#536B52] text-white border-[#536B52]'
                        : 'bg-white text-[#141414] border-[#141414]/20 hover:border-[#141414]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Bar Chart Representation */}
            <div className="bg-white p-4 border border-[#141414]/15 rounded flex flex-col gap-3">
              <div className="flex justify-between items-end h-28 border-b border-[#141414]/20 pb-2 px-6">
                {/* Baseline */}
                <div className="flex flex-col items-center gap-1.5 w-16">
                  <span className="text-[10px] font-mono text-[#77736B]">14.2%</span>
                  <div className="w-full bg-stone-300 rounded-t h-10 transition-all duration-300" />
                  <span className="text-[9px] font-mono uppercase text-[#77736B]">Baseline</span>
                </div>

                {/* Intervention Week 1-4 */}
                <div className="flex flex-col items-center gap-1.5 w-16">
                  <span className="text-[10px] font-mono font-bold text-[#536B52]">
                    {nudgeScenario === 'control' && '15.1% (+0.9%)'}
                    {nudgeScenario === 'availability' && '52.4% (+38.2%)'}
                    {nudgeScenario === 'points' && '42.7% (+28.5%)'}
                    {nudgeScenario === 'combined' && '68.8% (+54.6%)'}
                  </span>
                  <div
                    className="w-full bg-[#536B52] rounded-t transition-all duration-500"
                    style={{
                      height:
                        nudgeScenario === 'control'
                          ? '28px'
                          : nudgeScenario === 'availability'
                          ? '65px'
                          : nudgeScenario === 'points'
                          ? '54px'
                          : '88px',
                    }}
                  />
                  <span className="text-[9px] font-mono uppercase font-semibold text-[#141414]">Intervention</span>
                </div>

                {/* Post-Washout 4-Week Followup */}
                <div className="flex flex-col items-center gap-1.5 w-16">
                  <span className="text-[10px] font-mono text-[#1F3FB0]">
                    {nudgeScenario === 'control' && '14.5%'}
                    {nudgeScenario === 'availability' && '31.2%'}
                    {nudgeScenario === 'points' && '26.8%'}
                    {nudgeScenario === 'combined' && '35.6% (+21.4%)'}
                  </span>
                  <div
                    className="w-full bg-[#1F3FB0] rounded-t transition-all duration-500"
                    style={{
                      height:
                        nudgeScenario === 'control'
                          ? '26px'
                          : nudgeScenario === 'availability'
                          ? '42px'
                          : nudgeScenario === 'points'
                          ? '36px'
                          : '48px',
                    }}
                  />
                  <span className="text-[9px] font-mono uppercase text-[#77736B]">Washout</span>
                </div>
              </div>

              <div className="text-xs font-mono text-[#141414]">
                <span className="font-semibold text-[#536B52]">FINDING: </span>
                {nudgeScenario === 'combined' &&
                  'Combining physical shelf restructuring (50% wholegrain availability at eye level) with modest loyalty point bonuses stimulated +54.6% relative uptake, maintaining +21.4% retention after incentive cessation.'}
                {nudgeScenario === 'availability' &&
                  'Restructuring shelf space alone doubled sales without requiring any economic reward, proving frictionless choice architecture dominates consumer inertia.'}
                {nudgeScenario === 'points' &&
                  'Points alone achieved +28.5% increase, but habit decay was higher after rewards ceased unless accompanied by visible physical shelf prominence.'}
                {nudgeScenario === 'control' &&
                  'Control group showed no statistically significant shift across the 8-week monitoring period.'}
              </div>
            </div>
          </div>
        )}



        {/* ITEM 05: GI SMART Map & Value Chain */}
        {item.id === 'item-05' && (
          <div className="flex flex-col gap-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#77736B]">GI DIGITAL READINESS BENCHMARK:</span>
              <span className="text-[#1F3FB0] font-semibold">18 EUROPEAN PARTNERS</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white p-3 border border-[#141414]/15 text-center">
                <div className="text-xl font-bold font-serif text-[#1F3FB0]">32%</div>
                <div className="text-[10px] text-[#77736B] mt-1">Interactive QR Provenance</div>
              </div>
              <div className="bg-white p-3 border border-[#141414]/15 text-center">
                <div className="text-xl font-bold font-serif text-[#141414]">14%</div>
                <div className="text-[10px] text-[#77736B] mt-1">GIS Terroir Polygons</div>
              </div>
              <div className="bg-white p-3 border border-[#141414]/15 text-center">
                <div className="text-xl font-bold font-serif text-[#536B52]">89%</div>
                <div className="text-[10px] text-[#77736B] mt-1">Consumer Trust Rating</div>
              </div>
            </div>
          </div>
        )}

        {/* ITEM 06: GI Structured Database (Crawl4AI) Live Schema Explorer */}
        {item.id === 'item-06' && (
          <div className="flex flex-col gap-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#77736B]">DATABASE SCHEMA & HARVESTED RECORDS:</span>
              <div className="flex gap-1">
                {(['products', 'consortia', 'regions'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedSchemaTable(t)}
                    className={`px-2 py-0.5 text-[10px] border transition-colors ${
                      selectedSchemaTable === t
                        ? 'bg-[#1F3FB0] text-white border-[#1F3FB0]'
                        : 'bg-white text-[#141414] border-[#141414]/20'
                    }`}
                  >
                    tbl_{t}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Sample Records Table */}
            <div className="bg-white border border-[#141414]/20 overflow-x-auto text-[11px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#141414]/5 border-b border-[#141414]/15 text-[10px] uppercase text-[#77736B]">
                    <th className="p-2">GI Code</th>
                    <th className="p-2">Product Name</th>
                    <th className="p-2">Type</th>
                    <th className="p-2">Country</th>
                    <th className="p-2">Registration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#141414]/10">
                  <tr>
                    <td className="p-2 text-[#1F3FB0] font-semibold">PDO-IT-0016</td>
                    <td className="p-2 font-medium">Parmigiano Reggiano</td>
                    <td className="p-2">Cheeses (PDO)</td>
                    <td className="p-2">Italy (IT)</td>
                    <td className="p-2 text-[#77736B]">1996-06-21</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-[#1F3FB0] font-semibold">PDO-IT-0067</td>
                    <td className="p-2 font-medium">Prosciutto di Parma</td>
                    <td className="p-2">Meat Products (PDO)</td>
                    <td className="p-2">Italy (IT)</td>
                    <td className="p-2 text-[#77736B]">1996-06-21</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-[#1F3FB0] font-semibold">PGI-IT-0431</td>
                    <td className="p-2 font-medium">Aceto Balsamico di Modena</td>
                    <td className="p-2">Vinegars (PGI)</td>
                    <td className="p-2">Italy (IT)</td>
                    <td className="p-2 text-[#77736B]">2009-07-04</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-[#1F3FB0] font-semibold">PDO-ES-0102</td>
                    <td className="p-2 font-medium">Jamón de Teruel</td>
                    <td className="p-2">Meat Products (PDO)</td>
                    <td className="p-2">Spain (ES)</td>
                    <td className="p-2 text-[#77736B]">1997-03-12</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="text-[10px] text-[#77736B] flex items-center justify-between">
              <span>Pipeline: Crawl4AI + Playwright Headless + PostgreSQL/DuckDB</span>
              <span className="text-[#536B52]">3,800+ Records Harvested</span>
            </div>
          </div>
        )}



        {/* ITEM 08: VR Eye-Tracking Supermarket Simulation */}
        {item.id === 'item-08' && (
          <div className="flex flex-col gap-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#77736B]">120Hz VIRTUAL SHELF GAZE ATTENTION:</span>
              <button
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={`px-2.5 py-1 text-[11px] font-mono border flex items-center gap-1.5 transition-colors ${
                  showHeatmap ? 'bg-[#1F3FB0] text-white border-[#1F3FB0]' : 'bg-white text-[#141414] border-[#141414]/20'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showHeatmap ? 'HEATMAP ACTIVE' : 'SHOW HEATMAP'}</span>
              </button>
            </div>

            {/* Virtual Shelf Visual Simulation */}
            <div className="relative w-full h-48 bg-stone-100 border border-[#141414]/15 rounded flex items-center justify-around px-4 overflow-hidden">
              {/* Shelf row 1 */}
              {[
                { name: 'Standard Pasta', code: 'A1', fix: '140ms', hasEco: false },
                { name: 'Organic Wholegrain', code: 'A2', fix: '480ms', hasEco: true },
                { name: 'Gluten-Free Bio', code: 'A3', fix: '390ms', hasEco: true },
                { name: 'Economy Value', code: 'A4', fix: '90ms', hasEco: false },
              ].map((prod, i) => (
                <div key={i} className="relative flex flex-col items-center justify-end h-36 w-16 md:w-20 bg-white border border-[#141414]/15 p-1 rounded-sm shadow-xs">
                  {prod.hasEco && (
                    <div className="w-4 h-4 rounded-full bg-[#536B52] text-white text-[7px] flex items-center justify-center font-bold mb-1">
                      ECO
                    </div>
                  )}
                  <div className="w-full h-16 bg-stone-200 rounded-[1px] flex items-center justify-center text-[8px] text-center text-[#77736B] p-0.5">
                    {prod.name}
                  </div>
                  <div className="text-[9px] font-mono mt-1 font-semibold">{prod.fix}</div>

                  {/* Eye Tracking Fixation Circles Overlay */}
                  {showHeatmap && prod.hasEco && (
                    <div className="absolute inset-0 bg-radial from-red-500/40 via-amber-400/25 to-transparent rounded-full pointer-events-none animate-pulse" />
                  )}
                </div>
              ))}

              {/* Gaze Trajectory Saccade Line */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <polyline
                  points="50,110 140,50 250,70 330,120"
                  fill="none"
                  stroke="#1F3FB0"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />
                <circle cx="140" cy="50" r="5" fill="#1F3FB0" fillOpacity="0.7" />
                <circle cx="250" cy="70" r="4" fill="#1F3FB0" fillOpacity="0.7" />
              </svg>
            </div>

            <div className="bg-white p-3 border border-[#141414]/15 text-xs text-[#141414]">
              <span className="text-[#1F3FB0] font-semibold">NEURO-ATTENTION THRESHOLD: </span>
              Fixation duration exceeding 320ms on upper-third front-of-pack sustainability claims reliably triggers purchase intention with 84.2% classification accuracy in immersive 6-DOF VR testing.
            </div>
          </div>
        )}
      </div>

      {/* Verified Scientific Metrics Grid */}
      {item.visualMaterial.metrics && item.visualMaterial.metrics.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-[#141414]/10">
          {item.visualMaterial.metrics.map((m, idx) => (
            <div key={idx} className="bg-white p-3 border border-[#141414]/15">
              <div className="text-[10px] font-mono uppercase text-[#77736B] tracking-wider">
                {m.label}
              </div>
              <div className="text-xl font-serif font-medium text-[#141414] mt-1">
                {m.value}
              </div>
              {m.detail && (
                <div className="text-[10px] font-mono text-[#1F3FB0] mt-1">
                  {m.detail}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
