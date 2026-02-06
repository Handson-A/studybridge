import { useState } from "react";
import "./onboardingPage.css";

function OnboardingPage({ onGetStarted }) {
  const [userName, setUserName] = useState("");
  const [showError, setShowError] = useState(false);

  const handleGetStarted = () => {
    const trimmedName = userName.trim();
    if (!trimmedName) {
      setShowError(true);
      return;
    }

    onGetStarted(trimmedName);
  };

  const handleNameChange = (event) => {
    const value = event.target.value;
    setUserName(value);
    if (showError && value.trim()) {
      setShowError(false);
    }
  };

  return (
    <div className="onboardingPage">
      <div className="onboardingContainer">
        {/* Hero Section */}
        <div className="heroSection">
          <div className="heroIcon">📚</div>
          <h1 className="heroTitle">Welcome to StudyBridge</h1>
          <p className="heroSubtitle">
            Your AI-powered study companion for transforming lecture notes into structured study materials
          </p>
        </div>

        {/* Features Section */}
        <div className="featuresSection">
          <h2>What You Can Do</h2>
          
          <div className="featuresList">
            <div className="featureItem">
              <div className="featureIcon">🎯</div>
              <div className="featureContent">
                <h3>Organize Courses</h3>
                <p>Create and manage all your courses in one place</p>
              </div>
            </div>

            <div className="featureItem">
              <div className="featureIcon">✍️</div>
              <div className="featureContent">
                <h3>Capture Notes</h3>
                <p>Record raw lecture notes offline, anytime, anywhere</p>
              </div>
            </div>

            <div className="featureItem">
              <div className="featureIcon">🤖</div>
              <div className="featureContent">
                <h3>AI-Powered Summaries</h3>
                <p>Transform notes into glossaries, summaries, and memory links</p>
              </div>
            </div>

            <div className="featureItem">
              <div className="featureIcon">📊</div>
              <div className="featureContent">
                <h3>Study Smart</h3>
                <p>Access your study materials anytime for quick revision</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="ctaSection">
          <p className="ctaText">Tell us your name to personalize your dashboard</p>
          <div className="nameField">
            {/* <label className="nameLabel" htmlFor="onboardingName">
              Your name
            </label> */}
            <input
              id="onboardingName"
              className="nameInput"
              type="text"
              placeholder="e.g., User"
              value={userName}
              onChange={handleNameChange}
              aria-invalid={showError}
              aria-describedby={showError ? "nameError" : undefined}
            />
            {showError && (
              <span id="nameError" className="nameError" role="alert">
                Please enter your name to continue.
              </span>
            )}
          </div>
          <button className="ctaButton" onClick={handleGetStarted} disabled={!userName.trim()}>
            Get Started → 
          </button>
          <p className="skipText">
            You'll be able to add courses, class schedules, and venues in the next step
          </p>
        </div>

        {/* Privacy Note */}
        <div className="privacyNote">
          <p>
            All your data is stored locally on your device. Your notes and study materials are private and secure.
          </p>
        </div>
      </div>
    </div>
  );
}

export default OnboardingPage;
