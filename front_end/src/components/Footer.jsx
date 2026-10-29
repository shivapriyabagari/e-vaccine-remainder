
const currentYear = new Date().getFullYear();

function Footer() {
  return (
    <footer className="bg-dark text-white text-center py-4 mt-auto">
      <div className="container">
        <p className="mb-1">
          E-Vaccine Reminder — Stay Healthy, Stay Protected.
        </p>
        <small>
          © {currentYear} E-Vaccine Reminder. All rights reserved.
        </small>
      </div>
    </footer>
  );
}

export default Footer;
