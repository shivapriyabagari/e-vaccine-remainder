import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../api";
import { useAuth } from "../useAuth";

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function localDateValue() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

function Reminders() {
  const { user, updateProfile } = useAuth();
  const [children, setChildren] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [childForm, setChildForm] = useState({ name: "", dateOfBirth: "", gender: "" });
  const [reminderForm, setReminderForm] = useState({
    childId: "",
    vaccineId: "",
    dueDate: "",
  });
  const [profileForm, setProfileForm] = useState(() => ({
    name: user.name,
    phone: user.phone || "",
    email: user.notifications?.email ?? true,
    whatsapp: user.notifications?.whatsapp ?? false,
  }));

  const loadData = useCallback(async () => {
    try {
      const [childData, vaccineData, reminderData] = await Promise.all([
        apiRequest("/children"),
        apiRequest("/vaccines"),
        apiRequest("/reminders"),
      ]);
      setChildren(childData);
      setVaccines(vaccineData);
      setReminders(reminderData);
      setReminderForm((current) => ({
        ...current,
        childId: childData.some((child) => child._id === current.childId)
          ? current.childId
          : childData[0]?._id || "",
        vaccineId: vaccineData.some((vaccine) => vaccine._id === current.vaccineId)
          ? current.vaccineId
          : vaccineData[0]?._id || "",
      }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      apiRequest("/children"),
      apiRequest("/vaccines"),
      apiRequest("/reminders"),
    ]).then(([childData, vaccineData, reminderData]) => {
      if (!active) return;
      setChildren(childData);
      setVaccines(vaccineData);
      setReminders(reminderData);
      setReminderForm((current) => ({
        ...current,
        childId: childData.some((child) => child._id === current.childId)
          ? current.childId
          : childData[0]?._id || "",
        vaccineId: vaccineData.some((vaccine) => vaccine._id === current.vaccineId)
          ? current.vaccineId
          : vaccineData[0]?._id || "",
      }));
    }).catch((requestError) => {
      if (active) setError(requestError.message);
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  async function createChild(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await apiRequest("/children", {
        method: "POST",
        body: childForm,
      });
      setChildForm({ name: "", dateOfBirth: "", gender: "" });
      setNotice("Child profile added.");
      await loadData();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function createReminder(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await apiRequest("/reminders", {
        method: "POST",
        body: reminderForm,
      });
      setReminderForm((current) => ({ ...current, dueDate: "" }));
      setNotice("Vaccination reminder added.");
      await loadData();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteChild(child) {
    if (!window.confirm(`Remove ${child.name} and all of their reminders?`)) {
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");
    try {
      await apiRequest(`/children/${child._id}`, { method: "DELETE" });
      setNotice(`${child.name} and their reminders were removed.`);
      await loadData();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function updateReminder(reminder, body) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await apiRequest(`/reminders/${reminder._id}`, {
        method: "PATCH",
        body,
      });
      setNotice("Reminder updated.");
      await loadData();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteReminder(reminder) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await apiRequest(`/reminders/${reminder._id}`, { method: "DELETE" });
      setNotice("Reminder deleted.");
      await loadData();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function sendReminder(reminder) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await apiRequest(`/reminders/${reminder._id}/send`, {
        method: "POST",
        body: {},
      });
      if (!result.results.length) {
        setNotice("No reminder was sent. Enable email or WhatsApp in delivery settings.");
      } else {
        setNotice(
          result.results
            .map(({ channel, sent }) => `${channel}: ${sent ? "sent" : "failed"}`)
            .join(" · "),
        );
      }
      await loadData();
    } catch (requestError) {
      const results = requestError.details?.results;
      if (results?.length) {
        setError(results
          .filter((result) => !result.sent)
          .map((result) => `${result.channel}: ${result.error}`)
          .join(" · "));
      } else {
        setError(requestError.message);
      }
    } finally {
      setBusy(false);
    }
  }

  async function saveProfile(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        notifications: {
          email: profileForm.email,
          whatsapp: profileForm.whatsapp,
        },
      });
      setNotice("Delivery settings saved.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <main className="container page-section">Loading reminders…</main>;
  }

  const pendingCount = reminders.filter((reminder) => reminder.status === "Pending").length;

  return (
    <section className="container page-section">
      <div className="page-heading d-flex flex-wrap justify-content-between align-items-end gap-3">
        <div>
          <span className="eyebrow">YOUR FAMILY’S CARE</span>
          <h1 className="h2 mt-2 mb-1">Vaccination reminders</h1>
          <p className="text-secondary mb-0">
            {pendingCount} upcoming {pendingCount === 1 ? "reminder" : "reminders"} · manage your
            children and notification preferences below.
          </p>
        </div>
      </div>

      {error && <div className="alert alert-danger mt-4" role="alert">{error}</div>}
      {notice && <div className="alert alert-success mt-4" role="status">{notice}</div>}

      <div className="row g-4 mt-1">
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <span className="eyebrow">FAMILY</span>
              <h2 className="h4 mt-2">Add a child</h2>
              <p className="small text-secondary">
                Child details are private to your account.
              </p>
              <form onSubmit={createChild}>
                <div className="mb-3">
                  <label htmlFor="childName" className="form-label">Child’s name</label>
                  <input
                    id="childName"
                    className="form-control"
                    value={childForm.name}
                    onChange={(event) => setChildForm({ ...childForm, name: event.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="childBirth" className="form-label">Date of birth</label>
                  <input
                    id="childBirth"
                    type="date"
                    className="form-control"
                    max={localDateValue()}
                    value={childForm.dateOfBirth}
                    onChange={(event) =>
                      setChildForm({ ...childForm, dateOfBirth: event.target.value })
                    }
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="childGender" className="form-label">Gender</label>
                  <select
                    id="childGender"
                    className="form-select"
                    value={childForm.gender}
                    onChange={(event) => setChildForm({ ...childForm, gender: event.target.value })}
                    required
                  >
                    <option value="">Select…</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <button className="btn btn-primary" type="submit" disabled={busy}>
                  Add child
                </button>
              </form>

              {children.length > 0 && (
                <div className="child-list mt-4 pt-3 border-top">
                  <h3 className="h6">Your children</h3>
                  {children.map((child) => (
                    <div className="d-flex justify-content-between align-items-center gap-2 py-2" key={child._id}>
                      <div>
                        <span>{child.name}</span>
                        <span className="small text-secondary ms-2">
                          {formatDate(child.dateOfBirth)}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => deleteChild(child)}
                        disabled={busy}
                        aria-label={`Remove ${child.name} and their reminders`}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <span className="eyebrow">PLAN AHEAD</span>
              <h2 className="h4 mt-2">Add a vaccination reminder</h2>
              <p className="small text-secondary">
                Confirm vaccine timing with your child’s healthcare professional.
              </p>
              <form className="row g-3 align-items-end" onSubmit={createReminder}>
                <div className="col-md-4">
                  <label htmlFor="reminderChild" className="form-label">Child</label>
                  <select
                    id="reminderChild"
                    className="form-select"
                    value={reminderForm.childId}
                    onChange={(event) =>
                      setReminderForm({ ...reminderForm, childId: event.target.value })
                    }
                    required
                  >
                    <option value="">Select…</option>
                    {children.map((child) => (
                      <option key={child._id} value={child._id}>{child.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label htmlFor="reminderVaccine" className="form-label">Vaccine</label>
                  <select
                    id="reminderVaccine"
                    className="form-select"
                    value={reminderForm.vaccineId}
                    onChange={(event) =>
                      setReminderForm({ ...reminderForm, vaccineId: event.target.value })
                    }
                    required
                  >
                    <option value="">Select…</option>
                    {vaccines.map((vaccine) => (
                      <option key={vaccine._id} value={vaccine._id}>
                        {vaccine.vaccineName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label htmlFor="reminderDate" className="form-label">Due date</label>
                  <input
                    id="reminderDate"
                    type="date"
                    className="form-control"
                    value={reminderForm.dueDate}
                    onChange={(event) =>
                      setReminderForm({ ...reminderForm, dueDate: event.target.value })
                    }
                    required
                  />
                </div>
                <div className="col-12">
                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={busy || !children.length || !vaccines.length}
                  >
                    Add reminder
                  </button>
                  {!children.length && (
                    <span className="small text-secondary ms-3">Add a child first.</span>
                  )}
                  {!vaccines.length && (
                    <span className="small text-secondary ms-3">Vaccine catalog is empty.</span>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="card border-0 shadow-sm mt-4">
            <div className="card-body p-4">
              <span className="eyebrow">NOTIFICATIONS</span>
              <h2 className="h4 mt-2">Delivery settings</h2>
              <form className="row g-3 align-items-end" onSubmit={saveProfile}>
                <div className="col-md-6">
                  <label htmlFor="profileName" className="form-label">Name</label>
                  <input
                    id="profileName"
                    className="form-control"
                    value={profileForm.name}
                    onChange={(event) =>
                      setProfileForm({ ...profileForm, name: event.target.value })
                    }
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="profilePhone" className="form-label">
                    WhatsApp number <span className="text-secondary">(with country code)</span>
                  </label>
                  <input
                    id="profilePhone"
                    type="tel"
                    className="form-control"
                    placeholder="+14155552671"
                    value={profileForm.phone}
                    onChange={(event) =>
                      setProfileForm({ ...profileForm, phone: event.target.value })
                    }
                  />
                </div>
                <div className="col-md-6">
                  <div className="form-check">
                    <input
                      id="emailEnabled"
                      type="checkbox"
                      className="form-check-input"
                      checked={profileForm.email}
                      onChange={(event) =>
                        setProfileForm({ ...profileForm, email: event.target.checked })
                      }
                    />
                    <label className="form-check-label" htmlFor="emailEnabled">
                      Email reminders ({user.email})
                    </label>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-check">
                    <input
                      id="whatsappEnabled"
                      type="checkbox"
                      className="form-check-input"
                      checked={profileForm.whatsapp}
                      onChange={(event) =>
                        setProfileForm({ ...profileForm, whatsapp: event.target.checked })
                      }
                    />
                    <label className="form-check-label" htmlFor="whatsappEnabled">
                      WhatsApp reminders
                    </label>
                  </div>
                </div>
                <div className="col-12">
                  <button className="btn btn-outline-primary" type="submit" disabled={busy}>
                    Save settings
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <div className="d-flex justify-content-between align-items-end mb-3">
          <div>
            <span className="eyebrow">YOUR SCHEDULE</span>
            <h2 className="h3 mt-2 mb-0">Reminders</h2>
          </div>
        </div>
        {reminders.length === 0 ? (
          <div className="empty-state card border-0">
            <div className="card-body text-center py-5">
              <span className="empty-icon" aria-hidden="true">✓</span>
              <h3 className="h5 mt-3">Your schedule is ready to build</h3>
              <p className="text-secondary mb-0">Add a child and create a reminder above.</p>
            </div>
          </div>
        ) : (
          <div className="row g-3">
            {reminders.map((reminder) => (
              <div className="col-md-6 col-xl-4" key={reminder._id}>
                <article className="card reminder-card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between gap-2">
                      <span className={`status-badge ${reminder.status === "Completed" ? "done" : ""}`}>
                        {reminder.status}
                      </span>
                      <span className="small text-secondary">{formatDate(reminder.dueDate)}</span>
                    </div>
                    <h3 className="h5 mt-3 mb-1">{reminder.vaccineId?.vaccineName || "Vaccine"}</h3>
                    <p className="text-secondary mb-3">{reminder.childId?.name || "Child"}</p>
                    <div className="small text-secondary mb-3">
                      Email: {reminder.emailSentAt ? "sent" : "not sent"}
                      {" · "}
                      WhatsApp: {reminder.whatsappSentAt ? "sent" : "not sent"}
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      {reminder.status === "Pending" && (
                        <>
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={() => sendReminder(reminder)}
                            disabled={busy}
                          >
                            Send now
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => updateReminder(reminder, { status: "Completed" })}
                            disabled={busy}
                          >
                            Mark complete
                          </button>
                        </>
                      )}
                      {reminder.status === "Completed" && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => updateReminder(reminder, { status: "Pending" })}
                          disabled={busy}
                        >
                          Reopen
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => deleteReminder(reminder)}
                        disabled={busy}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Reminders;
