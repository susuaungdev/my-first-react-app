import {
  useNavigate,
} from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

/* =========================================================
   HOME PAGE
========================================================= */

function Home() {
  const navigate =
    useNavigate();

  /* =========================================================
     NAVIGATION HELPERS
  ========================================================= */

  const handleCreateResume =
    () => {
      const token =
        localStorage.getItem(
          "token"
        );

      if (token) {
        navigate(
          "/resumes/new"
        );
      } else {
        navigate(
          "/register"
        );
      }
    };

  const handleTrackApplications =
    () => {
      const token =
        localStorage.getItem(
          "token"
        );

      if (token) {
        navigate(
          "/applications"
        );
      } else {
        navigate(
          "/register"
        );
      }
    };

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="min-h-screen bg-white text-slate-900">

      <Navbar />

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden border-b border-slate-100">

        {/* DECORATIVE BACKGROUND */}

        <div className="pointer-events-none absolute inset-0">

          <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-blue-50/70 blur-3xl" />

          <div className="absolute -left-24 top-48 h-72 w-72 rounded-full bg-indigo-50 blur-3xl" />

          <div className="absolute -right-24 top-24 h-72 w-72 rounded-full bg-sky-50 blur-3xl" />

        </div>

        <div className="relative mx-auto flex min-h-[calc(100vh-64px)] max-w-7xl items-center justify-center px-4 py-20 sm:px-6 sm:py-24 lg:px-8">

          <div className="mx-auto max-w-4xl text-center">

            {/* BADGE */}

            <div className="inline-flex items-center rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-xs font-semibold text-blue-700 shadow-sm backdrop-blur sm:text-sm">
              Resume Builder • Job Tracker • Career Organizer
            </div>

            {/* HEADING */}

            <h1 className="mt-7 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl">
              Everything you need to manage your{" "}
              <span className="text-blue-600">
                job search
              </span>
            </h1>

            {/* DESCRIPTION */}

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Build professional resumes, save opportunities,
              track applications, manage interviews, and stay
              organized throughout your entire career journey.
            </p>

            {/* ACTIONS */}

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">

              <button
                type="button"
                onClick={
                  handleCreateResume
                }
                className="w-full rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 sm:w-auto"
              >
                Create Resume
              </button>

              <button
                type="button"
                onClick={
                  handleTrackApplications
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100 sm:w-auto"
              >
                Track Applications
              </button>

            </div>

            {/* BENEFITS */}

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-slate-500">

              <Benefit text="Create multiple resumes" />

              <Benefit text="Track every application" />

              <Benefit text="Manage interview rounds" />

              <Benefit text="Monitor deadlines" />

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          FEATURES INTRO
      ===================================================== */}

      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">

        <div className="mx-auto max-w-7xl">

          <div className="mx-auto max-w-3xl text-center">

            <p className="text-sm font-semibold text-blue-600">
              Built for your job search
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Keep your career organized in one place
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
              Stop switching between documents, spreadsheets,
              bookmarks, and notes. CareerFlow brings the important
              parts of your job search together.
            </p>

          </div>

          {/* FEATURES */}

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

            <FeatureCard
              number="01"
              title="Resume Builder"
              description="Create professional resume versions, customize templates, and export your resume as PDF."
            />

            <FeatureCard
              number="02"
              title="Application Tracker"
              description="Track every opportunity from saved job to application, interview, offer, rejection, or withdrawal."
            />

            <FeatureCard
              number="03"
              title="Interview Manager"
              description="Manage interview rounds, meeting links, preparation notes, results, and follow-up dates."
            />

            <FeatureCard
              number="04"
              title="Saved Jobs"
              description="Save interesting opportunities and move them into your application tracker when you apply."
            />

            <FeatureCard
              number="05"
              title="Smart Reminders"
              description="Stay aware of upcoming interviews, job deadlines, and interview follow-up reminders."
            />

            <FeatureCard
              number="06"
              title="Career Analytics"
              description="Understand your application activity, interview results, offers, and conversion progress."
            />

          </div>

        </div>

      </section>

      {/* =====================================================
          SIMPLE WORKFLOW
      ===================================================== */}

      <section className="bg-slate-50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">

        <div className="mx-auto max-w-7xl">

          <div className="mx-auto max-w-3xl text-center">

            <p className="text-sm font-semibold text-blue-600">
              Simple workflow
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              From opportunity to offer
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
              CareerFlow follows the same journey you already take
              during a real job search.
            </p>

          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

            <WorkflowCard
              number="1"
              title="Save a job"
              description="Keep an opportunity you want to review or apply for later."
            />

            <WorkflowCard
              number="2"
              title="Mark as applied"
              description="Move the job into Applications without entering the same information again."
            />

            <WorkflowCard
              number="3"
              title="Track interviews"
              description="Record each interview round and keep preparation details together."
            />

            <WorkflowCard
              number="4"
              title="Follow your progress"
              description="See application stages, reminders, analytics, and outcomes in one place."
            />

          </div>

        </div>

      </section>

      {/* =====================================================
          WHY CAREERFLOW
      ===================================================== */}

      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">

        <div className="mx-auto max-w-6xl">

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            <div className="grid grid-cols-1 lg:grid-cols-2">

              {/* LEFT */}

              <div className="p-7 sm:p-10 lg:p-12">

                <p className="text-sm font-semibold text-blue-600">
                  Less busywork
                </p>

                <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                  Focus on applying, not organizing spreadsheets
                </h2>

                <p className="mt-4 text-base leading-7 text-slate-600">
                  CareerFlow keeps related information connected,
                  so you spend less time copying job details between
                  different tools.
                </p>

                <div className="mt-7 space-y-4">

                  <CheckItem text="Saved jobs can become applications without retyping everything." />

                  <CheckItem text="Applications can be connected to the resume you actually submitted." />

                  <CheckItem text="Interview rounds stay connected to the correct job application." />

                  <CheckItem text="Deadlines and upcoming interviews can generate reminders automatically." />

                </div>

              </div>

              {/* RIGHT */}

              <div className="border-t border-slate-200 bg-slate-50 p-7 sm:p-10 lg:border-l lg:border-t-0 lg:p-12">

                <p className="text-sm font-semibold text-slate-500">
                  Your workflow
                </p>

                <div className="mt-6 space-y-3">

                  <FlowItem
                    number="01"
                    title="Saved Job"
                    subtitle="Found an opportunity"
                  />

                  <FlowArrow />

                  <FlowItem
                    number="02"
                    title="Application"
                    subtitle="Applied and tracking progress"
                  />

                  <FlowArrow />

                  <FlowItem
                    number="03"
                    title="Interview"
                    subtitle="Preparing for each round"
                  />

                  <FlowArrow />

                  <FlowItem
                    number="04"
                    title="Offer"
                    subtitle="Track your outcome"
                  />

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          CTA
      ===================================================== */}

      <section className="px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">

        <div className="mx-auto max-w-7xl">

          <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-12 text-center sm:px-10 sm:py-16">

            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

            <div className="relative">

              <p className="text-sm font-semibold text-blue-300">
                Start organizing your job search
              </p>

              <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Keep every opportunity, application, resume,
                and interview connected
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                CareerFlow gives you one simple workspace for managing
                your job search from the first opportunity to the final
                outcome.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

                <button
                  type="button"
                  onClick={
                    handleCreateResume
                  }
                  className="w-full rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-400/30 sm:w-auto"
                >
                  Get Started
                </button>

                <button
                  type="button"
                  onClick={
                    handleTrackApplications
                  }
                  className="w-full rounded-xl border border-slate-600 bg-slate-800 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-600/30 sm:w-auto"
                >
                  Track Applications
                </button>

              </div>

            </div>

          </div>

        </div>

      </section>

      <Footer />

    </div>
  );
}

