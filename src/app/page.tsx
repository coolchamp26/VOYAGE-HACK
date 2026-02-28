"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Calendar, Users, Wallet, Activity, ShieldCheck, Heart, Sparkles, Navigation, Info } from "lucide-react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);

  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    departureDate: "",
    returnDate: "",
    budget: "",
    groupType: "Professional",
    age: "30",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setResults(null);

    try {
      // Format dates from DD/MM/YY to YYYY-MM-DD for the backend
      const formatToYYYYMMDD = (dateStr: string) => {
        if (!dateStr || dateStr.length !== 8) return "";
        const [day, month, shortYear] = dateStr.split('/');
        return `20${shortYear}-${month}-${day}`;
      };

      const res = await fetch("/api/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          departureDate: formatToYYYYMMDD(formData.departureDate),
          returnDate: formatToYYYYMMDD(formData.returnDate),
        }),
      });
      const data = await res.json();
      setResults(data.trips || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const renderTagIcon = (tag: string) => {
    switch (tag.toLowerCase()) {
      case "safest overall": return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case "best value": return <Wallet className="w-4 h-4 text-amber-600" />;
      case "most comfortable": return <Heart className="w-4 h-4 text-rose-500" />;
      case "premium choice": return <Sparkles className="w-4 h-4 text-violet-600" />;
      default: return null;
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#faf8f5] text-[#1a1a1a] font-sans selection:bg-amber-200/60">

      {/* Hero Section with Background Image */}
      <div className="relative w-full h-[520px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80"
          alt="Travel Hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-[#faf8f5]" />

        {/* Nav Bar */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-6 flex items-center justify-between">
          <span className="text-white font-bold text-xl tracking-tight">TBO OneSearch</span>
          <div className="hidden md:flex items-center gap-2">
            {[
              { label: "How It Works", target: "how-it-works" },
              { label: "Popular", target: "popular-section" },
              { label: "About", target: "about-section" },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  const el = document.getElementById(item.target);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="px-4 py-1.5 rounded-full text-sm text-white/90 hover:bg-white/20 cursor-pointer transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hero Text */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center pt-16 pb-10 animate-[fade-in-down_0.5s_ease-out]">
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight" style={{ fontFamily: "'Georgia', serif" }}>
            Find your next<br />
            unforgettable trip
          </h1>
          <p className="mt-4 text-white/80 text-lg max-w-xl">
            Discover hidden gems, chill spots, and wild adventures, all in one place.
          </p>
        </div>
      </div>

      {/* Search Bar — Floating over hero/content boundary */}
      <div className="relative z-20 max-w-5xl mx-auto -mt-14 px-4 animate-[fade-in-up_0.5s_ease-out_0.2s_both]">
        <div className="bg-white rounded-full shadow-2xl border border-gray-200/60 px-6 py-4">
          <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-4">

            <div className="flex items-center gap-2 flex-1 min-w-[120px] border-r border-gray-200 pr-4">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                required
                type="text"
                placeholder="Where from?"
                className="bg-transparent w-full text-sm text-[#1a1a1a] placeholder:text-gray-400 outline-none uppercase"
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="flex items-center gap-2 flex-1 min-w-[120px] border-r border-gray-200 pr-4">
              <Navigation className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                required
                type="text"
                placeholder="Where to?"
                className="bg-transparent w-full text-sm text-[#1a1a1a] placeholder:text-gray-400 outline-none uppercase"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="flex items-center gap-2 flex-1 min-w-[120px] border-r border-gray-200 pr-4">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                required
                type="text"
                maxLength={8}
                placeholder="DD/MM/YY"
                className="bg-transparent text-sm text-[#1a1a1a] outline-none w-full placeholder:text-gray-400"
                value={formData.departureDate}
                onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, '');
                  if (val.length >= 3 && val.length <= 4) {
                    val = `${val.slice(0, 2)}/${val.slice(2)}`;
                  } else if (val.length > 4) {
                    val = `${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4, 6)}`;
                  }
                  setFormData({ ...formData, departureDate: val });
                }}
              />
            </div>

            <div className="flex items-center gap-2 flex-1 min-w-[120px] border-r border-gray-200 pr-4">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                required
                type="text"
                maxLength={8}
                placeholder="DD/MM/YY"
                className="bg-transparent text-sm text-[#1a1a1a] outline-none w-full placeholder:text-gray-400"
                value={formData.returnDate}
                onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, '');
                  if (val.length >= 3 && val.length <= 4) {
                    val = `${val.slice(0, 2)}/${val.slice(2)}`;
                  } else if (val.length > 4) {
                    val = `${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4, 6)}`;
                  }
                  setFormData({ ...formData, returnDate: val });
                }}
              />
            </div>

            <div className="flex items-center gap-2 flex-1 min-w-[100px] border-r border-gray-200 pr-4">
              <Wallet className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                required
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Budget ₹"
                className="bg-transparent w-full text-sm text-[#1a1a1a] placeholder:text-gray-400 outline-none"
                value={formData.budget}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setFormData({ ...formData, budget: val });
                }}
              />
            </div>

            <div className="flex items-center gap-2 min-w-[130px] border-r border-gray-200 pr-4">
              <Users className="w-4 h-4 text-gray-400 shrink-0" />
              <select
                className="bg-transparent text-sm text-[#1a1a1a] outline-none cursor-pointer appearance-none pr-4"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0 center' }}
                value={formData.groupType}
                onChange={(e) => setFormData({ ...formData, groupType: e.target.value })}
              >
                <option>Student</option>
                <option>Family</option>
                <option>Bachelors</option>
                <option>Professional</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="bg-[#1a1a1a] hover:bg-[#333] text-white px-6 py-3 rounded-full text-sm font-semibold transition-all active:scale-[0.97] flex items-center gap-2 shadow-lg"
            >
              {isSearching ? (
                <>
                  <Activity className="w-4 h-4 animate-pulse" />
                  Searching...
                </>
              ) : (
                <>
                  Find my trip
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">

        {/* Results Section */}
        {results && (
          <div id="results-section" className="animate-[fade-in-up_0.5s_ease-out]">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a1a]">
                Our Recommended Trips
              </h2>
              <p className="text-gray-500 mt-3 max-w-lg mx-auto">
                Discover where everyone&apos;s heading this season, from tropical escapes to urban adventures, these trips are stealing the spotlight.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {results.map((trip, idx) => (
                <div
                  key={idx}
                  className="group bg-white border border-gray-100 rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-xl flex flex-col animate-[fade-in-up_0.5s_ease-out_both]"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  {/* Image Header */}
                  <div className="h-52 relative overflow-hidden">
                    <img
                      src={`https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&q=80`}
                      alt="Destination"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />

                    {/* Decision Tag */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md">
                      {renderTagIcon(trip.decisionTag)}
                      <span className="text-xs font-semibold text-[#1a1a1a] uppercase tracking-wider">
                        {trip.decisionTag}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col gap-4">
                    {/* Hotel Info */}
                    <div>
                      <h3 className="font-bold text-[#1a1a1a] text-lg">{trip.hotelName}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: trip.hotelRating }).map((_, i) => (
                          <svg key={i} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="text-xs text-gray-400 ml-1">{trip.stayDuration}</span>
                      </div>
                    </div>

                    {/* Flight Info */}
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Navigation className="w-3.5 h-3.5 text-gray-400" />
                        <span>Outbound • {trip.flightOutbound}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 border-t border-gray-100 pt-2">
                        <Navigation className="w-3.5 h-3.5 text-gray-400 rotate-180" />
                        <span>Return • {trip.flightReturn}</span>
                      </div>
                    </div>

                    {/* Scores */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex flex-col items-center">
                        <span className="text-2xl font-bold text-emerald-600">{trip.confidenceScore}%</span>
                        <span className="text-[10px] text-emerald-700 mt-0.5 uppercase tracking-wider font-semibold">Confidence Match</span>
                      </div>
                      <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 flex flex-col items-center">
                        <span className="text-2xl font-bold text-orange-500">{trip.comfortScore}%</span>
                        <span className="text-[10px] text-orange-700 mt-0.5 uppercase tracking-wider font-semibold">Comfort Score</span>
                      </div>
                    </div>

                    {/* Risk Summary */}
                    <div className="space-y-1.5 flex-1">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Trip Insights</h4>
                      <ul className="space-y-1.5">
                        {trip.riskSummary.map((risk: string, i: number) => {
                          const isPositive = risk.startsWith("🟢");
                          const isWarning = risk.startsWith("🟡");
                          const color = isPositive ? "text-emerald-600" : isWarning ? "text-amber-600" : "text-gray-600";
                          return (
                            <li key={i} className={`text-xs flex items-start gap-1.5 ${color}`}>
                              <span className="shrink-0 leading-tight">{risk.charAt(0)}</span>
                              <span className="text-gray-600 leading-tight">{risk.slice(1).trim()}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* Budget Elasticity Insight */}
                    {trip.insights?.map((insight: string, i: number) => (
                      <div key={i} className="flex gap-2 items-start p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700">
                        <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
                        <p>{insight}</p>
                      </div>
                    ))}

                    {/* Price + CTA */}
                    <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-[#1a1a1a]">₹{trip.totalPrice.toLocaleString()}</span>
                        <span className="text-xs text-gray-400 ml-1">/Person</span>
                      </div>
                      <button className="px-5 py-2.5 rounded-full bg-[#1a1a1a] hover:bg-[#333] text-white text-sm font-semibold transition-colors shadow-md active:scale-[0.97]">
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State (before search) */}
        {!results && !isSearching && (
          <div id="popular-section" className="text-center py-16 animate-[fade-in-up_0.5s_ease-out_0.4s_both]">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a1a]">Our Popular Trips</h2>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto">
              Discover where everyone&apos;s heading this season, from tropical escapes to urban adventures, these trips are stealing the spotlight.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-12">
              {[
                { name: "Bali Surf Escape", img: "photo-1537996194471-e657df975ab4", price: "₹45,000–₹60,000" },
                { name: "Cappadocia Hot Air", img: "photo-1526048598645-62b31f82b8f5", price: "₹55,000–₹75,000" },
                { name: "Tokyo Street Walk", img: "photo-1540959733332-eab4deabeeaf", price: "₹65,000–₹90,000" },
                { name: "Maldives Island Hop", img: "photo-1514282401047-d79a71a590e8", price: "₹80,000–₹1,20,000" },
              ].map((trip) => (
                <div key={trip.name} className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="h-48 overflow-hidden">
                    <img
                      src={`https://images.unsplash.com/${trip.img}?w=600&q=80`}
                      alt={trip.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-[#1a1a1a]">{trip.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">Recommended • 5 Days</p>
                    <p className="text-lg font-bold text-[#1a1a1a] mt-3">{trip.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="bg-white border-t border-gray-100 py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a1a]">How It Works</h2>
          <p className="text-gray-500 mt-3 max-w-lg mx-auto">Three simple steps to your perfect trip, powered by our intelligent orchestration engine.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {[
              { step: "01", title: "Tell Us Your Preferences", desc: "Enter your origin, destination, dates, budget, and travel style. Our engine personalizes everything for you." },
              { step: "02", title: "We Orchestrate the Best Trips", desc: "Our backend queries TBO's flight and hotel APIs, scores hundreds of combinations for fatigue, timing, comfort, and budget." },
              { step: "03", title: "Pick Your Perfect Journey", desc: "Get curated trip recommendations with confidence scores, risk insights, and one-click booking." },
            ].map((item) => (
              <div key={item.step} className="text-left p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
                <span className="text-4xl font-bold text-gray-200">{item.step}</span>
                <h3 className="text-lg font-bold text-[#1a1a1a] mt-3">{item.title}</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* About Section */}
      <div id="about-section" className="bg-[#faf8f5] py-20 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a1a]">About TBO OneSearch</h2>
          <p className="text-gray-500 mt-4 leading-relaxed max-w-2xl mx-auto">
            TBO OneSearch is a recommendation-first Trip Orchestration Platform built exclusively on TBO APIs.
            Unlike traditional search engines that overwhelm you with thousands of results, we use persona-based
            intelligence, fatigue analysis, time utilization scoring, and budget elasticity to deliver perfectly
            curated complete journeys — flights, hotels, and insights — in seconds.
          </p>
          <p className="text-gray-400 text-sm mt-8">&copy; 2026 TBO OneSearch. Built for the TBO Hackathon.</p>
        </div>
      </div>
    </main>
  );
}
