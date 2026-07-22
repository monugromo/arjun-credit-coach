import { createFileRoute, Link } from "@tanstack/react-router";
import { DEMOS } from "@/lib/groscore-data";
import {
  Landing, PhoneEntry, OtpEntry, NameEntry, Fetching,
  ConfirmIdentity, PanFallback, Analyzing, Paywall,
  LapsedWall, RazorpayMock, PaySuccess, HomeStub, GenericError,
} from "@/lib/v2-flow";
import type { ReactNode } from "react";

export const Route = createFileRoute("/v2/gallery")({
  head: () => ({
    meta: [
      { title: "GroScore v2 — Screen gallery" },
      { name: "description", content: "All onboarding screens and edge states, side by side." },
      { property: "og:title", content: "GroScore v2 gallery" },
      { property: "og:description", content: "Every screen and branch of the onboarding flow." },
    ],
  }),
  component: Gallery,
});

const NTC = DEMOS["9876500001"];
const DISTRESSED = DEMOS["9876500002"];
const LAPSED = DEMOS["9876500003"];
const noop = () => {};

function Tile({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <div className="text-sm font-semibold text-gray-800">{title}</div>
        {note && <div className="text-[11px] text-gray-500">{note}</div>}
      </div>
      <div className="w-[360px] h-[720px] rounded-3xl overflow-hidden border shadow-md bg-white">
        {children}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold mb-4 text-gray-900">{title}</h2>
      <div className="flex flex-wrap gap-6">{children}</div>
    </section>
  );
}

function Gallery() {
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Onboarding — screen gallery</h1>
            <p className="text-sm text-gray-500">All screens + branches. Non-interactive previews.</p>
          </div>
          <Link to="/v2" className="text-sm underline">Open playable flow →</Link>
        </div>

        <Section title="1 · Entry">
          <Tile title="Landing"><Landing onStart={noop} /></Tile>
          <Tile title="Phone"><PhoneEntry onBack={noop} onNext={noop} initial="9876500002" /></Tile>
          <Tile title="OTP" note="Enter 0000 to force error"><OtpEntry phone="9876500002" onBack={noop} onNext={noop} onChangeNumber={noop} /></Tile>
          <Tile title="Name"><NameEntry onBack={noop} onNext={noop} initial="RAHUL KUMAR" /></Tile>
          <Tile title="Fetching"><Fetching onDone={noop} /></Tile>
        </Section>

        <Section title="2 · Identity resolution">
          <Tile title="Confirm — NTC" note="No score user"><ConfirmIdentity user={NTC} name={NTC.name} onYes={noop} onEditName={noop} onChangeNumber={noop} onNotMe={noop} /></Tile>
          <Tile title="Confirm — Distressed"><ConfirmIdentity user={DISTRESSED} name={DISTRESSED.name} onYes={noop} onEditName={noop} onChangeNumber={noop} onNotMe={noop} /></Tile>
          <Tile title="Confirm — Lapsed"><ConfirmIdentity user={LAPSED} name={LAPSED.name} onYes={noop} onEditName={noop} onChangeNumber={noop} onNotMe={noop} /></Tile>
          <Tile title="PAN fallback"><PanFallback onBack={noop} onNext={noop} /></Tile>
        </Section>

        <Section title="3 · Analyzing (by profile)">
          <Tile title="Analyzing — Distressed"><Analyzing user={DISTRESSED} onDone={noop} /></Tile>
          <Tile title="Analyzing — NTC"><Analyzing user={NTC} onDone={noop} /></Tile>
        </Section>

        <Section title="4 · Paywall variants">
          <Tile title="Paywall — Distressed" note="3+ tasks · task-led"><Paywall user={DISTRESSED} onBack={noop} onPay={noop} /></Tile>
          <Tile title="Paywall — NTC" note="Build / access"><Paywall user={NTC} onBack={noop} onPay={noop} /></Tile>
          <Tile title="Lapsed ₹99 wall"><LapsedWall user={LAPSED} onBack={noop} onPay={noop} /></Tile>
        </Section>

        <Section title="5 · Payment">
          <Tile title="Razorpay — ₹9"><RazorpayMock amount={9} onBack={noop} onSuccess={noop} /></Tile>
          <Tile title="Razorpay — ₹99"><RazorpayMock amount={99} onBack={noop} onSuccess={noop} /></Tile>
          <Tile title="Success"><PaySuccess onHome={noop} /></Tile>
          <Tile title="Home stub — Distressed"><HomeStub user={DISTRESSED} onRestart={noop} /></Tile>
          <Tile title="Home stub — NTC"><HomeStub user={NTC} onRestart={noop} /></Tile>
        </Section>

        <Section title="6 · Errors">
          <Tile title="Generic error"><GenericError msg="Couldn't reach the bureau." onRetry={noop} /></Tile>
        </Section>
      </div>
    </div>
  );
}
