import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { DEMOS, type DemoUser } from "@/lib/groscore-data";
import {
  Landing, PhoneEntry, OtpEntry, NameEntry, Fetching,
  ConfirmIdentity, PanFallback, Analyzing, Paywall,
  LapsedWall, RazorpayMock, PaySuccess, HomeStub, T,
} from "@/lib/v2-flow";

type Entry = "new" | "active" | "expired";

export const Route = createFileRoute("/v2/")({
  validateSearch: (s: Record<string, unknown>): { entry?: Entry } => {
    const e = s.entry;
    return { entry: e === "active" || e === "expired" || e === "new" ? e : undefined };
  },
  head: () => ({
    meta: [
      { title: "GroScore v2 — Onboarding" },
      { name: "description", content: "Playable onboarding flow — new, active and expired users." },
      { property: "og:title", content: "GroScore v2 — Onboarding" },
      { property: "og:description", content: "Playable onboarding flow — new, active and expired users." },
    ],
  }),
  component: V2Flow,
});

type Step =
  | "entry"
  | "landing" | "phone" | "otp" | "name" | "fetching"
  | "confirm" | "pan" | "analyzing" | "paywall"
  | "lapsed" | "razorpay" | "success" | "home";

const NEW_PHONE = "9876500001";     // NTC — full journey ends on NTC paywall
const ACTIVE_PHONE = "9876500002";   // paid subscriber — straight to chats
const EXPIRED_PHONE = "9876500003";  // lapsed — ₹99 restart wall

