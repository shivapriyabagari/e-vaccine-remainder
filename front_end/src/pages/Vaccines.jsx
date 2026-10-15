
function Vaccines() {
  const vaccines = [
    {
      name: 'BCG',
      description: 'A vaccine used to help protect against tuberculosis.',
    },
    {
      name: 'Hepatitis B',
      description: 'Helps protect against hepatitis B virus infection.',
    },
    {
      name: 'Polio',
      description: 'Helps protect against poliovirus infection.',
    },
    {
      name: 'MMR',
      description: 'Protects against measles, mumps, and rubella.',
    },
  ];

  return (
    <div className="container py-5">
      <h1 className="mb-4">Vaccine Information</h1>

      <div className="row g-4">
        {vaccines.map((vaccine) => (
          <div className="col-md-6 col-lg-3" key={vaccine.name}>
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{vaccine.name}</h5>
                <p className="card-text">{vaccine.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-secondary mt-4">
        Vaccine recommendations depend on age, medical history, and local
        guidelines. Consult a healthcare professional for your schedule.
      </p>
    </div>
  );
}

export default Vaccines;
