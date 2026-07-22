import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DEMOS, type DemoUser } from "@/lib/groscore-data";
import {
  Landing, PhoneEntry, OtpEntry, NameEntry, Fetching,
  ConfirmIdentity, PanFallback, Analyzing, Paywall,
  LapsedWall, RazorpayMock, PaySuccess, HomeStub,
} from "@/lib/v2-flow";

export const Route = createFileRoute("/v2/")({
  head: () => ({
    meta: [
      { title: "GroScore v2 — Onboarding flow" },
      { name: "description", content: "New onboarding flow (playable)." },
      { property: "og:title", content: "GroScore v2 flow" },
      { property: "og:description", content: "Landing → OTP → identity → paywall." },
    ],
  }),
  component: V2Flow,
});

type Step =
  | "landing" | "phone" | "otp" | "name" | "fetching"
  | "confirm" | "pan" | "analyzing" | "paywall"
  | "lapsed" | "razorpay" | "success" | "home";

function V2Flow() {
  const [step, setStep] = useState<Step>("landing");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [pan, setPan] = useState("");

  const user: DemoUser | null = useMemo(() => DEMOS[phone] ?? null, [phone]);

  function afterOtp() {
    // Route by account state
    if (!user) { setStep("name"); return; }
    if (user.expired) { setStep("lapsed"); return; }
    setStep("name");
  }

  function afterName() {
    setStep("fetching");
  }

  function afterFetch() {
    if (user) setStep("confirm");
    else setStep("pan"); // no bureau match → PAN fallback
  }

  function paywallOrHome() {
    if (!user) { setStep("paywall"); return; }
    setStep("paywall");
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start bg-gray-100 py-6">
      <div className="w-full max-w-[420px] mb-3 flex items-center justify-between px-4 text-xs text-gray-500">
        <Link to="/v2/gallery" className="underline">Gallery</Link>
        <div>Step: <span className="font-mono">{step}</span></div>
        <button onClick={() => { setStep("landing"); setPhone(""); setName(""); setPan(""); }} className="underline">Reset</button>
      </div>
      <div className="w-full max-w-[420px] h-[820px] rounded-[36px] overflow-hidden border shadow-xl bg-white">
        {step === "landing" && <Landing onStart={() => setStep("phone")} />}
        {step === "phone" && <PhoneEntry initial={phone} onBack={() => setStep("landing")} onNext={(p) => { setPhone(p); setStep("otp"); }} />}
        {step === "otp" && <OtpEntry phone={phone} onBack={() => setStep("phone")} onChangeNumber={() => setStep("phone")} onNext={afterOtp} />}
        {step === "name" && <NameEntry initial={name || (user?.name ?? "")} onBack={() => setStep("otp")} onNext={(n) => { setName(n); afterName(); }} />}
        {step === "fetching" && <Fetching onDone={afterFetch} />}
        {step === "confirm" && user && (
          <ConfirmIdentity
            user={user} name={name}
            onYes={() => setStep("analyzing")}
            onEditName={() => setStep("name")}
            onChangeNumber={() => setStep("phone")}
            onNotMe={() => setStep("pan")}
          />
        )}
        {step === "pan" && <PanFallback onBack={() => setStep("confirm")} onNext={(p) => { setPan(p); setStep("analyzing"); }} />}
        {step === "analyzing" && (
          <Analyzing
            user={user ?? { key: "ntc", phone: phone || "0000000000", name: name || "You", pan: pan || "XXXXX0000X", hasScore: false }}
            onDone={paywallOrHome}
          />
        )}
        {step === "paywall" && (
          <Paywall
            user={user ?? { key: "ntc", phone: phone || "0000000000", name: name || "You", pan: pan || "XXXXX0000X", hasScore: false }}
            onBack={() => setStep("analyzing")}
            onPay={() => setStep("razorpay")}
          />
        )}
        {step === "lapsed" && user && (
          <LapsedWall user={user} onBack={() => setStep("otp")} onPay={() => setStep("razorpay")} />
        )}
        {step === "razorpay" && (
          <RazorpayMock amount={user?.expired ? 99 : 9} onBack={() => setStep(user?.expired ? "lapsed" : "paywall")} onSuccess={() => setStep("success")} />
        )}
        {step === "success" && <PaySuccess onHome={() => setStep("home")} />}
        {step === "home" && (
          <HomeStub
            user={user ?? { key: "ntc", phone: phone || "0000000000", name: name || "You", pan: pan || "XXXXX0000X", hasScore: false }}
            onRestart={() => { setStep("landing"); setPhone(""); setName(""); setPan(""); }}
          />
        )}
      </div>
    </div>
  );
}
