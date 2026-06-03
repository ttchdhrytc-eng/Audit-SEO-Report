import React, { useState } from 'react';
import { WebsiteAuditReport, SeoMetric } from '../types';
import { 
  MapPin, 
  Store, 
  PhoneCall, 
  MessageSquare, 
  Star, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Clock,
  Compass
} from 'lucide-react';

interface LocalSeoPanelProps {
  report: WebsiteAuditReport;
}

export const LocalSeoPanel: React.FC<LocalSeoPanelProps> = ({ report }) => {
  const { localSeo } = report;
  const [toggleNotLocal, setToggleNotLocal] = useState(!localSeo.isApplicable);

  const getMetricIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />;
    }
  };

  const getReviewStatusColor = (status: 'passed' | 'warning' | 'failed') => {
    switch (status) {
      case 'passed':
        return 'border-emerald-250 bg-emerald-50 text-emerald-800 dark:border-emerald-950 dark:bg-emerald-950/20 dark:text-emerald-400';
      case 'warning':
        return 'border-amber-250 bg-amber-50 text-amber-800 dark:border-amber-950 dark:bg-amber-950/20 dark:text-amber-400';
      case 'failed':
        return 'border-rose-250 bg-rose-50 text-rose-800 dark:border-rose-950 dark:bg-rose-950/20 dark:text-rose-450';
    }
  };

  return (
    <div id="local-seo-panel" className="space-y-8 animate-fade-in">
      
      {/* Header local panel */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-900 dark:to-amber-950/10 border border-amber-100/30 dark:border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-lg font-display font-semibold text-slate-900 dark:text-white flex items-center gap-2 justify-center sm:justify-start">
            <MapPin className="w-5 h-5 text-amber-500" />
            Local SEO & Map Pack Optimization
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl">
            Audit for geographical indicators: Google Business Profile correctness, citation directory counts, review ratings, and NAP (Name, Address, Phone) consistency across the web.
          </p>
        </div>
        
        {localSeo.isApplicable && (
          <div className="bg-white dark:bg-slate-950 px-6 py-4 rounded-xl border border-amber-100 dark:border-slate-800 text-center shrink-0 shadow-sm">
            <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-semibold">
              Local Coherence Index
            </span>
            <span className="text-3xl font-display font-bold text-slate-900 dark:text-white block mt-0.5">
              {localSeo.overallScore}<span className="text-sm font-normal text-slate-400">/100</span>
            </span>
          </div>
        )}
      </div>

      {!localSeo.isApplicable && (
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl text-center space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-350 max-w-xl mx-auto">
            This domain is currently flagged as a <strong>Digital-Only Brand or Saas entity</strong>. Standard physical coordinates audits (Google Business Profile and NAP validation) are disabled.
          </p>
          <button 
            type="button" 
            onClick={() => setToggleNotLocal(!toggleNotLocal)}
            className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg cursor-pointer transition shadow-xs"
          >
            {toggleNotLocal ? "Force Render Local Business Audit Template" : "Hide Local Template Options"}
          </button>
        </div>
      )}

      {(!localSeo.isApplicable && toggleNotLocal) ? null : (
        <div className="space-y-8">
          
          {/* Diagnostic Metrics Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Google Business Profile */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-450 tracking-wider font-semibold block">Google Map Listing</span>
                  <h4 className="text-sm font-bold text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-slate-500" />
                    Profile Completeness
                  </h4>
                </div>
                {getMetricIcon(localSeo.googleBusinessProfile.status)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                {localSeo.googleBusinessProfile.details}
              </p>
              <div className="border-t border-slate-50 pt-2.5 space-y-1">
                <span className="block text-[9px] font-mono uppercase text-indigo-500 tracking-wider">Agency Fix</span>
                <p className="text-[11px] text-slate-700 dark:text-slate-350 italic mt-0.5">
                  "{localSeo.googleBusinessProfile.recommendation}"
                </p>
                <div className="text-[9px] font-mono text-slate-400 dark:text-slate-500 pt-1.5 mt-1 border-t border-slate-100/50 dark:border-slate-800/25">
                  Source: <span className="font-semibold">{localSeo.googleBusinessProfile.sourceApi || "Google Places API"}</span> | Field: <span className="font-semibold">{localSeo.googleBusinessProfile.originalField || "placeDetails.business_status"}</span>
                </div>
              </div>
            </div>

            {/* NAP Checklist */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-450 tracking-wider font-semibold block">Name, Address, Phone</span>
                  <h4 className="text-sm font-bold text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
                    <PhoneCall className="w-4 h-4 text-slate-500" />
                    NAP Consistency Checklist
                  </h4>
                </div>
                {getMetricIcon(localSeo.napConsistency.status)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                {localSeo.napConsistency.details}
              </p>
              <div className="border-t border-slate-50 pt-2.5 space-y-1">
                <span className="block text-[9px] font-mono uppercase text-indigo-500 tracking-wider">Agency Fix</span>
                <p className="text-[11px] text-slate-700 dark:text-slate-350 italic mt-0.5">
                  "{localSeo.napConsistency.recommendation}"
                </p>
                <div className="text-[9px] font-mono text-slate-400 dark:text-slate-500 pt-1.5 mt-1 border-t border-slate-100/50 dark:border-slate-800/25">
                  Source: <span className="font-semibold">{localSeo.napConsistency.sourceApi || "Google Places API"}</span> | Field: <span className="font-semibold">{localSeo.napConsistency.originalField || "placeDetails.formatted_address, placeDetails.formatted_phone_number"}</span>
                </div>
              </div>
            </div>

            {/* Local Citations */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-450 tracking-wider font-semibold block">Directory citation</span>
                  <h4 className="text-sm font-bold text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-slate-500" />
                    Citations Presence
                  </h4>
                </div>
                {getMetricIcon(localSeo.localCitations.status)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                {localSeo.localCitations.details}
              </p>
              <div className="border-t border-slate-50 pt-2.5 space-y-1">
                <span className="block text-[9px] font-mono uppercase text-indigo-500 tracking-wider">Agency Fix</span>
                <p className="text-[11px] text-slate-700 dark:text-slate-350 italic mt-0.5">
                  "{localSeo.localCitations.recommendation}"
                </p>
                <div className="text-[9px] font-mono text-slate-400 dark:text-slate-500 pt-1.5 mt-1 border-t border-slate-100/50 dark:border-slate-800/25">
                  Source: <span className="font-semibold">{localSeo.localCitations.sourceApi || "Google Places API"}</span> | Field: <span className="font-semibold">{localSeo.localCitations.originalField || "placeDetails.formatted_address"}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Social Reviews sentiment analysis */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4.5 h-4.5 text-blue-500" />
              Customer Reviews and Public Sentiment Audit
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              <div className="md:col-span-4 bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-100 dark:border-slate-900 text-center space-y-3.5 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="block text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">Average Rating Index</span>
                  <div className="flex items-center justify-center gap-1.5">
                    <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                    <span className="text-3xl font-display font-bold text-slate-900 dark:text-white">
                      {localSeo.reviewsAnalysis.averageRating}
                    </span>
                    <span className="text-slate-400 text-xs">/5.0</span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Parsed {localSeo.reviewsAnalysis.totalReviews} total reviews across Google Maps & Yelp
                  </div>
                </div>
                <div className="text-[8.5px] font-mono text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-200/50 dark:border-slate-800/40 text-left space-y-1">
                  <div><strong>Rating API:</strong> {localSeo.reviewsAnalysis.averageRatingSource || "Google Places API"}</div>
                  <div><strong>Rating Field:</strong> {localSeo.reviewsAnalysis.averageRatingField || "placeDetails.rating"}</div>
                  <div><strong>Reviews API:</strong> {localSeo.reviewsAnalysis.totalReviewsSource || "Google Places API"}</div>
                  <div><strong>Reviews Field:</strong> {localSeo.reviewsAnalysis.totalReviewsField || "placeDetails.user_ratings_total"}</div>
                </div>
              </div>

              <div className="md:col-span-8 space-y-4">
                <div className={`p-4 border-l-4 rounded-r-xl text-xs space-y-1 ${getReviewStatusColor(localSeo.reviewsAnalysis.status)}`}>
                  <div className="font-semibold flex items-center gap-1.5 capitalize text-xs">
                    Rating Tier Status: {localSeo.reviewsAnalysis.status === 'passed' ? 'Perfect' : 'Action Required'}
                  </div>
                  <p className="opacity-90 leading-relaxed font-sans mt-1">
                    "{localSeo.reviewsAnalysis.sentimentSummary}"
                  </p>
                </div>

                <div className="bg-indigo-50/30 border border-indigo-100 p-4 rounded-xl text-xs dark:bg-indigo-950/20 dark:border-indigo-900/40">
                  <span className="text-[10px] font-mono uppercase text-indigo-600 block font-bold">Review Velocity Strategy</span>
                  <p className="text-slate-600 dark:text-slate-350 leading-relaxed mt-1">
                    Configure automated SMS triggers and physical dynamic QR placards on shopfront checkout desks. Elevating total Google review quantities relative to geographic competitors is the #1 weight signal for Map Pack listings rankings.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
};
