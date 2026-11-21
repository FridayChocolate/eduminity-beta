import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, ShieldAlert } from "lucide-react";

export default function Ak47EasterEgg() {
  const navigate = useNavigate();

  const sections = [
    {
      title: "Step 1: Safety & Field Strip (Disassembly)",
      catQuote: "Meow! First rule of tactical naps: always make sure it's empty before touching anything.",
      steps: [
        "Point the muzzle in a safe direction and engage the safety (push the selector lever all the way up).",
        "Press the magazine release paddle behind the magazine well and rock the magazine forward to remove it.",
        "Move the selector lever down, pull the charging handle all the way back, and visually inspect the chamber to confirm it is clear. Let the bolt go forward and pull the trigger in a safe direction.",
        "Press the dust cover release button at the back of the receiver and lift the top dust cover off.",
        "Push the recoil spring assembly forward out of its slot and pull it straight out.",
        "Pull the bolt carrier and gas piston all the way to the rear, then lift it up and out of the receiver.",
        "Rotate the bolt head inside the bolt carrier until the cam lug clears the track, then slide the bolt out.",
        "Flip up the gas tube locking lever on the right side of the rear sight block and lift the upper handguard/gas tube off.",
      ],
    },
    {
      title: "Step 2: Putting It Back Together (Reassembly)",
      catQuote: "Purrfect. Now reverse the chaos before the hoomans notice.",
      steps: [
        "Set the gas tube back onto the gas block and push the locking lever down until it clicks into place.",
        "Slide the bolt back into the bolt carrier, twist the bolt head so the cam lug locks into the channel, and push the bolt all the way forward.",
        "Align the bolt carrier's gas piston with the gas tube, drop the carrier into the rear cutouts of the receiver rails, and push it forward.",
        "Insert the recoil spring assembly into the back of the bolt carrier, compress it slightly, and seat the rear guide into the receiver slot.",
        "Hook the front of the dust cover into the groove behind the rear sight block, press down on the back, and smack it firmly until the release button pops through.",
        "Rack the charging handle a couple of times to verify smooth cycling, then flip the safety lever back up.",
      ],
    },
    {
      title: "Step 3: Firing Basics",
      catQuote: "Keep your paws steady and your ears covered—this thing is louder than a vacuum cleaner!",
      steps: [
        "Insert a loaded magazine by hooking the front lip into the magwell and rocking it backward until it clicks.",
        "Flip the selector lever down (middle = full-auto on military models, bottom = semi-auto).",
        "Pull the charging handle all the way to the rear and release it cleanly (don't ride it forward) to chamber a round.",
        "Tuck the stock firmly into your shoulder, align the front sight post centered inside the rear sight notch, and place it on target.",
        "Exhale steadily and squeeze the trigger smoothly straight to the rear without jerking.",
        "When finished, flip the selector lever all the way back up to Safe.",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0B10] text-white px-4 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/app/materials")}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Study Hub
        </Button>

        {/* Cute Cat Header */}
        <div className="bg-gradient-to-br from-amber-500/15 via-[#1A1A24] to-teal-500/15 border border-amber-500/30 rounded-2xl p-6 sm:p-8 text-center shadow-2xl">
          <div className="text-6xl sm:text-7xl mb-3 select-none">🐱🎖️</div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full mb-3">
            <Sparkles className="h-3.5 w-3.5" /> Secret Easter Egg Unlocked
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Sergeant Whiskers&apos; AK-47 Field Manual
          </h1>
          <p className="text-gray-300 mt-2 text-sm sm:text-base max-w-xl mx-auto">
            You searched for <span className="text-teal-400 font-mono font-bold">AK47</span> instead of studying for finals. Bold move. Here&apos;s your completely unauthorized briefing.
          </p>
        </div>

        {/* Guide Sections */}
        <div className="space-y-5">
          {sections.map((section, idx) => (
            <div
              key={idx}
              className="bg-[#16161F] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4"
            >
              <h2 className="text-lg sm:text-xl font-bold text-teal-400">
                {section.title}
              </h2>
              <div className="bg-white/5 border-l-4 border-amber-400 px-4 py-2.5 rounded-r-lg text-sm text-amber-200 italic">
                🐾 Sgt. Whiskers: &ldquo;{section.catQuote}&rdquo;
              </div>
              <ol className="list-decimal list-inside space-y-2 text-sm sm:text-base text-gray-300 leading-relaxed">
                {section.steps.map((step, stepIdx) => (
                  <li key={stepIdx}>{step}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-start gap-3 text-xs sm:text-sm text-rose-200">
          <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          <p>
            Okay, fun&apos;s over—go back and actually study your notes before your next exam. Sgt. Whiskers is watching your CGPA.
          </p>
        </div>
      </div>
    </div>
  );
}