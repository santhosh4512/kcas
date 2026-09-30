'use client';

import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  MapPin,
  ExternalLink,
  Compass,
  Building2,
  Phone,
  Mail,
  Smartphone,
  ShieldCheck,
  Navigation,
  Globe,
  Sparkles,
} from 'lucide-react';

export default function CollegeLocationPage() {
  const CAMPUS_LAT = 12.1905865;
  const CAMPUS_LNG = 79.0837848;

  const [userCoords, setUserCoords] = useState(null);
  const [distance, setDistance] = useState(null);
  const [locating, setLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // metres
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  };

  const handleTestLocation = () => {
    setLocating(true);
    setErrorMsg(null);

    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your current browser.');
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ latitude, longitude });
        const dist = calculateDistance(latitude, longitude, CAMPUS_LAT, CAMPUS_LNG);
        setDistance(dist);
        setLocating(false);
      },
      (err) => {
        setErrorMsg('Unable to retrieve your location. Please check browser GPS permissions.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-[#C5A059]/30 bg-gradient-to-r from-[#0E1B2E] via-[#162A45] to-[#6D1B29] p-6 lg:p-8 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#C5A059] mb-1">
                <Compass className="h-4 w-4" />
                <span>Institutional Geolocation & Campus Coordinates</span>
              </div>
              <h1 className="font-classic text-2xl lg:text-3xl font-black text-[#F3E5AB]">
                College Location & Geofence Center
              </h1>
              <p className="mt-1 text-xs lg:text-sm text-[#E8E2D5]/80 max-w-2xl">
                Official institutional GPS anchor point for smart geo-verified student attendance and radius verification.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={`https://www.google.com/maps?q=${CAMPUS_LAT},${CAMPUS_LNG}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#C5A059] to-[#DFB76C] px-5 py-3 text-xs font-black text-[#0E1B2E] shadow-lg hover:brightness-110 active:scale-95 transition-all"
              >
                <ExternalLink className="h-4 w-4" />
                <span>View College Location on Google Maps</span>
              </a>
            </div>
          </div>
        </div>

        {/* Institution Info & Coordinate Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Institutional Information */}
          <div className="rounded-3xl border border-[#C5A059]/30 bg-[#0E1B2E] p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <Building2 className="h-5 w-5 text-[#C5A059]" />
              <h3 className="font-classic text-base font-bold text-[#F3E5AB]">Campus Information</h3>
            </div>

            <div className="space-y-3 text-xs text-[#E8E2D5]/90">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#C5A059] block">Institution Name:</span>
                <strong className="text-white text-sm">KAMBAN COLLEGE OF ARTS AND SCIENCE FOR WOMEN</strong>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#C5A059] block">Accreditation:</span>
                <span>Recognized u/s 2(f) & 12(B) of UGC Act 1956 / Accredited by NAAC / Affiliated to Thiruvalluvar University</span>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#C5A059] block">Address:</span>
                <span>Thenmathur, Tiruvannamalai – 606 603, Tamil Nadu, India</span>
              </div>

              <div className="pt-2 border-t border-white/5 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-[#C5A059]" />
                  <span>Landline: <strong>04175 – 255401</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone className="h-3.5 w-3.5 text-[#C5A059]" />
                  <span>Cell / Mobile: <strong>9488029091</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-[#C5A059]" />
                  <span>Email: <strong className="text-white">kcastvmalai@gmail.com</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* GPS Coordinates & Geofence Details */}
          <div className="rounded-3xl border border-[#C5A059]/30 bg-[#0E1B2E] p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <MapPin className="h-5 w-5 text-[#C5A059]" />
              <h3 className="font-classic text-base font-bold text-[#F3E5AB]">GPS Anchor Coordinates</h3>
            </div>

            <div className="space-y-3 text-xs text-[#E8E2D5]/90">
              <div className="bg-black/30 p-3 rounded-2xl border border-white/5 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-white/60">Latitude:</span>
                  <strong className="text-[#C5A059]">{CAMPUS_LAT}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Longitude:</span>
                  <strong className="text-[#C5A059]">{CAMPUS_LNG}</strong>
                </div>
              </div>

              <div className="bg-black/30 p-3 rounded-2xl border border-white/5 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#C5A059] block">Standard Campus Radius:</span>
                <div className="flex items-center justify-between">
                  <strong className="text-white text-base">1000 Meters (1.0 km)</strong>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">Active</span>
                </div>
                <p className="text-[11px] text-white/50 pt-1">
                  Students submitting attendance within this radius are automatically marked as Geo-Verified Campus Present.
                </p>
              </div>

              <div className="pt-2">
                <a
                  href={`https://www.google.com/maps?q=${CAMPUS_LAT},${CAMPUS_LNG}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/10 py-2.5 text-xs font-bold text-[#F3E5AB] hover:bg-[#C5A059] hover:text-[#0E1B2E] transition-all"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Open in Google Maps App</span>
                </a>
              </div>
            </div>
          </div>

          {/* Real-time Distance Calculator Test Tool */}
          <div className="rounded-3xl border border-[#C5A059]/30 bg-[#0E1B2E] p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <Navigation className="h-5 w-5 text-[#C5A059]" />
              <h3 className="font-classic text-base font-bold text-[#F3E5AB]">Device Distance Test</h3>
            </div>

            <p className="text-xs text-[#E8E2D5]/80">
              Test your device&apos;s current browser GPS position against the official Kamban College coordinates.
            </p>

            <button
              onClick={handleTestLocation}
              disabled={locating}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#C5A059] to-[#DFB76C] py-3 text-xs font-black text-[#0E1B2E] shadow-lg hover:brightness-110 active:scale-95 transition-all"
            >
              {locating ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0E1B2E] border-t-transparent" />
                  <span>Acquiring Device GPS...</span>
                </>
              ) : (
                <>
                  <Compass className="h-4 w-4" />
                  <span>Test My Current Location</span>
                </>
              )}
            </button>

            {errorMsg && (
              <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 p-3 text-xs text-rose-300">
                {errorMsg}
              </div>
            )}

            {userCoords && distance !== null && (
              <div className="space-y-2 bg-black/30 p-4 rounded-2xl border border-white/5 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/60">Your Coordinates:</span>
                  <span className="font-mono text-white">
                    {userCoords.latitude.toFixed(4)}, {userCoords.longitude.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-white/5">
                  <span className="text-white/60">Distance to College:</span>
                  <strong className={distance <= 1000 ? 'text-emerald-400 text-sm font-black' : 'text-rose-400 text-sm font-black'}>
                    {(distance / 1000).toFixed(2)} km ({distance}m)
                  </strong>
                </div>
                <div className="pt-2">
                  <span
                    className={`block text-center py-1 px-2 rounded-xl text-xs font-bold border ${
                      distance <= 1000
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    {distance <= 1000 ? '✅ Inside Campus Geofence' : '⚠️ Outside Campus Geofence'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Embedded Map Section */}
        <div className="overflow-hidden rounded-3xl border border-[#C5A059]/30 bg-[#0E1B2E] shadow-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-[#C5A059]" />
              <h3 className="font-classic text-lg font-bold text-[#F3E5AB]">Interactive Campus Satellite Map</h3>
            </div>
            <span className="text-xs text-[#C5A059]">Kamban College of Arts and Science for Women</span>
          </div>

          <div className="relative h-96 w-full overflow-hidden rounded-2xl border border-white/10">
            <iframe
              title="Kamban College Location Map"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight="0"
              marginWidth="0"
              src={`https://maps.google.com/maps?q=${CAMPUS_LAT},${CAMPUS_LNG}&hl=en&z=16&output=embed`}
              className="w-full h-full filter invert-[0.85] hue-rotate-180 contrast-125"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
