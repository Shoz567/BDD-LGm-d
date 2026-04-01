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
          <PolarGrid stroke="rgba(255,255,255, 0.25)" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#f8fafc', fontSize: 13, fontWeight: 500 }} 
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
            stroke="#60a5fa"
            strokeWidth={2}
            fill="#3b82f6"
            fillOpacity={0.5}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1e293b', 
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f8fafc' 
            }}
            formatter={(value: unknown) => [`${value}%`, 'Autonomie']}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
