import { Link } from "react-router-dom";
import { useAuth } from "../useAuth";

function Home() {
  const { user } = useAuth();

  return (
    <>
      <section className="hero-section">
        <div className="container hero-content">
          <div className="hero-copy">
            <span className="eyebrow">CARE, MADE EASIER</span>
            <h1>One less thing to remember.</h1>
            <p>
              Keep your family’s vaccination dates together and get timely
              reminders by email or WhatsApp.
            </p>
            <div className="d-flex flex-wrap gap-3 mt-4">
              <Link className="btn btn-light btn-lg text-primary fw-semibold" to={user ? "/reminders" : "/login"}>
                {user ? "Open my reminders" : "Get started"}
              </Link>
              <Link className="btn btn-outline-light btn-lg" to="/vaccines">
                Explore vaccines
              </Link>
            </div>
            <p className="hero-footnote mt-3">
              A helpful organizer, not a substitute for medical advice.
            </p>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="hero-orbit orbit-one" />
            <div className="hero-orbit orbit-two" />
            <div className="hero-calendar">
              <div className="calendar-top" />
              <div className="calendar-check">✓</div>
              <div className="calendar-lines"><i /><i /><i /></div>
            </div>
            <span className="floating-plus plus-one">+</span>
            <span className="floating-plus plus-two">+</span>
            <span className="floating-dot dot-one" />
          </div>
        </div>
      </section>

      <section className="container feature-section">
        <div className="section-intro text-center">
          <span className="eyebrow">HOW IT WORKS</span>
          <h2 className="h2 mt-2">A calmer way to stay on schedule</h2>
          <p className="text-secondary">Simple tools to help you stay organized from one visit to the next.</p>
        </div>
        <div className="row g-4 mt-3">
          <div className="col-md-4">
            <article className="feature-card">
              <span className="feature-number">01</span>
              <h3 className="h5 mt-3">Add your family</h3>
              <p className="text-secondary mb-0">Keep child profiles and important dates in one private place.</p>
            </article>
          </div>
          <div className="col-md-4">
            <article className="feature-card">
              <span className="feature-number">02</span>
              <h3 className="h5 mt-3">Set a reminder</h3>
              <p className="text-secondary mb-0">Choose a vaccine and date after checking the schedule with your clinician.</p>
            </article>
          </div>
          <div className="col-md-4">
            <article className="feature-card">
              <span className="feature-number">03</span>
              <h3 className="h5 mt-3">Get notified</h3>
              <p className="text-secondary mb-0">Receive an email or WhatsApp nudge before the date you set.</p>
            </article>
          </div>
        </div>
        <div className="bottom-cta mt-5">
          <div>
            <h2 className="h4 mb-1">Ready to organize your reminders?</h2>
            <p className="mb-0">Set up an account in just a moment.</p>
          </div>
          <Link className="btn btn-primary" to={user ? "/reminders" : "/login"}>
            {user ? "View reminders" : "Create free account"}
          </Link>
        </div>
      </section>
    </>
  );
}

export default Home;
