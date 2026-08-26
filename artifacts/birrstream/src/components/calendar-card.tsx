import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/context/language-context";

interface CalendarCardProps {
  userCreatedAt?: string;
}

/**
 * Modular-counter digit maps.
 * A 3×8 grid of blocks (24 total). Each digit 0-9 is defined by which blocks
 * are "visible" (in-position) vs "hidden" (translated off-screen).
 * 1 = visible, 0 = hidden (moved away).
 */
const DIGIT_MAPS: Record<number, number[]> = {
  0: [1,1,1, 1,0,1, 1,0,1, 1,0,1, 1,0,1, 1,0,1, 1,0,1, 1,1,1],
  1: [0,1,0, 0,1,0, 0,1,0, 0,1,0, 0,1,0, 0,1,0, 0,1,0, 0,1,0],
  2: [1,1,1, 0,0,1, 0,0,1, 1,1,1, 1,0,0, 1,0,0, 1,0,0, 1,1,1],
  3: [1,1,1, 0,0,1, 0,0,1, 1,1,1, 0,0,1, 0,0,1, 0,0,1, 1,1,1],
  4: [1,0,1, 1,0,1, 1,0,1, 1,1,1, 0,0,1, 0,0,1, 0,0,1, 0,0,1],
  5: [1,1,1, 1,0,0, 1,0,0, 1,1,1, 0,0,1, 0,0,1, 0,0,1, 1,1,1],
  6: [1,1,1, 1,0,0, 1,0,0, 1,1,1, 1,0,1, 1,0,1, 1,0,1, 1,1,1],
  7: [1,1,1, 0,0,1, 0,0,1, 0,0,1, 0,0,1, 0,0,1, 0,0,1, 0,0,1],
  8: [1,1,1, 1,0,1, 1,0,1, 1,1,1, 1,0,1, 1,0,1, 1,0,1, 1,1,1],
  9: [1,1,1, 1,0,1, 1,0,1, 1,1,1, 0,0,1, 0,0,1, 0,0,1, 1,1,1],
};

/** Slide direction varies by column to mimic the original CSS */
const SLIDE_DIRS: Record<number, [number, number]> = {
  0: [1, 0],   // left-column blocks slide right
  1: [0, -1],  // middle-column blocks slide down
  2: [-1, 0],  // right-column blocks slide left
};

function ModularDigit({ digit, color = "#139AB4" }: { digit: number; color?: string }) {
  const map = DIGIT_MAPS[digit] ?? DIGIT_MAPS[0];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "1.5px",
        width: "100%",
        height: "100%",
      }}
    >
      {map.map((visible, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const [dx, dy] = SLIDE_DIRS[col];
        // Stagger delays for organic animation feel
        const delay = ((row * 23 + col * 37 + i * 7) % 150);

        return (
          <div
            key={i}
            style={{
              backgroundColor: visible ? color : "transparent",
              borderRadius: "1.5px",
              transition: `all 0.45s cubic-bezier(0.65, 0, 0.35, 1) ${delay}ms`,
              transform: visible
                ? "translate(0, 0) scale(1)"
                : `translate(${dx * 120}%, ${dy * 120}%) scale(0.3)`,
              opacity: visible ? 1 : 0,
            }}
          />
        );
      })}
    </div>
  );
}

function CountdownGroup({ value, label, color }: { value: number; label: string; color: string }) {
  const tens = Math.floor(value / 10) % 10;
  const ones = value % 10;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
      <div style={{ display: "flex", gap: "3px", height: "52px" }}>
        <div style={{ width: "22px", height: "52px" }}>
          <ModularDigit digit={tens} color={color} />
        </div>
        <div style={{ width: "22px", height: "52px" }}>
          <ModularDigit digit={ones} color={color} />
        </div>
      </div>
      <span style={{
        fontSize: "9px",
        fontWeight: 700,
        color: "#888",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        fontFamily: "'Roboto', sans-serif",
      }}>
        {label}
      </span>
    </div>
  );
}

