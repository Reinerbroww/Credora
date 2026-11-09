"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

export interface DonutDatum {
  label: string;
  value: number;
  color: string;
}

export function DonutChart({
  data,
  centerLabel,
  centerValue,
  size = 168,
  thickness = 18,
}: {
  data: DonutDatum[];
  centerLabel: string;
  centerValue: string;
  size?: number;
  thickness?: number;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={thickness}
        />
        {total > 0 &&
          data.map((item) => {
            const length = (item.value / total) * circumference;
            const dash = Math.max(length - 3, 0);
            const segment = (
              <circle
                key={item.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth={thickness}
                strokeLinecap="round"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
              />
            );
            offset += length;
            return segment;
          })}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="stat-number text-[26px] font-semibold leading-none text-white">
            {centerValue}
          </p>
          <p className="mt-1 text-[10.5px] uppercase tracking-[0.16em] text-muted">
            {centerLabel}
          </p>
        </div>
      </div>
    </div>
  );
}

export function DonutLegend({ data }: { data: DonutDatum[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return (
    <ul className="space-y-2.5">
      {data.map((item) => {
        const share = total === 0 ? 0 : Math.round((item.value / total) * 100);
        return (
          <li key={item.label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-[12px] text-muted">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.label}
            </span>
            <span className="flex items-baseline gap-2">
              <span className="stat-number text-[13px] font-semibold text-white">
                {item.value}
              </span>
              <span className="stat-number w-9 text-right text-[11px] text-muted">
                {share}%
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export interface TrendDatum {
  label: string;
  value: number;
}

export function TrendChart({ data }: { data: TrendDatum[] }) {
  const gradientId = useId().replace(/:/g, "");
  const width = 640;
  const height = 230;
  const padding = { top: 16, right: 14, bottom: 30, left: 34 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const maxValue = Math.max(...data.map((item) => item.value), 1);
  const step = maxValue <= 5 ? 1 : Math.ceil(maxValue / 4);
  const yMax = step * 4;
  const yTicks = Array.from({ length: 5 }, (_, index) => index * step);

  const pointFor = (value: number, index: number) => {
    const x =
      padding.left + (data.length <= 1 ? innerWidth / 2 : (innerWidth * index) / (data.length - 1));
    const y = padding.top + innerHeight - (value / yMax) * innerHeight;
    return { x, y };
  };

  const points = data.map((item, index) => pointFor(item.value, index));
  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${padding.top + innerHeight} L ${points[0].x} ${padding.top + innerHeight} Z`
      : "";

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-[220px] w-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Application trend chart"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#B8D9A8" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#B8D9A8" stopOpacity="0" />
          </linearGradient>
        </defs>

        {yTicks.map((tick) => {
          const y = padding.top + innerHeight - (tick / yMax) * innerHeight;
          return (
            <g key={tick}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="3 5"
              />
              <text
                x={padding.left - 10}
                y={y + 3.5}
                textAnchor="end"
                fontSize="10"
                fill="rgba(163,174,167,0.8)"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} />}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="#B8D9A8"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {points.map((point, index) => (
          <g key={data[index].label}>
            <circle cx={point.x} cy={point.y} r="4.5" fill="#111714" stroke="#B8D9A8" strokeWidth="2" />
            <text
              x={point.x}
              y={height - 8}
              textAnchor="middle"
              fontSize="10"
              fill="rgba(163,174,167,0.9)"
            >
              {data[index].label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export interface BarDatum {
  label: string;
  value: number;
  color: string;
}

export function HorizontalBarChart({ data }: { data: BarDatum[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  return (
    <div className="space-y-4">
      {data.map((item) => {
        const share = Math.round((item.value / total) * 100);
        return (
          <div key={item.label}>
            <div className="mb-1.5 flex items-center justify-between text-[12px]">
              <span className="text-muted">{item.label}</span>
              <span className="stat-number font-medium text-white">
                {item.value}
                <span className="ml-1.5 text-muted">{share}%</span>
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{
                  width: `${Math.max(share, item.value > 0 ? 3 : 0)}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ProbabilityGauge({ value }: { value: number }) {
  const size = 176;
  const thickness = 12;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(value, 0), 1);
  const color =
    clamped < 0.18 ? "#58A878" : clamped < 0.42 ? "#E5B93F" : "#E45B56";

  return (
    <div
      className="relative grid place-items-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={thickness}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={`${Math.max(clamped * circumference - 2, 0)} ${circumference}`}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="stat-number text-[30px] font-semibold leading-none text-white">
            {(clamped * 100).toFixed(1)}
            <span className="ml-0.5 text-[16px] text-muted">%</span>
          </p>
          <p className="mt-1.5 text-[10px] uppercase tracking-[0.16em] text-muted">
            Default probability
          </p>
        </div>
      </div>
    </div>
  );
}

export function FactorBars({
  factors,
}: {
  factors: Array<{
    label: string;
    value: string;
    weight: number;
    direction: "increases" | "decreases";
  }>;
}) {
  return (
    <div className="space-y-4">
      {factors.map((factor) => (
        <div key={factor.label}>
          <div className="mb-1.5 flex items-center justify-between gap-3 text-[12px]">
            <span className="text-white">
              {factor.label}
              <span className="ml-2 text-muted">{factor.value}</span>
            </span>
            <span
              className={cn(
                "shrink-0 text-[11px] font-medium",
                factor.direction === "increases"
                  ? "text-[#f3938f]"
                  : "text-[#8fd3ab]",
              )}
            >
              {factor.direction === "increases" ? "Increases risk" : "Reduces risk"}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
            <div
              className={cn(
                "h-full rounded-full",
                factor.direction === "increases" ? "bg-risk-high/70" : "bg-risk-low/70",
              )}
              style={{ width: `${Math.max(factor.weight, 4)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
