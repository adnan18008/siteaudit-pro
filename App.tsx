import React, { useState, useRef } from 'react';
import { 
  Search, BarChart2, Globe, Shield, AlertCircle, CheckCircle, 
  ChevronRight, Layout, TrendingUp, Users, ArrowUpRight, ArrowDownRight,
  Menu, Bell, Settings, MapPin, ExternalLink, X
} from 'lucide-react';
import { generateAuditReport } from './services/geminiService';
import { AuditReport, ViewState } from './types';
import { TrafficChart, DeviceDistributionChart, MarketingChannelsChart } from './components/Charts';
import { ProModal } from './components/ProModal';

// --- Sub-View Components ---

const StatCard = ({ title, value, icon: Icon, trend, trendType, subtext, unit, alert }: any) => (
  <div className={`bg-white p-6 rounded-xl border shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-md transition-shadow flex flex-col justify-between h-full ${alert ? 'border-red-100' : 'border-slate-200'}`}>
      <div>
          <div className="text-slate-500 text-sm font-medium mb-2 flex justify-between items-start">
              {title}
              <Icon size={16} className={alert ? "text-red-400" : "text-slate-300"} />
          </div>
          <div className="flex items-baseline gap-1">
              <div className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight truncate" title={value?.toString()}>
                  {value}
              </div>
              {unit && <span className="text-xs font-bold text-slate-400 ml-1">{unit}</span>}
          </div>
           <div className="text-xs text-slate-400 mt-1 mb-4">{subtext}</div>
      </div>
      <div className={`text-xs flex items-center font-medium px-2 py-1 rounded-md w-fit
          ${trendType === 'positive' ? 'bg-green-50 text-green-700' : 
            trendType === 'negative' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
          {trendType === 'positive' ? <ArrowUpRight size={14} className="mr-1" /> : 
           trendType === 'negative' ? <ArrowDownRight size={14} className="mr-1" /> : null}
          {trend}
      </div>
  </div>
);

const IssuesTable = ({ limit, report, setActiveTab }: { limit?: number, report: AuditReport | null, setActiveTab?: (tab: string) => void }) => {
  const issues = limit ? report?.seoIssues.slice(0, limit) : report?.seoIssues;
  return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <AlertCircle size={20} className="text-brand-500" />
              {limit ? 'Latest Issues' : 'All Issues'}
            </h3>
            {limit && setActiveTab && <button onClick={() => setActiveTab('issues')} className="text-sm text-brand-600 font-medium hover:text-brand-700 hover:underline">View All</button>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 min-w-[600px]">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4">Severity</th>
                  <th className="px-6 py-4">Issue</th>
                  <th className="px-6 py-4">Fix Recommendation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {issues?.map((issue, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize border
                        ${issue.severity === 'critical' ? 'bg-red-50 text-red-700 border-red-200' : 
                          issue.severity === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                        {issue.severity === 'critical' && <AlertCircle size={12} className="mr-1.5" />}
                        {issue.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 group-hover:text-brand-600 transition-colors">{issue.title}</td>
                    <td className="px-6 py-4 text-slate-500 max-w-md truncate" title={issue.fix}>
                        <span className="bg-slate-100 px-2 py-1 rounded text-slate-600 text-xs border border-slate-200 mr-2">Action</span> 
                        {issue.fix}
                    </td>
                  </tr>
                ))}
                 {(!issues || issues.length === 0) && (
                    <tr><td colSpan={3} className="p-8 text-center text-slate-400">No issues found.</td></tr>
                 )}
              </tbody>
            </table>
          </div>
      </div>
  );
};

// Helper to safely format numbers (e.g. 1,200,000 -> 1.2M, 5,500,000,000 -> 5.5B)
const formatNumber = (num: number) => {
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

const getCurrentVisits = (report: AuditReport | null) => {
  if (report?.trafficHistory && report.trafficHistory.length > 0) {
      return formatNumber(report.trafficHistory[report.trafficHistory.length - 1].visits);
  }
  return "N/A";
};

const SourcesFooter = ({ sources }: { sources?: { title: string, uri: string }[] }) => {
  if (!sources || sources.length === 0) return null;
  return (
    <div className="mt-8 border-t border-slate-200 pt-6">
      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Data Sources (Search Grounding)</h4>
      <div className="flex flex-wrap gap-2">
        {sources.map((source, idx) => (
          <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-brand-600 bg-brand-50 px-3 py-1.5 rounded-full hover:bg-brand-100 transition-colors border border-brand-100">
            <ExternalLink size={10} />
            <span className="truncate max-w-[200px]">{source.title}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

const OverviewView = ({ report, setActiveTab }: { report: AuditReport | null, setActiveTab: (tab: string) => void }) => (
  <div className="space-y-6 animate-fade-in">
    {/* Top Stats */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Global Rank" 
          value={report?.globalRank ? `#${report.globalRank}` : 'N/A'} 
          icon={Globe} 
          trend="Worldwide" 
          trendType="neutral"
          subtext="SimilarWeb Rank"
        />
        <StatCard 
          title="Monthly Visits" 
          value={getCurrentVisits(report)} 
          icon={Users} 
          trend={report?.engagement?.bounceRate ? `Bounce: ${report.engagement.bounceRate}` : 'Traffic'} 
          trendType="neutral"
          subtext="Estimated total visits"
        />
        <StatCard 
          title="Avg. Visit Duration" 
          value={report?.engagement?.avgVisitDuration || "00:00"} 
          icon={Layout} 
          trend={report?.engagement?.pagesPerVisit ? `${report.engagement.pagesPerVisit} Pages/Visit` : 'Engagement'} 
          trendType="neutral"
          subtext="Time on site"
        />
        <StatCard 
          title="Critical Errors" 
          value={report?.seoIssues.filter(i => i.severity === 'critical').length || 0} 
          icon={AlertCircle} 
          trend="Technical" 
          trendType="neutral"
          subtext="Issues found"
          alert={true}
        />
    </div>

    {/* Traffic & Device */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <TrendingUp size={20} className="text-brand-500" />
              Traffic Over Time
            </h3>
            <div className="bg-slate-50 border border-slate-200 text-xs rounded-md px-3 py-1.5 font-medium text-slate-600">
              6 Months Trend
            </div>
          </div>
          {report?.trafficHistory && <TrafficChart data={report.trafficHistory} />}
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
              <Layout size={20} className="text-brand-500" />
              Device Distribution
          </h3>
          {report?.deviceDistribution && <DeviceDistributionChart data={report.deviceDistribution} />}
        </div>
    </div>

    {/* Issues Preview */}
    <IssuesTable limit={3} report={report} setActiveTab={setActiveTab} />
    
    <SourcesFooter sources={report?.sources} />
  </div>
);

const TrafficView = ({ report }: { report: AuditReport | null }) => (
  <div className="space-y-6 animate-fade-in">
     <h2 className="text-2xl font-bold text-slate-900 mb-4">Traffic Analysis</h2>
     <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-slate-800">Traffic Trend</h3>
          <span className="text-sm text-slate-500">6 Month History</span>
        </div>
        {report?.trafficHistory && <TrafficChart data={report.trafficHistory} />}
     </div>
     
     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <h3 className="font-bold text-lg text-slate-800 mb-4">Marketing Channels</h3>
           {report?.marketingChannels && <MarketingChannelsChart data={report.marketingChannels} />}
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <h3 className="font-bold text-lg text-slate-800 mb-4">Device Split</h3>
           {report?.deviceDistribution && <DeviceDistributionChart data={report.deviceDistribution} />}
        </div>
     </div>
     <SourcesFooter sources={report?.sources} />
  </div>
);

const GeoView = ({ report }: { report: AuditReport | null }) => {
  // Fix for "1850%" issue. 
  // If value > 1 (e.g., 18.5), assume it is already a percent -> "18.5%".
  // If value <= 1 (e.g., 0.185), multiply by 100 -> "18.5%".
  const formatPercent = (val: number) => {
    const percentage = val > 1 ? val : val * 100;
    return percentage.toFixed(2) + '%';
  };
  
  // Helper for width calculation
  const getWidth = (val: number) => {
     const percentage = val > 1 ? val : val * 100;
     return Math.min(percentage, 100) + '%';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-900 mb-4">Geographic Distribution</h2>
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
            <Globe size={20} className="text-brand-500" /> Top Countries
        </h3>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[500px]">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs">
                    <tr>
                        <th className="px-4 py-3">Country</th>
                        <th className="px-4 py-3">Traffic Share</th>
                        <th className="px-4 py-3">Change</th>
                        <th className="px-4 py-3">Visual</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {report?.topCountries?.map((country, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium text-slate-900">{country.country}</td>
                            <td className="px-4 py-3 text-slate-600">{formatPercent(country.share)}</td>
                            <td className={`px-4 py-3 font-medium ${country.change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {country.change >= 0 ? '+' : ''}{country.change}%
                            </td>
                            <td className="px-4 py-3 w-1/3">
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                    <div className="bg-brand-500 h-2 rounded-full" style={{ width: getWidth(country.share) }}></div>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {(!report?.topCountries || report.topCountries.length === 0) && (
                      <tr><td colSpan={4} className="p-4 text-center text-slate-500">No geographic data available.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
      <SourcesFooter sources={report?.sources} />
    </div>
  );
};

const KeywordsView = ({ report }: { report: AuditReport | null }) => (
   <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-900 mb-4">Top Keywords</h2>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Organic Ranking</h3>
              <button className="text-brand-600 text-sm font-medium hover:underline">Export CSV</button>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[600px]">
                  <thead className="text-slate-500 font-semibold uppercase text-xs bg-white border-b border-slate-100">
                      <tr>
                          <th className="px-6 py-4">Keyword</th>
                          <th className="px-6 py-4">Position</th>
                          <th className="px-6 py-4">Volume</th>
                          <th className="px-6 py-4">Difficulty</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {report?.topKeywords.map((kw, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                              <td className="px-6 py-4 font-medium text-slate-900">{kw.keyword}</td>
                              <td className="px-6 py-4 text-slate-700 font-bold">#{kw.position}</td>
                              <td className="px-6 py-4 text-slate-500">{kw.volume.toLocaleString()}</td>
                              <td className="px-6 py-4">
                                  <span className={`px-2 py-1 rounded text-xs font-bold 
                                      ${kw.difficulty > 70 ? 'bg-red-100 text-red-700' : kw.difficulty > 40 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                      {kw.difficulty}%
                                  </span>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>
      <SourcesFooter sources={report?.sources} />
   </div>
);

const IssuesView = ({ report }: { report: AuditReport | null }) => (
   <div className="space-y-6 animate-fade-in">
       <h2 className="text-2xl font-bold text-slate-900 mb-4">Site Health Issues</h2>
       <IssuesTable report={report} />
       <SourcesFooter sources={report?.sources} />
   </div>
);


const App = () => {
  const [view, setView] = useState<ViewState>(ViewState.LANDING);
  const [activeTab, setActiveTab] = useState('overview');
  const [url, setUrl] = useState('');
  const [report, setReport] = useState<AuditReport | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [showProModal, setShowProModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Use a ref to clear intervals if component unmounts
  const intervalRef = useRef<number | null>(null);

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    let formattedUrl = url;
    if (!url.startsWith('http')) {
        formattedUrl = `https://${url}`;
    }

    // Set Loading View immediately
    setView(ViewState.LOADING);
    setLoadingStep(0);

    // Start the API call concurrently
    const auditPromise = generateAuditReport(formattedUrl);

    // Start animation loop to update text independently of API call
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = window.setInterval(() => {
        setLoadingStep((prev) => {
            // Cycle through steps 0-3
            return (prev + 1) % 4;
        });
    }, 800);

    try {
      const data = await auditPromise;
      
      // Cleanup interval
      if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
      }

      setReport(data);
      setView(ViewState.DASHBOARD);
      setActiveTab('overview');
    } catch (error) {
      console.error(error);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      alert("Failed to audit. Please check your API key or try again.");
      setView(ViewState.LANDING);
    }
  };

  const SidebarItem = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => (
    <button 
      type="button"
      onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${activeTab === id ? 'bg-brand-50 text-brand-700 shadow-sm border border-brand-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  if (view === ViewState.LANDING) {
    return (
      <div className="min-h-screen bg-white flex flex-col font-sans">
        {/* Header */}
        <header className="border-b border-slate-100 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-50">
          <div className="container mx-auto px-6 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-brand-600 p-2 rounded-lg text-white shadow-lg shadow-brand-500/20">
                <BarChart2 size={24} />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">SiteAudit Pro</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
               <button onClick={() => setShowProModal(true)} className="hidden sm:block text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">Pricing</button>
               <button className="hidden sm:block text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">Login</button>
               <button onClick={() => setShowProModal(true)} className="bg-brand-600 text-white px-4 py-2 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm font-medium hover:bg-brand-700 transition-all shadow-md hover:shadow-lg active:scale-95">Get Pro</button>
            </div>
          </div>
        </header>

        {/* Hero */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 text-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-50 via-white to-white">
            <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
                <span className="inline-block px-4 py-1.5 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-6 border border-brand-100">
                    ✨ New: AI-Powered Deep Audits
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
                Analyze any website.<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">Instantly.</span>
                </h1>
                <p className="text-base sm:text-lg text-slate-500 mb-10 max-w-2xl leading-relaxed">
                Get deep insights into traffic, SEO health, keyword rankings, and technical issues. 
                Powered by advanced AI to simulate comprehensive audits in seconds.
                </p>

                <form onSubmit={handleAudit} className="w-full max-w-xl relative group">
                <div className="absolute inset-0 bg-brand-400 rounded-full blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                <div className="relative flex items-center bg-white border border-slate-200 rounded-full shadow-xl p-2 pl-4 sm:pl-6 focus-within:ring-4 focus-within:ring-brand-100 transition-all">
                    <Globe className="text-slate-400 mr-2 sm:mr-3" size={20} />
                    <input 
                    type="text" 
                    placeholder="Enter domain (e.g. apple.com)" 
                    className="flex-1 outline-none text-slate-800 placeholder:text-slate-400 bg-transparent text-base sm:text-lg min-w-0"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    />
                    <button 
                    type="submit"
                    className="bg-brand-600 hover:bg-brand-700 text-white rounded-full px-4 sm:px-8 py-2.5 sm:py-3.5 font-medium transition-all flex items-center gap-2 shadow-lg shadow-brand-500/20 whitespace-nowrap text-sm sm:text-base"
                    >
                    Analyze <ChevronRight size={18} />
                    </button>
                </div>
                </form>

                <div className="mt-12 sm:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left w-full">
                {[
                    { title: "SEO Audit", desc: "Identify critical technical issues and fix them." },
                    { title: "Traffic Insights", desc: "Estimate monthly visits and user behavior." },
                    { title: "Competitor Analysis", desc: "See what keywords your rivals are ranking for." }
                ].map((f, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-brand-200 transition-all duration-300 group">
                    <div className="h-12 w-12 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 mb-4 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                        <CheckCircle size={24} />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2 text-lg">{f.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                    </div>
                ))}
                </div>
            </div>
        </main>
        {showProModal && <ProModal onClose={() => setShowProModal(false)} />}
      </div>
    );
  }

  if (view === ViewState.LOADING) {
    return (
      <div className="min-h-screen bg-brand-50/50 flex flex-col items-center justify-center relative overflow-hidden px-4">
        {/* Decorative background blobs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

        <div className="bg-white/80 backdrop-blur-xl p-8 sm:p-12 rounded-3xl shadow-2xl text-center max-w-md w-full border border-white/50 relative z-10">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <svg className="animate-spin text-brand-100" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
               <Globe className="text-brand-600" size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Analyzing Website</h2>
          <p className="text-slate-500 mb-8 truncate px-4">{url}</p>
          
          <div className="w-full bg-slate-100 rounded-full h-2.5 mb-4 overflow-hidden">
            <div 
              className="bg-brand-600 h-2.5 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(37,99,235,0.5)]"
              style={{ width: `${((loadingStep + 1) / 4) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs font-mono text-slate-500 uppercase tracking-wide font-semibold">
            {["Connecting to Data Centers...", "Crawling Site Structure...", "Performing SEO Checks...", "Finalizing Report..."][loadingStep]}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Mobile Sidebar Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Responsive */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 shadow-2xl md:shadow-sm transform transition-transform duration-300 ease-in-out flex flex-col
        md:translate-x-0 md:static md:h-screen md:sticky md:top-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-2 text-brand-600 cursor-pointer" onClick={() => { setView(ViewState.LANDING); }}>
            <div className="bg-brand-600 rounded-lg p-1.5 text-white">
                <BarChart2 size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">SiteAudit</span>
          </div>
          <button className="md:hidden text-slate-400 hover:text-slate-600" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-4 mb-2 mt-4">General</div>
          <SidebarItem id="overview" icon={Layout} label="Overview" />
          <SidebarItem id="traffic" icon={TrendingUp} label="Traffic Analysis" />
          <SidebarItem id="geo" icon={Globe} label="Geo Distribution" />
          
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-4 mb-2 mt-6">SEO & Content</div>
          <SidebarItem id="health" icon={Shield} label="Site Health" />
          <SidebarItem id="keywords" icon={Search} label="Keywords" />
          <SidebarItem id="issues" icon={AlertCircle} label="Issues" />
        </div>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-gradient-to-br from-brand-600 to-indigo-600 rounded-xl p-5 text-white shadow-lg shadow-brand-500/20">
            <h4 className="font-bold mb-1 text-sm">Go Pro</h4>
            <p className="text-xs text-brand-100 mb-3 opacity-90">Unlock full reports and export PDF data.</p>
            <button 
              onClick={() => setShowProModal(true)}
              className="w-full bg-white text-brand-600 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-brand-50 transition-colors shadow-sm"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-slate-50/50 w-full md:w-auto">
        {/* Top Bar */}
        <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-4 md:px-8 py-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2 md:gap-4">
             <button 
                className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-md"
                onClick={() => setIsMobileMenuOpen(true)}
             >
                <Menu size={24} />
             </button>
             <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2 text-sm font-medium text-slate-700 max-w-[150px] sm:max-w-[300px]">
                <Globe size={14} className="text-slate-400 flex-shrink-0" />
                <span className="truncate">{report?.url}</span>
             </div>
             <span className="hidden sm:flex text-xs px-2.5 py-1 bg-green-50 text-green-700 rounded-full border border-green-200 font-semibold items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Verified
             </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 text-slate-500">
            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors hidden sm:block">
                <Settings size={20} />
            </button>
            <div className="h-8 w-8 bg-gradient-to-tr from-brand-100 to-indigo-100 rounded-full flex items-center justify-center text-brand-700 font-bold text-xs border border-white shadow-sm ring-1 ring-slate-100">
              JP
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-4 sm:p-8 max-w-7xl mx-auto min-h-[calc(100vh-80px)]">
          {activeTab === 'overview' && <OverviewView report={report} setActiveTab={setActiveTab} />}
          {activeTab === 'traffic' && <TrafficView report={report} />}
          {activeTab === 'geo' && <GeoView report={report} />}
          {(activeTab === 'health' || activeTab === 'issues') && <IssuesView report={report} />}
          {activeTab === 'keywords' && <KeywordsView report={report} />}
        </div>
      </main>
      
      {showProModal && <ProModal onClose={() => setShowProModal(false)} />}
    </div>
  );
};

export default App;