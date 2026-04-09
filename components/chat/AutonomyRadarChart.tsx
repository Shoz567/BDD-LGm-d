'use client';

import { useMemo } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { GIRScore } from '@/lib/types';

interface AutonomyRadarChartProps {
  gir: GIRScore;
}

export function AutonomyRadarChart({ gir }: AutonomyRadarChartProps) {
  const chartData = useMemo(() => {
    if (!gir || !gir.detailVariables) return [];

    const d = gir.detailVariables;

    // Helper to calculate percentage of dependency for a group
    // Each area has a max theoretical score based on lib/scoring.ts weights
    const getGroupScore = (keys: string[], maxScore: number) => {
      const sum = keys.reduce((acc, key) => acc + (d[key] || 0), 0);
      // Invert dependency into an autonomy score (0% dep = 100% autonomy)
      const maxDepPercentage = Math.min(Math.round((sum / maxScore) * 100), 100);
      return 100 - maxDepPercentage;
    };

    // Define major axes of dependence
    return [
      {
        subject: 'Mobilité & Transferts',
        A: getGroupScore(['Mobilité intérieure', 'Déplacements extérieurs', 'Transferts'], 3 + 1 + 3),
        fullMark: 100,
      },
      {
        subject: 'Hygiène & Toilette',
        A: getGroupScore(['Toilette', 'Élimination'], 3 + 4.5),
        fullMark: 100,
      },
      {
        subject: 'Actes Quotidiens',
        A: getGroupScore(['Habillage', 'Alimentation'], 2 + 2),
        fullMark: 100,
      },
      {
        subject: 'Cognition & Com.',
        A: getGroupScore(['Cohérence', 'Orientation', 'Communication'], 4 + 4 + 1),
        fullMark: 100,
      },
      {
        subject: 'Vulnérabilité',
        A: 100 - Math.min(((d['Situation récente'] || 0) * 33) + ((d['Bonus âge'] || 0) * 20), 100),
        fullMark: 100,
      }
    ];
  }, [gir]);

  if (chartData.length === 0) return null;

  return (
    <div style={{ width: '100%', height: 350, position: 'relative' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="55%" data={chartData}>
          <defs>
            <linearGradient id="colorAutonomy" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#e97123" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#f29a5e" stopOpacity={0.2}/>
            </linearGradient>
          </defs>
          <PolarGrid stroke="rgba(228, 235, 231, 0.8)" strokeDasharray="3 3" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: 'var(--brand-primary)', fontSize: 13, fontWeight: 700 }} 
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]} 
            tick={false} 
            axisLine={false} 
          />
          <Radar
            name="Niveau d'autonomie (%)"
            dataKey="A"
            stroke="url(#colorAutonomy)"
            strokeWidth={3}
            fill="url(#colorAutonomy)"
            fillOpacity={1}
            activeDot={{ r: 6, fill: '#e97123', stroke: '#fff', strokeWidth: 2 }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.7)', 
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              borderRadius: '16px',
              color: '#17212b',
              fontWeight: 600,
              boxShadow: '0 12px 30px rgba(233, 113, 35, 0.18)'
            }}
            itemStyle={{ color: '#e97123' }}
            formatter={(value: unknown) => [`${value}%`, 'Autonomie']}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