function ModularSeparator({ color }: { color: string }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      gap: "6px",
      height: "52px",
      padding: "0 2px",
    }}>
      <div style={{
        width: "5px",
        height: "5px",
        borderRadius: "50%",
        backgroundColor: color,
        opacity: 0.7,
      }} />
      <div style={{
        width: "5px",
        height: "5px",
        borderRadius: "50%",
        backgroundColor: color,
        opacity: 0.7,
      }} />
    </div>
  );
}

export function CalendarCard({ userCreatedAt }: CalendarCardProps) {
  const { isAmharic } = useLanguage();
  const [now, setNow] = useState(new Date());

  const displayFont = {
    fontFamily: isAmharic ? "'LogaComic', sans-serif" : "'Highstories', sans-serif",
    letterSpacing: isAmharic ? "0" : "0.06em",
  };

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const yy = now.getFullYear();
  const mm = now.getMonth();
  const dt = now.getDate();
  const dy = now.getDay();

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const daysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const daysShort = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayHeader = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // 6-Month Platform Target Countdown
  const startDate = userCreatedAt ? new Date(userCreatedAt) : new Date(yy, 0, 1);
  const targetDate = new Date(startDate.getTime());
  targetDate.setMonth(targetDate.getMonth() + 6); // 6 Months Duration

  const diffMs = Math.max(0, targetDate.getTime() - now.getTime());
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const diffMins = Math.floor((diffMs / (1000 * 60)) % 60);
  const diffSecs = Math.floor((diffMs / 1000) % 60);

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  // Month days calculation for fullMonth table
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

  const accentColor = "#139AB4";

  return (
    <div className="w-full relative z-10 flex flex-col items-center pt-32">
      {/* Exact CSS from calendar/dist/style.css */}
      <style>{`
        .orig-calendar-wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 360px;
          margin: 0 auto;
          transform: scale(0.7);
          transform-origin: top center;
        }

        .orig-calendar-wrapper .calendar {
          width: 100%;
          max-width: 320px;
          position: relative;
          box-shadow: -20px -5px 15px rgba(0, 0, 0, 0.3), -40px 30px 50px rgba(0, 0, 0, 0.3);
          margin-left: 16px;
        }

        .orig-calendar-wrapper .calendar::after {
          content: "";
          display: block;
          position: absolute;
          top: -3px;
          left: -16px;
          width: 15px;
          height: 100%;
          background: #A3A3A3;
          transform: skew(0, 20deg);
          border-left: 1px solid #888;
          overflow: hidden;
        }

        .orig-calendar-wrapper .calendar::before {
          content: "";
          display: block;
          width: 1px;
          height: 22px;
          background: #79746B;
          position: absolute;
          z-index: 2;
          top: 80%;
          left: -15px;
          opacity: 0.4;
          transform: skew(0, 20deg);
          box-shadow: 0 0 2px 1px #79746B, 1px -22px 2px 1px #A07F2E, 2px -44px 2px 1px #884940, 3px -66px 2px 1px #216164, 4px -88px 2px 1px #853555, 5px -110px 2px 1px #628279, 6px -132px 2px 1px #493B62, 7px -154px 2px 1px #772C22, 8px -176px 2px 1px #436251, 9px -198px 2px 1px #0B6575, 10px -220px 2px 1px #99834C, 11px -242px 2px 1px #4D4229, 12px -264px 2px 1px #89425A, 13px -286px 2px 1px #5A4C6A, 14px -308px 2px 1px #975B4B;
        }

        .orig-calendar-wrapper .header {
          text-align: center;
          padding: 10px 20px;
          background: #E3E3E3;
          color: #888888;
          font-weight: bold;
          letter-spacing: 1px;
          text-shadow: 1px 1px 1px #F6F6F6;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          z-index: 2;
        }

        .orig-calendar-wrapper .header::before {
          content: "";
          display: block;
          position: absolute;
          top: -6px;
          left: -7px;
          width: 100%;
          height: 6px;
          background: #D5D5D5;
          transform: skew(69deg, 0);
        }

        .orig-calendar-wrapper .header .pin {
          width: 30px;
          height: 30px;
          background: #F6F6F6;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          box-shadow: -3px 0 3px rgba(0, 0, 0, 0.1);
        }

        .orig-calendar-wrapper .header .pin::before {
          content: "";
          display: block;
          width: 100%;
          height: 4px;
          background: #EEE;
          box-shadow: 0 1px 1px #FFF;
        }

        .orig-calendar-wrapper .hook {
          width: 80%;
          height: 40px;
          background: linear-gradient(0deg, rgba(163, 163, 163, 0.3) 0%, #E3E3E3 100%);
          position: absolute;
          z-index: 1;
          left: 7%;
          top: -45px;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          box-shadow: -3px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .orig-calendar-wrapper .hook::before {
          content: "";
          display: block;
          width: 16px;
          height: 18px;
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          margin: auto;
          z-index: 2;
          background: #1A1A1A;
          border-radius: 100%;
        }

        .orig-calendar-wrapper .hook::after {
          content: "";
          display: block;
          width: 16px;
          height: 18px;
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          margin: auto auto auto -5px;
          z-index: 1;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 100%;
        }

        .orig-calendar-wrapper .body {
          background: #F2F2F2;
          background: linear-gradient(-30deg, #FFF 20%, #F2F2F2 70%);
          padding: 30px 20px 20px;
          color: #139AB4;
          text-transform: uppercase;
          position: relative;
          z-index: 3;
        }

        .orig-calendar-wrapper .body::before, .orig-calendar-wrapper .body::after {
          content: "";
          display: block;
          position: absolute;
          left: 0;
          top: 50%;
          width: 8px;
          height: 18px;
        }

        .orig-calendar-wrapper .body::before {
          background: #FED538;
          margin-top: -18px;
        }

        .orig-calendar-wrapper .body::after {
          background: #139AB4;
        }

        .orig-calendar-wrapper .body .month {
          display: inline-block;
          font-weight: bold;
          font-size: 16px;
          text-align: center;
        }

        .orig-calendar-wrapper .body .month p {
          margin: 0;
          padding: 0;
        }

        .orig-calendar-wrapper .body .date {
          font-size: 170px;
          font-weight: 700;
          text-align: center;
          color: #FED538;
          font-family: "Anton", sans-serif;
          margin: -30px 0 0 10px;
          transform: scale(1, 0.9);
          transform-origin: bottom right;
          letter-spacing: 5px;
          user-select: none;
        }

        .orig-calendar-wrapper .footer {
          width: 100%;
          height: 115px;
          display: flex;
          justify-content: space-between;
          text-align: center;
          align-items: center;
        }

        .orig-calendar-wrapper .footer .week {
          flex: 1;
          font-weight: 700;
          text-align: center;
          white-space: nowrap;
          margin-left: 0;
          font-family: "Roboto", sans-serif;
        }

        .orig-calendar-wrapper .footer .week p {
          margin: 0;
        }

        .orig-calendar-wrapper .footer .week p + p {
          margin-top: 6px;
        }

        .orig-calendar-wrapper .footer .day {
          font-weight: 700;
          font-size: 26px;
          color: #139AB4;
        }

        .orig-calendar-wrapper .footer .lunar {
          font-weight: 600;
          font-size: 12px;
          font-family: "Oswald", sans-serif;
          color: #666;
          letter-spacing: 1px;
        }

        .orig-calendar-wrapper .footer .en {
          font-size: 13px;
          color: #888;
          text-transform: capitalize;
        }

        .orig-calendar-wrapper .footer .icons {
          width: 12%;
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          align-items: center;
          height: 80%;
          color: #139AB4;
        }

        .orig-calendar-wrapper .footer .icons .material-icons {
          font-size: 16px;
        }

        .orig-calendar-wrapper .footer .icons .material-icons:first-child {
          font-size: 20px;
          color: #FED538;
        }

        .orig-calendar-wrapper .fullMonth {
          width: 32%;
        }

        .orig-calendar-wrapper .fullMonth .title {
          font-family: "Roboto", sans-serif;
          font-size: 12px;
          font-weight: bold;
          color: #139AB4;
          text-align: center;
          margin-bottom: 2px;
        }

        .orig-calendar-wrapper .fullMonth table {
          transform-origin: left top;
          transform: scale(0.85);
          margin-top: 2px;
          width: 100%;
        }

        .orig-calendar-wrapper .fullMonth th {
          font-family: "Roboto", sans-serif;
          font-size: 11px;
        }

        .orig-calendar-wrapper .fullMonth th:first-child, .orig-calendar-wrapper .fullMonth th:last-child {
          color: #FED538;
        }

        .orig-calendar-wrapper .fullMonth td {
          padding: 1px;
          position: relative;
          z-index: 2;
          text-align: center;
          vertical-align: middle;
          font-size: 11px;
          color: #333;
        }

        .orig-calendar-wrapper .fullMonth .now::after {
          content: "";
          display: block;
          width: 20px;
          height: 20px;
          border-radius: 100%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(254, 213, 56, 0.8);
          z-index: -1;
        }

        @keyframes modularPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(19, 154, 180, 0.15); }
          50% { box-shadow: 0 0 20px 4px rgba(19, 154, 180, 0.25); }
        }

        .modular-countdown-card {
          animation: modularPulse 3s ease-in-out infinite;
        }
      `}</style>

      {/* 3D Tear-Off Calendar scaled visual with exact container height to eliminate blank space below */}
      <div className="w-full flex justify-center items-center overflow-visible pt-10" style={{ height: "340px" }}>
        <div className="orig-calendar-wrapper">
          <div className="calendar">
            <div className="header"> 
              <div className="pin"></div>
              <p>{yy}</p>
              <div className="pin"></div>
            </div>
            <div className="hook"></div>
            <div className="body">
              <div className="month">
                <p>{pad(mm + 1)}</p>
                <p>{months[mm].substring(0, 3)}</p>
              </div>
              <div className="date">{dt}</div>
              <div className="footer">
                <div className="fullMonth">
                  <div className="title">{months[mm]}</div>
                  <table>
                    <thead>
                      <tr>
                        {dayHeader.map((d, i) => (
                          <th key={i}>{d}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {gridRows.map((row, rIdx) => (
                        <tr key={rIdx}>
                          {row.map((dayNum, cIdx) => (
                            <td key={cIdx} className={dayNum === dt ? "now" : ""}>
                              {dayNum ?? ""}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="week">
                  <p className="en">{daysShort[dy]}</p>
                  <p className="day">{daysEn[dy]}</p>
                  <p className="lunar">{isAmharic ? "የ 6 ወራት ጊዜ" : "6-MONTH SEASON"}</p>
                </div>
                <div className="icons">
                  <div className="material-icons">wb_sunny</div>
                  <div className="material-icons">cloud</div>
                  <div className="material-icons">brightness_1</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Months Countdown — Modular Block Counter Animation */}
      <div className="w-full -mx-4 mb-6 relative z-10">
        <div className="modular-countdown-card bg-white border-2 border-[#139AB4] rounded-3xl p-4 sm:p-5 shadow-lg shadow-[#139AB4]/15 text-center w-full">
          <p className="text-[#139AB4] text-xl sm:text-2xl font-bold mb-4 tracking-wide leading-snug" style={displayFont}>
            {isAmharic
              ? "ታማኝ ተጠቃሚዎች ትልቁን የገንዘብ ማውጫ ፕሮግራም እስኪጀምሩ የቀረው የ 6 ወራት የቁጥር ቆጠራ"
              : "6 Months Countdown Until The Sites Great Withdrawal Program For Its Loyal Users"}
          </p>

          {/* Modular Block Counter */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: "8px",
            background: "linear-gradient(135deg, #0a2e36 0%, #0d1b2a 50%, #0a2e36 100%)",
            borderRadius: "16px",
            padding: "16px 12px 12px",
            border: "1px solid rgba(19, 154, 180, 0.3)",
          }}>
            <CountdownGroup value={diffDays} label={isAmharic ? "ቀናት" : "DAYS"} color={accentColor} />
            <ModularSeparator color={accentColor} />
            <CountdownGroup value={diffHours} label={isAmharic ? "ሰዓት" : "HRS"} color={accentColor} />
            <ModularSeparator color={accentColor} />
            <CountdownGroup value={diffMins} label={isAmharic ? "ደቂቃ" : "MIN"} color={accentColor} />
            <ModularSeparator color={accentColor} />
            <CountdownGroup value={diffSecs} label={isAmharic ? "ሰከንድ" : "SEC"} color={accentColor} />
          </div>
        </div>
      </div>
    </div>
  );
}

