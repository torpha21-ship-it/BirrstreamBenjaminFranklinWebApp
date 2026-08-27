import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/context/language-context";

export default function NotFound() {
  const { isAmharic } = useLanguage();
  const displayFont = {
    fontFamily: isAmharic ? "'LogaComic', sans-serif" : "'Plus Jakarta Sans', sans-serif",
    letterSpacing: isAmharic ? "0" : "-0.01em",
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 items-center">
            <AlertCircle className="h-8 w-8 text-red-500 flex-shrink-0" />
            <h1 className="text-2xl font-bold text-gray-900" style={displayFont}>
              {isAmharic ? "404 ገጹ አልተገኘም" : "404 Page Not Found"}
            </h1>
          </div>

          <p className="mt-4 text-sm text-gray-600 mb-6" style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>
            {isAmharic ? "የፈለጉት ገጽ አልተገኘም ወይም ተንቀሳቅሷል።" : "The page you are looking for does not exist or has been moved."}
          </p>

          <Link href="/dashboard" className="inline-flex px-5 py-2.5 bg-primary text-white rounded-2xl font-bold text-sm" style={displayFont}>
            {isAmharic ? "ወደ ዳሽቦርድ ተመለስ" : "Back to Dashboard"}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