/* =========================================================
   BENEFIT
========================================================= */

type BenefitProps = {
  text: string;
};

function Benefit({
  text,
}: BenefitProps) {
  return (
    <div className="flex items-center gap-2">

      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-600">
        ✓
      </span>

      <span>
        {text}
      </span>

    </div>
  );
}

/* =========================================================
   FEATURE CARD
========================================================= */

type FeatureCardProps = {
  number: string;
  title: string;
  description: string;
};

function FeatureCard({
  number,
  title,
  description,
}: FeatureCardProps) {
  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-6 transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-200/60">

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
        {number}
      </div>

      <h3 className="mt-5 text-lg font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        {description}
      </p>

    </article>
  );
}

/* =========================================================
   WORKFLOW CARD
========================================================= */

type WorkflowCardProps = {
  number: string;
  title: string;
  description: string;
};

function WorkflowCard({
  number,
  title,
  description,
}: WorkflowCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
        {number}
      </div>

      <h3 className="mt-5 text-lg font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        {description}
      </p>

    </div>
  );
}

/* =========================================================
   CHECK ITEM
========================================================= */

type CheckItemProps = {
  text: string;
};

function CheckItem({
  text,
}: CheckItemProps) {
  return (
    <div className="flex items-start gap-3">

      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-600">
        ✓
      </div>

      <p className="text-sm leading-6 text-slate-600">
        {text}
      </p>

    </div>
  );
}

/* =========================================================
   FLOW ITEM
========================================================= */

type FlowItemProps = {
  number: string;
  title: string;
  subtitle: string;
};

function FlowItem({
  number,
  title,
  subtitle,
}: FlowItemProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-600">
        {number}
      </div>

      <div>

        <p className="text-sm font-bold text-slate-900">
          {title}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {subtitle}
        </p>

      </div>

    </div>
  );
}

/* =========================================================
   FLOW ARROW
========================================================= */

function FlowArrow() {
  return (
    <div className="flex justify-center text-slate-300">
      ↓
    </div>
  );
}

export default Home;