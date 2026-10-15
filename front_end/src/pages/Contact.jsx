
function Contact() {
  return (
    <div className="container py-5">
      <h1>Contact Us</h1>
      <p>Have a question about the application? Send us a message.</p>

      <form onSubmit={(event) => event.preventDefault()}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Name</label>
          <input id="name" className="form-control" required />
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input id="email" type="email" className="form-control" required />
        </div>

        <div className="mb-3">
          <label htmlFor="message" className="form-label">Message</label>
          <textarea id="message" className="form-control" rows="4" required />
        </div>

        <button className="btn btn-primary" type="submit">
          Send Message
        </button>
      </form>
    </div>
  );
}

export default Contact;
