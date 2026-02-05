import "./onboardingPage.css";

function OnboardingPage({ onGetStarted }) {
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
          <p className="ctaText">Let's get you started by adding your first course</p>
          <button className="ctaButton" onClick={onGetStarted}>
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
