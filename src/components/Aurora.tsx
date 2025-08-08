import { useEffect, useRef, useState } from "react";

import "./Aurora.css";

interface AuroraProps {
  colorStops?: string[];
  amplitude?: number;
  blend?: number;
  time?: number;
  speed?: number;
}

export default function Aurora(props: AuroraProps) {
  const {
    colorStops = ["#5227FF", "#7cff67", "#5227FF"],
  } = props;
  
  const ctnDom = useRef<HTMLDivElement>(null);
  const [useWebGL, setUseWebGL] = useState(false);

  useEffect(() => {
    // Always use CSS version for reliability
    setUseWebGL(false);
  }, []);

  return (
    <div ref={ctnDom} className="aurora-container">
      <div className="aurora-gradient-bg">
        {/* Primary Aurora Layer */}
        <div 
          className="aurora-layer aurora-primary"
          style={{
            background: `
              radial-gradient(ellipse 100% 60% at 50% 0%, rgba(82, 39, 255, 0.6) 0%, rgba(82, 39, 255, 0.2) 40%, transparent 70%),
              radial-gradient(ellipse 80% 50% at 20% 30%, rgba(124, 255, 103, 0.4) 0%, rgba(124, 255, 103, 0.1) 50%, transparent 80%),
              radial-gradient(ellipse 70% 40% at 80% 40%, rgba(82, 39, 255, 0.5) 0%, rgba(82, 39, 255, 0.2) 60%, transparent 90%)
            `,
          }}
        />
        
        {/* Secondary Aurora Layer */}
        <div 
          className="aurora-layer aurora-secondary"
          style={{
            background: `
              radial-gradient(ellipse 90% 45% at 30% 20%, rgba(124, 255, 103, 0.5) 0%, rgba(124, 255, 103, 0.15) 45%, transparent 75%),
              radial-gradient(ellipse 60% 80% at 70% 10%, rgba(82, 39, 255, 0.4) 0%, rgba(82, 39, 255, 0.1) 55%, transparent 85%),
              radial-gradient(ellipse 85% 35% at 50% 25%, rgba(124, 255, 103, 0.3) 0%, rgba(124, 255, 103, 0.08) 65%, transparent 95%)
            `,
          }}
        />
        
        {/* Tertiary Aurora Layer */}
        <div 
          className="aurora-layer aurora-tertiary"
          style={{
            background: `
              radial-gradient(ellipse 75% 55% at 60% 15%, rgba(82, 39, 255, 0.35) 0%, rgba(82, 39, 255, 0.08) 50%, transparent 80%),
              radial-gradient(ellipse 65% 70% at 40% 35%, rgba(124, 255, 103, 0.3) 0%, rgba(124, 255, 103, 0.06) 60%, transparent 90%),
              radial-gradient(ellipse 95% 30% at 80% 20%, rgba(82, 39, 255, 0.25) 0%, rgba(82, 39, 255, 0.05) 70%, transparent 100%)
            `,
          }}
        />
        
        {/* Shimmer Layer */}
        <div className="aurora-layer aurora-shimmer" />
      </div>
    </div>
  );
}
