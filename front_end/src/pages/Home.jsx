
function Home() {
  return (
    <div className="container py-5">
      <div className="p-5 mb-4 bg-primary text-white rounded-4">
        <h1 className="display-5 fw-bold">Welcome to E-Vaccine Reminder</h1>
        <p className="fs-5">
          Keep track of vaccination schedules and stay informed about
          upcoming vaccine dates.
        </p>
        <a href="/vaccines" className="btn btn-light btn-lg">
          Explore Vaccines
        </a>
      </div>

      <div className="row g-4">
        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Vaccine Information</h5>
              <p className="card-text">
                Explore useful information about vaccines and vaccination
                schedules.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Smart Reminders</h5>
              <p className="card-text">
                Keep upcoming vaccination dates organized in one place.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Stay Protected</h5>
              <p className="card-text">
                Use reminders to help you discuss vaccination schedules
                with a qualified healthcare professional.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
