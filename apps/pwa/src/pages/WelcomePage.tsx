import { useNavigate } from "react-router-dom";

export function WelcomePage() {
  const navigate = useNavigate();

  function continueBrowse() {
    localStorage.setItem("dirshay-welcome-seen", "1");
    window.dispatchEvent(new Event("dirshay-welcome"));
    navigate("/", { replace: true });
  }

  return (
    <div className="welcome">
      <div className="welcome-logo">D</div>
      <h1>Welcome to Dirshay</h1>
      <p className="lead">Ethiopia’s trusted car marketplace.</p>
      <ul>
        <li>
          <span className="check">✓</span> Buy & Sell Cars
        </li>
        <li>
          <span className="check">✓</span> Wide Range (2000 – 2026)
        </li>
        <li>
          <span className="check">✓</span> Trusted Dealers
        </li>
        <li>
          <span className="check">✓</span> Easy & Secure
        </li>
      </ul>
      <button type="button" className="btn" onClick={() => { localStorage.setItem("dirshay-welcome-seen", "1"); window.dispatchEvent(new Event("dirshay-welcome")); navigate("/profile"); }}>
        Sign In / Register
      </button>
      <button type="button" className="btn-outline" onClick={continueBrowse}>
        Browse Cars
      </button>
    </div>
  );
}