function V2Flow() {
  const { entry } = useSearch({ from: "/v2/" });
  const [step, setStep] = useState<Step>("entry");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [pan, setPan] = useState("");
  const [confirmedName, setConfirmedName] = useState("");
  const [flow, setFlow] = useState<Entry | null>(null);

  const user: DemoUser | null = useMemo(() => DEMOS[phone] ?? null, [phone]);

  // Wire URL param → auto-start the right flow
  useEffect(() => {
    if (!entry) return;
    if (entry === "new") startNew();
    if (entry === "active") startActive();
    if (entry === "expired") startExpired();
    // run only when entry changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry]);

  function reset() {
    setStep("entry");
    setPhone(""); setName(""); setPan(""); setConfirmedName("");
    setFlow(null);
  }

  function startNew() {
    setFlow("new");
    setPhone(NEW_PHONE);   // prefill so full journey hits Confirm Identity
    setStep("landing");
  }
  function startActive() {
    setFlow("active");
    setPhone(ACTIVE_PHONE);
    setStep("phone");
  }
  function startExpired() {
    setFlow("expired");
    setPhone(EXPIRED_PHONE);
    setStep("phone");
  }

  // Router: OTP resolved → decide where to go by flow + account state
  function afterOtp() {
    if (flow === "active") { setStep("home"); return; }
    if (flow === "expired") { setStep("lapsed"); return; }
    // "new" flow: proceed to name (autofill if bureau has a record for this phone)
    setStep("name");
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start py-6" style={{ background: "#EEF0F5" }}>
      {/* Dev header */}
      <div className="w-full max-w-[420px] mb-3 flex items-center justify-between px-4 text-[11px]" style={{ color: T.sub }}>
        <Link to="/v2/gallery" className="underline">Gallery</Link>
        <div className="font-mono">
          {flow ? <span className="mr-2 px-2 py-0.5 rounded" style={{ background: T.blueSoft, color: T.navy }}>{flow}</span> : null}
          step: <span className="font-semibold" style={{ color: T.navy }}>{step}</span>
        </div>
        <button onClick={reset} className="underline">Reset</button>
      </div>

      {/* Phone frame */}
      <div
        className="w-full max-w-[420px] h-[820px] rounded-[36px] overflow-hidden border shadow-2xl"
        style={{ borderColor: "#D9DEE8", background: "#fff" }}
      >
        {step === "entry" && <EntryPicker onNew={startNew} onActive={startActive} onExpired={startExpired} />}

        {step === "landing" && <Landing onStart={() => setStep("phone")} />}

        {step === "phone" && (
          <PhoneEntry
            initial={phone}
            onBack={() => (flow === "new" ? setStep("landing") : reset())}
            onNext={(p) => { setPhone(p); setStep("otp"); }}
          />
        )}

        {step === "otp" && (
          <OtpEntry
            phone={phone}
            onBack={() => setStep("phone")}
            onChangeNumber={() => setStep("phone")}
            onNext={afterOtp}
          />
        )}

        {step === "name" && (
          <NameEntry
            initial={name || (user?.name?.toUpperCase() ?? "")}
            autofilled={Boolean(user?.hasScore)}
            onBack={() => setStep("otp")}
            onNext={(n) => { setName(n); setStep("fetching"); }}
          />
        )}

        {step === "fetching" && (
          <Fetching onDone={() => (user ? setStep("confirm") : setStep("pan"))} />
        )}

        {step === "confirm" && user && (
          <ConfirmIdentity
            user={user}
            name={name}
            savedName={user.name}
            onYes={(final) => { setConfirmedName(final); setStep("analyzing"); }}
            onEditName={() => setStep("name")}
            onChangeNumber={() => setStep("phone")}
            onNotMe={() => setStep("pan")}
          />
        )}

        {step === "pan" && (
          <PanFallback
            onBack={() => (user ? setStep("confirm") : setStep("name"))}
            onNext={(p) => { setPan(p); setStep("analyzing"); }}
          />
        )}

        {step === "analyzing" && (
          <Analyzing
            user={
              user ?? {
                key: "ntc",
                phone: phone || "0000000000",
                name: name || confirmedName || "You",
                pan: pan || "XXXXX0000X",
                hasScore: false,
              }
            }
            onDone={() => setStep("paywall")}
          />
        )}

        {step === "paywall" && (
          <Paywall
            user={
              user ?? {
                key: "ntc",
                phone: phone || "0000000000",
                name: name || confirmedName || "You",
                pan: pan || "XXXXX0000X",
                hasScore: false,
              }
            }
            onBack={() => setStep("analyzing")}
            onPay={() => setStep("razorpay")}
          />
        )}

        {step === "lapsed" && user && (
          <LapsedWall user={user} onBack={() => setStep("otp")} onPay={() => setStep("razorpay")} />
        )}

        {step === "razorpay" && (
          <RazorpayMock
            amount={flow === "expired" ? 99 : 9}
            onBack={() => setStep(flow === "expired" ? "lapsed" : "paywall")}
            onSuccess={() => setStep("success")}
          />
        )}

        {step === "success" && <PaySuccess onHome={() => setStep("home")} />}

        {step === "home" && (
          <HomeStub
            user={
              user ?? {
                key: "ntc",
                phone: phone || "0000000000",
                name: name || confirmedName || "You",
                pan: pan || "XXXXX0000X",
                hasScore: false,
              }
            }
            onRestart={reset}
          />
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Entry picker — three big buttons                                  */
/* ---------------------------------------------------------------- */
function EntryPicker({ onNew, onActive, onExpired }: { onNew: () => void; onActive: () => void; onExpired: () => void }) {
  const options = [
    {
      key: "new",
      title: "New user",
      desc: "Full journey — landing → OTP → name → bureau fetch → analyze → paywall → pay.",
      badge: "₹9 trial",
      onClick: onNew,
      color: T.blue,
    },
    {
      key: "active",
      title: "Active user",
      desc: "Paid subscriber — mobile + OTP → straight to home.",
      badge: "Skip onboarding",
      onClick: onActive,
      color: T.green,
    },
    {
      key: "expired",
      title: "Expired user",
      desc: "Subscription lapsed — mobile + OTP → ₹99 restart wall → home.",
      badge: "₹99 restart",
      onClick: onExpired,
      color: T.amber,
    },
  ];
  return (
    <div className="w-full h-full flex flex-col" style={{ background: T.card }}>
      <div className="px-6 pt-10 pb-6" style={{ background: T.navy, color: "#fff" }}>
        <div className="text-[11px] font-bold tracking-[0.24em] opacity-70">GROSCORE · V2</div>
        <h1 className="mt-2 text-[26px] font-bold leading-tight">Pick an entry point</h1>
        <p className="mt-1 text-[13px] opacity-80">Each journey mirrors what a real user would see.</p>
      </div>
      <div className="flex-1 p-5 space-y-3 overflow-y-auto">
        {options.map((o) => (
          <button
            key={o.key}
            onClick={o.onClick}
            className="w-full text-left rounded-2xl border-2 p-4 transition active:scale-[0.99]"
            style={{ borderColor: T.line, background: T.card }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[16px] font-bold" style={{ color: T.navy }}>{o.title}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${o.color}1A`, color: o.color }}>
                {o.badge}
              </span>
            </div>
            <p className="mt-1.5 text-[12px] leading-relaxed" style={{ color: T.sub }}>{o.desc}</p>
          </button>
        ))}
        <div className="pt-2 text-[10px] leading-relaxed" style={{ color: T.sub }}>
          Deep-link: <code>?entry=new</code> · <code>?entry=active</code> · <code>?entry=expired</code>. See every screen in the <Link to="/v2/gallery" className="underline" style={{ color: T.blue }}>gallery</Link>.
        </div>
      </div>
    </div>
  );
}
