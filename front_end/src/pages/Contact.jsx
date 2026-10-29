import { Link } from "react-router-dom";

function Contact() {
  return (
    <section className="container page-section">
      <span className="eyebrow">HELP & SUPPORT</span>
      <h1 className="h2 mt-2">Need help getting started?</h1>
      <p className="text-secondary">
        Setup instructions for the database, email delivery, and WhatsApp
        notifications are in the project README.
      </p>
      <div className="card border-0 shadow-sm mt-4" style={{ maxWidth: "640px" }}>
        <div className="card-body p-4">
          <h2 className="h5">Notification delivery</h2>
          <p className="text-secondary mb-0">
            Email and WhatsApp delivery depend on credentials configured by the
            application operator. If a reminder does not send, check the
            delivery settings and provider configuration.
          </p>
        </div>
      </div>
      <Link className="btn btn-primary mt-4" to="/reminders">
        View my reminders
      </Link>
    </section>
  );
}

export default Contact;
