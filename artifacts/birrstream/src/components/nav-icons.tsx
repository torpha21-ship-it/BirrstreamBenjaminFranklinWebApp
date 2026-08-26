interface NavIconProps {
  className?: string;
  blackStroke?: string;
  greenStroke?: string;
}

export function NavHomeIcon({ className = "", blackStroke = "#121331", greenStroke = "#185219" }: NavIconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 430 430" fill="none" className={className}>
      <g strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="21.1024" strokeWidth="24">
        <path stroke={blackStroke} d="m346.9 376.6.9-.1V176.3" />
        <path stroke={greenStroke} d="M270.4 104.5V69.8h47.1v77.4M173.8 376.6V238.4h83.6v138.2" />
        <path stroke={blackStroke} d="M50.7 204.4 215.6 53.7l162.6 150.8" />
        <path stroke={blackStroke} d="M81.6 176.1v200.5h266.3" />
      </g>
    </svg>
  );
}

export function NavTasksIcon({ className = "", blackStroke = "#121331", greenStroke = "#185219" }: NavIconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 430 430" fill="none" className={className}>
      <g strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="24">
        <path stroke={greenStroke} d="M332.4 181.9 286 135.5m0 46.4 46.4-46.4" />
        <path stroke={blackStroke} d="M309.2 225.4c36.837 0 66.7-29.863 66.7-66.7S346.037 92 309.2 92s-66.7 29.863-66.7 66.7 29.863 66.7 66.7 66.7" />
        <path stroke={greenStroke} d="m88.9 166.9 16.4 16.4 49.2-49.2" />
        <path stroke={blackStroke} d="M121.7 225.4c36.837 0 66.7-29.863 66.7-66.7S158.537 92 121.7 92 55 121.863 55 158.7s29.863 66.7 66.7 66.7m-29.8 62h86.2m-112.8 0h.7m25.9 51.2h86.2m-112.8 0h.7m213.4-51.2h86.1m-112.699 0h.7m25.899 51.2h86.1m-112.699 0h.7" />
      </g>
    </svg>
  );
}

export function NavGamesIcon({ className = "", blackStroke = "#121331", greenStroke = "#185219" }: NavIconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 430 430" fill="none" className={className}>
      <g strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="24">
        <path stroke={blackStroke} d="M165.3 285.9v-23.2c0-7 5.7-12.8 12.8-12.8h73.5c7 0 12.8 5.7 12.8 12.8v23.2" />
        <path stroke={greenStroke} d="M100.9 285.9v-15.6c0-8.6 7-15.6 15.6-15.6s15.6 7 15.6 15.6v15.6m165.4 0v-15.6c0-8.6 7-15.6 15.6-15.6s15.6 7 15.6 15.6v15.6" />
        <path stroke={blackStroke} d="M349.6 285.9H80c-6.6 0-12 5.4-12 12v65.3c0 6.6 5.4 12 12 12h269.6c6.6 0 12-5.4 12-12v-65.3c0-6.6-5.4-12-12-12m-119.2-36v-102m-31.3 102v-102" />
        <path stroke={greenStroke} d="M214.8 150.6c26.399 0 47.8-21.401 47.8-47.8 0-26.4-21.401-47.8-47.8-47.8S167 76.4 167 102.8s21.401 47.8 47.8 47.8" />
      </g>
    </svg>
  );
}

export function NavSupportIcon({ className = "", blackStroke = "#121331", greenStroke = "#185219" }: NavIconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 430 430" fill="none" className={className}>
      <g strokeLinecap="round" strokeLinejoin="round" strokeWidth="24">
        <path stroke={blackStroke} strokeMiterlimit="10" d="M130 290c16.569 0 30-13.431 30-30s-13.431-30-30-30-30 13.431-30 30 13.431 30 30 30" />
        <path stroke={blackStroke} d="M65 360c0-24.853 20.147-45 45-45h40c24.853 0 45 20.147 45 45v15H65z" />
        <path stroke={blackStroke} strokeMiterlimit="10" d="M300 290c16.569 0 30-13.431 30-30s-13.431-30-30-30-30 13.431-30 30 13.431 30 30 30" />
        <path stroke={blackStroke} d="M235 360c0-24.853 20.147-45 45-45h40c24.853 0 45 20.147 45 45v15H235z" />
        <path stroke={greenStroke} strokeMiterlimit="10" d="M75 45c-11.046 0-20 8.954-20 20v60c0 11.046 8.954 20 20 20h45v40l60-40h45c11.046 0 20-8.954 20-20V65c0-11.046-8.954-20-20-20z" />
        <path stroke={greenStroke} strokeMiterlimit="10" d="M205 70c-11.046 0-20 8.954-20 20v55c0 11.046 8.954 20 20 20h45l60 40v-40h45c11.046 0 20-8.954 20-20V90c0-11.046-8.954-20-20-20z" />
      </g>
    </svg>
  );
}

export function NavProfileIcon({ className = "", blackStroke = "#121331", greenStroke = "#185219" }: NavIconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 430 430" fill="none" className={className}>
      <g strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="24">
        <path stroke={blackStroke} d="M276.174 138.652v33.321c0 33.631-27.234 60.865-60.864 60.865h-1.445c-33.63 0-60.865-27.234-60.865-60.865V142.16" />
        <path stroke={blackStroke} d="M246.567 243.464h11.348c43.224 0 78.196 34.971 78.196 78.195v31.361c0 8.356-6.809 15.268-15.268 15.268h-21.561.207-.104C261.216 371.28 258.637 385 239.965 385h-52.096c-18.672 0-21.148-13.72-59.421-16.712h-19.291a15.234 15.234 0 0 1-15.268-15.268v-31.361c0-43.224 34.972-78.195 78.196-78.195h8.975v-20.117 19.601c0 17.331 14.133 31.464 31.464 31.464H215c17.331 0 31.464-14.133 31.464-31.464v-18.672z" />
        <path stroke={greenStroke} d="M276.174 141.747s2.579-39.407-37.757-60.452c0 0-12.276 45.7-89.337 61.69 0 0-26.409-77.68 6.603-96.558 3.713-2.063 9.8-1.857 13.307.412 5.055 3.198 10.11 8.46 13.205 11.142 2.373 2.063 5.467 3.198 8.665 2.991 4.333-.206 10.42-1.444 16.403-4.642 26.214-10.787 74.861-9.903 75.823 31.155.619 26.409 2.476 48.279-6.912 54.262m-28.678 185.277c0-10.11 1.031-18.26 2.269-18.26h.206c.516 0 2.373 1.341 5.984 5.055 6.499-6.293 12.895-6.293 19.394 0 3.611-3.714 5.468-5.055 5.983-5.055h.207c1.238 0 2.269 8.15 2.269 18.26v-1.135 2.27c0 8.871-7.221 16.093-16.093 16.093h-4.126c-8.872 0-16.093-7.222-16.093-16.093v-2.27" />
      </g>
    </svg>
  );
}
