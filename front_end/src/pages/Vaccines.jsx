import { useEffect, useState } from "react";
import { apiRequest } from "../api";

function Vaccines() {
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/vaccines")
      .then(setVaccines)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="container page-section">
      <div className="page-heading">
        <span className="eyebrow">VACCINE CATALOG</span>
        <h1 className="h2 mt-2">Explore vaccine information</h1>
        <p className="text-secondary">
          Use this catalog to organize reminders, not as a medical schedule.
        </p>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {loading ? (
        <p>Loading vaccines…</p>
      ) : vaccines.length === 0 ? (
        <div className="alert alert-info">No vaccines are in the catalog yet.</div>
      ) : (
        <div className="row g-4 mt-2">
          {vaccines.map((vaccine) => (
            <div className="col-sm-6 col-lg-4" key={vaccine._id}>
              <article className="card vaccine-card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="vaccine-symbol" aria-hidden="true">+</div>
                  <h2 className="h5 mt-3">{vaccine.vaccineName}</h2>
                  <p className="text-secondary mb-0">
                    {vaccine.description || "Ask your healthcare professional about this vaccine."}
                  </p>
                  {vaccine.recommendedAge && (
                    <p className="small mt-3 mb-0">
                      <strong>Recommended age:</strong> {vaccine.recommendedAge}
                    </p>
                  )}
                  {vaccine.doseNumber && (
                    <p className="small mt-1 mb-0">
                      <strong>Dose:</strong> {vaccine.doseNumber}
                    </p>
                  )}
                </div>
              </article>
            </div>
          ))}
        </div>
      )}

      <div className="medical-note mt-5">
        <strong>Important:</strong> vaccine availability and recommended timing vary by location
        and individual health history. Always confirm a child’s schedule with a qualified
        healthcare professional and local public-health guidance.
      </div>
    </section>
  );
}

export default Vaccines;
