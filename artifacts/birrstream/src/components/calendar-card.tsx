import { useState, useEffect } from "react";
import { Clock, Calendar as CalendarIcon, ShieldCheck } from "lucide-react";

interface CalendarCardProps {
  userCreatedAt?: string;
}

export function CalendarCard({ userCreatedAt }: CalendarCardProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const yy = now.getFullYear();
  const mm = now.getMonth();
  const dt = now.getDate();
  const dy = now.getDay();

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const daysEn = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const dayHeader = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // 6 Months Platform Cycle calculation
  // Base date is user creation date (or default 6 months from start of year)
  const startDate = userCreatedAt ? new Date(userCreatedAt) : new Date(yy, 0, 1);
  const targetDate = new Date(startDate.getTime());
  targetDate.setMonth(targetDate.getMonth() + 6); // 6 Months Duration

  const diffMs = Math.max(0, targetDate.getTime() - now.getTime());
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const diffMins = Math.floor((diffMs / (1000 * 60)) % 60);
  const diffSecs = Math.floor((diffMs / 1000) % 60);

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  // Month days calculation for the mini grid
  const firstDayIndex = new Date(yy, mm, 1).getDay();
  const totalDaysInMonth = new Date(yy, mm + 1, 0).getDate();

  const gridRows: (number | null)[][] = [];
  let currentDay = 1;

  for (let r = 0; r < 6; r++) {
    const row: (number | null)[] = [];
    let added = false;
    for (let c = 0; c < 7; c++) {
      if (r === 0 && c < firstDayIndex) {
        row.push(null);
      } else if (currentDay > totalDaysInMonth) {
        row.push(null);
      } else {
        row.push(currentDay);
        currentDay++;
        added = true;
      }
    }
    if (added || r === 0) {
      gridRows.push(row);
    }
    if (currentDay > totalDaysInMonth) break;
  }

  return (
    <div className="bg-[#1A1A1A] text-white rounded-3xl p-5 border border-white/10 shadow-2xl mb-6 relative overflow-hidden -mx-4">
      {/* 6-Month Platform Season Header Badge */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base leading-tight" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}>
              6-MONTH PLATFORM CYCLE
            </h3>
            <p className="text-[11px] text-gray-400" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.04em" }}>
              Active Operational Period
            </p>
          </div>
        </div>
        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1" style={{ fontFamily: "'Highstories', sans-serif" }}>
          <ShieldCheck className="w-3 h-3" /> VERIFIED 6M
        </span>
      </div>

      {/* Main Calendar Tear-Off Card (Styled after calendar/dist) */}
      <div className="relative max-w-sm mx-auto bg-gradient-to-b from-[#F9F8F6] to-[#EFECE6] text-[#139AB4] rounded-2xl p-4 shadow-xl border border-gray-300">
        {/* Top Header Pins */}
        <div className="flex items-center justify-between bg-[#E3E3E3] -mx-4 -mt-4 px-4 py-2 rounded-t-2xl border-b border-gray-300 mb-3 text-gray-500 font-bold text-xs">
          <div className="w-5 h-5 bg-white rounded-full border border-gray-300 shadow-inner flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
          </div>
          <span className="text-gray-600 tracking-widest font-mono">{yy}</span>
          <div className="w-5 h-5 bg-white rounded-full border border-gray-300 shadow-inner flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
          </div>
        </div>

        {/* Calendar Body: Month & Large Date Number */}
        <div className="flex items-baseline justify-around my-1">
          <div className="text-left font-bold text-[#139AB4]">
            <p className="text-2xl font-black leading-none">{pad(mm + 1)}</p>
            <p className="text-xs uppercase tracking-wider text-gray-500">{months[mm].substring(0, 3)}</p>
          </div>
          <div 
            className="text-[100px] font-black leading-none text-[#FED538] select-none"
            style={{ fontFamily: "'Anton', sans-serif", textShadow: "2px 2px 0px rgba(0,0,0,0.15)" }}
          >
            {dt}
          </div>
        </div>

        {/* Footer Section: Full Month Mini Grid & Day */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-300 items-center">
          {/* Mini Calendar Month Table */}
          <div>
            <p className="text-[10px] font-bold text-gray-600 uppercase mb-1 text-center font-mono">
              {months[mm]} {yy}
            </p>
            <table className="w-full text-[10px] text-gray-700 text-center border-collapse">
              <thead>
                <tr className="text-[#FED538] font-bold">
                  {dayHeader.map((d, i) => (
                    <th key={i} className="p-0.5">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gridRows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((dayNum, cIdx) => (
                      <td 
                        key={cIdx} 
                        className={`p-0.5 text-[9px] ${
                          dayNum === dt 
                            ? "bg-[#FED538] text-black font-extrabold rounded-full" 
                            : dayNum 
                            ? "text-gray-800" 
                            : ""
                        }`}
                      >
                        {dayNum ?? ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Weekday Info */}
          <div className="text-center space-y-1">
            <p className="text-xs font-bold text-gray-500 tracking-wider font-mono">{daysEn[dy]}</p>
            <p className="text-sm font-extrabold text-[#139AB4]">{months[mm]} {dt}</p>
            <span className="inline-block bg-[#139AB4]/10 text-[#139AB4] px-2 py-0.5 rounded text-[10px] font-semibold">
              DAY {Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} OF 180
            </span>
          </div>
        </div>
      </div>

      {/* 6-Month Live Countdown Timer Box (Replaces FuncBox timer, NO toggle, NO Chinese text) */}
      <div className="mt-4 bg-black/60 rounded-2xl p-3 border border-white/10 flex flex-col items-center justify-center text-center space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-yellow-400 font-semibold" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.05em" }}>
          <Clock className="w-3.5 h-3.5 animate-pulse" />
          <span>6-MONTH PLATFORM COUNTDOWN</span>
        </div>
        <div className="text-xl md:text-2xl font-bold font-mono text-cyan-400 tracking-wider">
          {diffDays}d {pad(diffHours)}h {pad(diffMins)}m {pad(diffSecs)}s
        </div>
        <p className="text-[10px] text-gray-400" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.04em" }}>
          Exact 6-Month Season Remaining Duration
        </p>
      </div>
    </div>
  );
}
