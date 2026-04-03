'use client';

import React from 'react';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-50 bg-[#f9fafa]">
      {/* Base gradient overlays to match brand styles */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f3eee7] to-[#f9fafa]" />

      {/* Floating animated blobs */}
      <div className="absolute inset-0 opacity-70">
        {/* Top left orange blob */}
        <div className="absolute -top-1/4 -left-1/4 w-[50vw] h-[50vw] bg-[#e97123] rounded-full mix-blend-multiply filter blur-[120px] opacity-30 animate-blob" />
        
        {/* Top right dark green blob */}
        <div className="absolute -top-1/4 -right-1/4 w-[60vw] h-[60vw] bg-[#294e46] rounded-full mix-blend-multiply filter blur-[150px] opacity-20 animate-blob animation-delay-2000" />
        
        {/* Bottom center light green blob */}
        <div className="absolute -bottom-1/4 left-1/4 w-[55vw] h-[55vw] bg-[#3a6b61] rounded-full mix-blend-multiply filter blur-[140px] opacity-20 animate-blob animation-delay-4000" />
      </div>
      
      {/* Subtle Noise / texture for a premium tactile feel on glassmorphism */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      ></div>
    </div>
  );
}
