"use client";

import { cn } from "@/lib/utils";

export function ShippingLoader({ label = "Loading cargo", className, compact = false }) {
  return (
    <div className={cn("flex flex-col items-center justify-center", compact ? "gap-2" : "gap-4", className)}>
      <div 
        className="ship-loader-icon" 
        style={compact ? { transform: 'scale(0.6)', transformOrigin: 'center center', margin: '-26px 0' } : undefined}
      >
        <div className="ship">
          <div className="containers">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="ship-body" />
          <div className="ship-front" />
        </div>

        <div className="waves">
          <span />
          <span />
        </div>
      </div>
      
      {label && (
        <p className={cn("font-medium text-muted-foreground", compact ? "text-[11px]" : "text-sm")}>
          {label}
        </p>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .ship-loader-icon {
          width: 160px;
          height: 130px;
          position: relative;
          overflow: hidden;
        }

        .ship {
          position: absolute;
          left: 18px;
          bottom: 34px;
          width: 120px;
          height: 70px;
          animation: shipFloat 2s ease-in-out infinite;
        }

        .containers {
          position: absolute;
          left: 28px;
          bottom: 34px;
          display: grid;
          grid-template-columns: repeat(3, 20px);
          gap: 3px;
          z-index: 3;
        }

        .containers span {
          width: 20px;
          height: 13px;
          border-radius: 3px;
          background: #0ea5e9;
          animation: boxLoad 1.6s ease-in-out infinite;
        }

        .containers span:nth-child(2) { background: #22c55e; animation-delay: .12s; }
        .containers span:nth-child(3) { background: #f97316; animation-delay: .24s; }
        .containers span:nth-child(4) { background: #6366f1; animation-delay: .36s; }
        .containers span:nth-child(5) { background: #14b8a6; animation-delay: .48s; }
        .containers span:nth-child(6) { background: #ef4444; animation-delay: .6s; }

        .ship-body {
          position: absolute;
          bottom: 12px;
          left: 4px;
          width: 88px;
          height: 28px;
          background: linear-gradient(135deg, #0f172a, #1e40af);
          border-radius: 0 0 45px 45px;
        }

        .ship-front {
          position: absolute;
          right: 8px;
          bottom: 12px;
          width: 42px;
          height: 28px;
          background: #1e40af;
          clip-path: polygon(0 0, 100% 50%, 0 100%);
        }

        .waves {
          position: absolute;
          bottom: 12px;
          left: 0;
          width: 260px;
          height: 28px;
        }

        .waves span {
          position: absolute;
          width: 260px;
          height: 22px;
          background: radial-gradient(circle at 14px 14px, #38bdf8 8px, transparent 9px);
          background-size: 28px 22px;
          animation: waveMove 2s linear infinite;
        }

        .waves span:nth-child(2) {
          bottom: -8px;
          opacity: .35;
          animation-duration: 3s;
          animation-direction: reverse;
        }

        @keyframes shipFloat {
          0%, 100% {
            transform: translateY(0) rotate(-1deg);
          }
          50% {
            transform: translateY(-7px) rotate(1deg);
          }
        }

        @keyframes waveMove {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-56px);
          }
        }

        @keyframes boxLoad {
          0%, 20% {
            transform: translateY(-14px) scale(.8);
            opacity: 0;
          }
          35%, 100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
      `}} />
    </div>
  );
}
