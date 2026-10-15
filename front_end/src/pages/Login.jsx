
function Login() {
  return (
    <div className="container py-5">
      <div className="card shadow-sm mx-auto" style={{ maxWidth: '450px' }}>
        <div className="card-body p-4">
          <h1 className="h3 mb-4">Login</h1>

          <form onSubmit={(event) => event.preventDefault()}>
            <div className="mb-3">
              <label htmlFor="loginEmail" className="form-label">Email</label>
              <input
                id="loginEmail"
                type="email"
                className="form-control"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="loginPassword" className="form-label">
                Password
              </label>
              <input
                id="loginPassword"
                type="password"
                className="form-control"
                required
              />
            </div>

            <button className="btn btn-primary w-100" type="submit">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
