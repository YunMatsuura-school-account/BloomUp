import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/LandingPage.css";
import BudgetIcon from "../icons/BudgetIcon";
import CalendarIcon from "../icons/CalendarIcon";
import ArticlesIcon from "../icons/ArticlesIcon";

const LandingPage = () => {
  const [contactStatus, setContactStatus] = useState({
    type: null, // 'success' or 'error'
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    const menuToggle = document.querySelector(".lp-mobile-menu-toggle");
    const menuClose = document.querySelector(".lp-mobile-menu-close");
    const menuOverlay = document.querySelector(".lp-mobile-menu-overlay");
    const mobileNavLinks = document.querySelectorAll(".lp-mobile-nav a");

    const openMenu = () => {
      menuOverlay.classList.add("active");
      document.body.style.overflow = "hidden";
    };

    const closeMenu = () => {
      menuOverlay.classList.remove("active");
      document.body.style.overflow = "";
    };

    menuToggle?.addEventListener("click", openMenu);
    menuClose?.addEventListener("click", closeMenu);
    menuOverlay?.addEventListener("click", (e) => {
      if (e.target === menuOverlay) {
        closeMenu();
      }
    });

    mobileNavLinks.forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    return () => {
      menuToggle?.removeEventListener("click", openMenu);
      menuClose?.removeEventListener("click", closeMenu);
      menuOverlay?.removeEventListener("click", closeMenu);
      mobileNavLinks.forEach((link) => {
        link.removeEventListener("click", closeMenu);
      });
    };
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setContactStatus({ type: null, message: "" });

    const formData = new FormData(e.target);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL || "http://localhost:8888"
        }/api/contact`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      // Check if response is JSON before parsing
      const contentType = response.headers.get("content-type");
      let result;

      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        // If not JSON (likely HTML error page), handle 404 or other errors
        if (response.status === 404) {
          throw new Error(
            "Contact form endpoint not found. Please ensure the backend is updated."
          );
        }
        const text = await response.text();
        throw new Error(
          `Server error: ${response.status} ${response.statusText}`
        );
      }

      if (response.ok && result.success) {
        setContactStatus({
          type: "success",
          message:
            result.message ||
            "Thank you for contacting us! We will get back to you soon.",
        });
        e.target.reset();
        // Clear success message after 5 seconds
        setTimeout(() => {
          setContactStatus({ type: null, message: "" });
        }, 5000);
      } else {
        setContactStatus({
          type: "error",
          message:
            result.message || "Failed to send message. Please try again later.",
        });
      }
    } catch (error) {
      console.error("Error submitting contact form:", error);
      let errorMessage =
        "Network error. Please check your connection and try again.";

      if (
        error.message.includes("404") ||
        error.message.includes("not found")
      ) {
        errorMessage =
          "Contact form service is temporarily unavailable. Please try again later or contact us directly at bloomupproject2@gmail.com";
      } else if (error.message.includes("Network")) {
        errorMessage =
          "Network error. Please check your connection and try again.";
      }

      setContactStatus({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProposalDownload = () => {
    // Create a temporary link element
    const link = document.createElement("a");
    link.href = "/src/assets/WMDD 4980 - Team3.pdf";
    link.download = "WMDD 4980 - Team3.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="landing-page">
      {/* Header/Navigation */}
      <header className="lp-header">
        <div className="lp-header-container">
          <div className="lp-logo">
            <a href="#herp">
              <img
                src="/src/icons/BloomUpLogo.svg"
                alt="BloomUp"
                className="lp-logo-desktop"
              />
            </a>
            <a href="#hero">
              <img
                src="/src/assets/smallLogo.svg"
                alt="BloomUp"
                className="lp-logo-mobile"
              />
            </a>
          </div>
          <nav className="lp-nav-menu">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#team">Our Team</a>
            <a href="#project-assets">Project Assets</a>
            <a href="#contact">Contact Us</a>
          </nav>
          <button className="lp-mobile-menu-toggle" aria-label="Toggle menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
          <div className="lp-header-actions">
            <Link to="/signup" className="lp-btn-signup">
              Sign Up
            </Link>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div className="lp-mobile-menu-overlay">
          <div className="lp-mobile-menu">
            <div className="lp-mobile-menu-header">
              <img
                src="/src/assets/smallLogo.svg"
                alt="BloomUp"
                className="lp-mobile-menu-logo"
              />
              <button className="lp-mobile-menu-close" aria-label="Close menu">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <nav className="lp-mobile-nav">
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#team">Our Team</a>
              <a href="#project-assets">Project Assets</a>
              <a href="#contact">Contact Us</a>
            </nav>
            <div className="lp-mobile-menu-actions">
              <Link to="/signup" className="lp-btn-signup">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="lp-hero-section">
        <div className="lp-hero-container">
          <div className="lp-hero-content">
            <h1 className="lp-hero-title">
              Simplify parenting
              <br />
              Support their growth
            </h1>
            <p className="lp-hero-description">
              A supportive, all-in-one tool that helps parents stay organized
              and confidently manage their children's daily needs.
            </p>
            <div className="lp-hero-buttons">
              <button
                className="lp-btn-proposal"
                onClick={handleProposalDownload}
              >
                Proposal
                <img
                  src="/src/assets/arrow-big-down-dash.svg"
                  alt=""
                  className="lp-btn-icon"
                />
              </button>
            </div>
          </div>
        </div>
        <div className="lp-hero-curve">
          <svg
            viewBox="0 0 1440 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0 L0,60 Q400,180 800,80 Q1200,0 1440,40 L1440,180 L0,180 Z"
              fill="#C8E2E1"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="lp-features-wrapper">
        <h2 className="lp-section-title">Features</h2>

        {/* Budget Management Feature - Background #C8E2E1 */}
        <div className="lp-feature-section lp-feature-bg-1">
          <div className="lp-feature-container">
            <div className="lp-feature-content">
              <div className="lp-feature-icon">
                <BudgetIcon size={28} />
              </div>
              <h3 className="lp-feature-title">Budget Management</h3>
              <p className="lp-feature-description">
                Track spending by child, set monthly budgets, and receive AI
                insights that help families stay on track.
              </p>
              <ul className="lp-feature-list">
                <li>
                  <span className="lp-checkmark">✓</span>
                  Budget Setup
                </li>
                <li>
                  <span className="lp-checkmark">✓</span>
                  Spending Overview
                </li>
                <li>
                  <span className="lp-checkmark">✓</span>
                  Receipt Scanning
                </li>
                <li>
                  <span className="lp-checkmark">✓</span>
                  AI Insight & Suggestion
                </li>
              </ul>
            </div>
            <div className="lp-feature-mockup">
              <img
                src="/src/assets/FeatureBudgetImg.svg"
                alt="Budget Management Dashboard"
              />
            </div>
          </div>
        </div>

        {/* Smart Calendar Feature - Background #238D881A */}
        <div className="lp-feature-section lp-feature-bg-2">
          <div className="lp-feature-container lp-feature-reverse">
            <div className="lp-feature-mockup">
              <img
                src="/src/assets/FeatureCalendarImg.svg"
                alt="Smart Calendar Dashboard"
              />
            </div>
            <div className="lp-feature-content">
              <div className="lp-feature-icon">
                <CalendarIcon size={28} />
              </div>
              <h3 className="lp-feature-title">Smart Calendar</h3>
              <p className="lp-feature-description">
                One place for children events, re-stocking item alerts, and
                vaccination suggestion.
              </p>
              <ul className="lp-feature-list">
                <li>
                  <span className="lp-checkmark">✓</span>
                  Easy and quick Add Event
                </li>
                <li>
                  <span className="lp-checkmark">✓</span>
                  Upcoming events
                </li>
                <li>
                  <span className="lp-checkmark">✓</span>
                  Restocking items
                </li>
                <li>
                  <span className="lp-checkmark">✓</span>
                  Vaccination suggestion
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Articles & Resources Feature - Background #C8E2E1 */}
        <div className="lp-feature-section lp-feature-bg-1">
          <div className="lp-feature-container">
            <div className="lp-feature-content">
              <div className="lp-feature-icon">
                <ArticlesIcon size={28} />
              </div>
              <h3 className="lp-feature-title">Articles & Resources</h3>
              <p className="lp-feature-description">
                A personalized content hub that delivers the right parenting
                insights at the right time, tailored to each child's age,
                gender, budget patterns, and recent expenses.
              </p>
              <ul className="lp-feature-list">
                <li>
                  <span className="lp-checkmark">✓</span>
                  Various Category Options
                </li>
                <li>
                  <span className="lp-checkmark">✓</span>
                  Personalized contents
                </li>
                <li>
                  <span className="lp-checkmark">✓</span>
                  Top Articles
                </li>
                <li>
                  <span className="lp-checkmark">✓</span>
                  Article Saving
                </li>
              </ul>
            </div>
            <div className="lp-feature-mockup">
              <img
                src="/src/assets/FeatureArticleImg.svg"
                alt="Articles & Resources Dashboard"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="lp-pricing-section">
        {/* Top Curve - same wave pattern as features, but in teal */}
        <div className="lp-pricing-curve-top">
          <svg
            viewBox="0 0 1440 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M0,80 Q360,180 720,80 T1440,80 L1440,180 L0,180 Z"
              fill="#008F88"
            />
          </svg>
        </div>

        {/* Pricing Content with gradient background */}
        <div className="lp-pricing-content">
          {/* Title directly on gradient background */}
          <h2 className="lp-pricing-title">Pricing</h2>

          {/* Pricing Cards */}
          <div className="lp-pricing-container">
            <div className="lp-pricing-cards">
              {/* Basic Plan */}
              <div className="lp-pricing-card">
                <div className="lp-pricing-badge basic">Basic</div>
                <div className="lp-pricing-price">$0 / month</div>
                <ul className="lp-pricing-features">
                  <li>1 child profile</li>
                  <li>Basic calendar</li>
                  <li>5 receipt uploads / month</li>
                  <li>Ads</li>
                </ul>
                <Link to="/signup" className="lp-btn-pricing">
                  Get started
                </Link>
              </div>

              {/* Plus Plan */}
              <div className="lp-pricing-card">
                <div className="lp-pricing-badge plus">Plus</div>
                <div className="lp-pricing-price">$7.99 / month</div>
                <ul className="lp-pricing-features">
                  <li>Up to 3 child profiles</li>
                  <li>Full calendar + smart reminders</li>
                  <li>20 receipt uploads / month</li>
                  <li>Auto restock recommendations</li>
                  <li>Limited AI suggestion</li>
                  <li>Ads</li>
                </ul>
                <Link to="/signup" className="lp-btn-pricing">
                  Get started
                </Link>
              </div>

              {/* Premium Plan */}
              <div className="lp-pricing-card premium">
                <div className="lp-pricing-badge premium-badge">Premium</div>
                <div className="lp-pricing-price">$14.99 / month</div>
                <ul className="lp-pricing-features">
                  <li>Unlimited child profiles</li>
                  <li>Unlimited receipt uploads</li>
                  <li>Advanced AI insights & predictions</li>
                  <li>Restock reminders</li>
                  <li>Family sharing (up to 4 adults)</li>
                  <li>Ad-free</li>
                </ul>
                <Link to="/signup" className="lp-btn-pricing">
                  Get started
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Curve - simple smooth arc down */}
        <div className="lp-pricing-curve-bottom">
          <svg
            viewBox="0 0 1440 360"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path d="M0,0 Q720,360 1440,0 L1440,360 L0,360 Z" fill="#FFFFFF" />
          </svg>
        </div>
      </section>

      {/* Our Team Section */}
      <section id="team" className="lp-team-section">
        <div className="lp-team-container">
          <h2 className="lp-section-title">Our Team</h2>
          <div className="lp-team-grid">
            {/* Team Member 1 */}
            <div className="lp-team-member">
              <div className="lp-team-avatar">
                <img src="/src/assets/JungahBae.svg" alt="Jungah Bae" />
              </div>
              <a
                href="https://www.linkedin.com/in/kaeli-bae/"
                target="_blank"
                rel="noopener noreferrer"
                className="lp-team-name-link"
              >
                <h3 className="lp-team-name">
                  Jungah
                  <br />
                  Bae
                </h3>
              </a>
              <p className="lp-team-role">UI/UX Designer</p>
              <a
                href="https://www.linkedin.com/in/kaeli-bae/"
                target="_blank"
                rel="noopener noreferrer"
                className="lp-team-linkedin"
              >
                <svg width="20" height="20" fill="#000000" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span className="lp-linkedin-text">/kaeli-bae</span>
              </a>
            </div>

            {/* Team Member 2 */}
            <div className="lp-team-member">
              <div className="lp-team-avatar">
                <img src="/src/assets/AnaCarrillo.svg" alt="Ana Carrillo" />
              </div>
              <a
                href="https://www.linkedin.com/in/laanacarrilloc/"
                target="_blank"
                rel="noopener noreferrer"
                className="lp-team-name-link"
              >
                <h3 className="lp-team-name">
                  Ana
                  <br />
                  Carrillo
                </h3>
              </a>
              <p className="lp-team-role">UI/UX Designer</p>
              <a
                href="https://www.linkedin.com/in/laanacarrilloc/"
                target="_blank"
                rel="noopener noreferrer"
                className="lp-team-linkedin"
              >
                <svg width="20" height="20" fill="#000000" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span className="lp-linkedin-text">/laanacarrilloc</span>
              </a>
            </div>

            {/* Team Member 3 */}
            <div className="lp-team-member">
              <div className="lp-team-avatar">
                <img src="/src/assets/JaskiratSingh.svg" alt="Jaskirat Singh" />
              </div>
              <a
                href="https://www.linkedin.com/in/jaskirat-singh-990889327/"
                target="_blank"
                rel="noopener noreferrer"
                className="lp-team-name-link"
              >
                <h3 className="lp-team-name">
                  Jaskirat
                  <br />
                  Singh
                </h3>
              </a>
              <p className="lp-team-role">UI/UX Designer</p>
              <a
                href="https://www.linkedin.com/in/jaskirat-singh-990889327/"
                target="_blank"
                rel="noopener noreferrer"
                className="lp-team-linkedin"
              >
                <svg width="20" height="20" fill="#000000" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span className="lp-linkedin-text">
                  /jaskirat-singh-990889327
                </span>
              </a>
            </div>

            {/* Team Member 4 */}
            <div className="lp-team-member">
              <div className="lp-team-avatar">
                <img src="/src/assets/SahilKumar.svg" alt="Sahil Kumar" />
              </div>
              <a
                href="https://www.linkedin.com/in/sahil-kumar062001"
                target="_blank"
                rel="noopener noreferrer"
                className="lp-team-name-link"
              >
                <h3 className="lp-team-name">
                  Sahil
                  <br />
                  Kumar
                </h3>
              </a>
              <p className="lp-team-role">UI/UX Designer</p>
              <a
                href="https://www.linkedin.com/in/sahil-kumar062001"
                target="_blank"
                rel="noopener noreferrer"
                className="lp-team-linkedin"
              >
                <svg width="20" height="20" fill="#000000" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span className="lp-linkedin-text">/sahil-kumar062001</span>
              </a>
            </div>

            {/* Team Member 5 */}
            <div className="lp-team-member">
              <div className="lp-team-avatar">
                <img
                  src="/src/assets/Siddhi.svg"
                  alt="Siddhi Narharshettiwar"
                />
              </div>
              <a
                href="https://www.linkedin.com/in/siddhi-narharshettiwar-5470142a7/"
                target="_blank"
                rel="noopener noreferrer"
                className="lp-team-name-link"
              >
                <h3 className="lp-team-name">
                  Siddhi
                  <br />
                  Narharshettiwar
                </h3>
              </a>
              <p className="lp-team-role">UI/UX Designer</p>
              <a
                href="https://www.linkedin.com/in/siddhi-narharshettiwar-5470142a7/"
                target="_blank"
                rel="noopener noreferrer"
                className="lp-team-linkedin"
              >
                <svg width="20" height="20" fill="#000000" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span className="lp-linkedin-text">
                  /siddhi-narharshettiwar-5470142a7
                </span>
              </a>
            </div>

            {/* Team Member 6 */}
            <div className="lp-team-member">
              <div className="lp-team-avatar">
                <img src="/src/assets/YunMatsuura.svg" alt="Yun Matsuura" />
              </div>
              <a
                href="https://www.linkedin.com/in/yun-matsuura/"
                target="_blank"
                rel="noopener noreferrer"
                className="lp-team-name-link"
              >
                <h3 className="lp-team-name">
                  Yun
                  <br />
                  Matsuura
                </h3>
              </a>
              <p className="lp-team-role">Full- Stack Developer</p>
              <a
                href="https://www.linkedin.com/in/yun-matsuura/"
                target="_blank"
                rel="noopener noreferrer"
                className="lp-team-linkedin"
              >
                <svg width="20" height="20" fill="#000000" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span className="lp-linkedin-text">/yun-matsuura</span>
              </a>
            </div>

            {/* Team Member 7 */}
            <div className="lp-team-member">
              <div className="lp-team-avatar">
                <img src="/src/assets/Tejaswani.svg" alt="Tejaswani Kolasani" />
              </div>
              <a
                href="https://www.linkedin.com/in/kolasani-tejaswani-software-developer/"
                target="_blank"
                rel="noopener noreferrer"
                className="lp-team-name-link"
              >
                <h3 className="lp-team-name">
                  Tejaswani
                  <br />
                  Kolasani
                </h3>
              </a>
              <p className="lp-team-role">Full- Stack Developer</p>
              <a
                href="https://www.linkedin.com/in/kolasani-tejaswani-software-developer/"
                target="_blank"
                rel="noopener noreferrer"
                className="lp-team-linkedin"
              >
                <svg width="20" height="20" fill="#000000" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span className="lp-linkedin-text">
                  /kolasani-tejaswani-software-developer
                </span>
              </a>
            </div>

            {/* Team Member 8 */}
            <div className="lp-team-member">
              <div className="lp-team-avatar">
                <img src="/src/assets/HarleenKaur.svg" alt="Harleen Kaur" />
              </div>
              <a
                href="https://www.linkedin.com/in/asp-dot-net-software-engineer/"
                target="_blank"
                rel="noopener noreferrer"
                className="lp-team-name-link"
              >
                <h3 className="lp-team-name">
                  Harleen
                  <br />
                  Kaur
                </h3>
              </a>
              <p className="lp-team-role">Full- Stack Developer</p>
              <a
                href="https://www.linkedin.com/in/asp-dot-net-software-engineer/"
                target="_blank"
                rel="noopener noreferrer"
                className="lp-team-linkedin"
              >
                <svg width="20" height="20" fill="#000000" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span className="lp-linkedin-text">
                  /asp-dot-net-software-engineer
                </span>
              </a>
            </div>

            {/* Team Member 9 */}
            <div className="lp-team-member">
              <div className="lp-team-avatar">
                <img
                  src="/src/assets/ManmeetSingh.svg"
                  alt="Manmeet Singh Virdi"
                />
              </div>
              <a
                href="https://www.linkedin.com/in/manmeet-singh-virdi-b9359b334/"
                target="_blank"
                rel="noopener noreferrer"
                className="lp-team-name-link"
              >
                <h3 className="lp-team-name">
                  Manmeet Singh
                  <br />
                  Virdi
                </h3>
              </a>
              <p className="lp-team-role">Full- Stack Developer</p>
              <a
                href="https://www.linkedin.com/in/manmeet-singh-virdi-b9359b334/"
                target="_blank"
                rel="noopener noreferrer"
                className="lp-team-linkedin"
              >
                <svg width="20" height="20" fill="#000000" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span className="lp-linkedin-text">
                  /manmeet-singh-virdi-b9359b334
                </span>
              </a>
            </div>

            {/* Team Member 10 */}
            <div className="lp-team-member">
              <div className="lp-team-avatar">
                <img src="/src/assets/Vaibhav.svg" alt="Vaibhav Adesara" />
              </div>
              <a
                href="https://www.linkedin.com/in/vaibhav-adesara-b503151b2/"
                target="_blank"
                rel="noopener noreferrer"
                className="lp-team-name-link"
              >
                <h3 className="lp-team-name">
                  Vaibhav
                  <br />
                  Adesara
                </h3>
              </a>
              <p className="lp-team-role">Full- Stack Developer</p>
              <a
                href="https://www.linkedin.com/in/vaibhav-adesara-b503151b2/"
                target="_blank"
                rel="noopener noreferrer"
                className="lp-team-linkedin"
              >
                <svg width="20" height="20" fill="#000000" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span className="lp-linkedin-text">
                  /vaibhav-adesara-b503151b2
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Project Assets Section */}
      <section id="project-assets" className="lp-project-section">
        <div className="lp-project-container">
          <h2 className="lp-section-title">Project Assets</h2>
          <p className="lp-project-description">
            BloomUp is fully designed and developed by our team as a
            collaborative project.
            <br />
            You can explore our codebase, design system, and documentation on
            GitHub.
          </p>
          <div className="lp-project-buttons">
            <a
              href="https://www.figma.com/design/0m3EbpnjfoiCsMQN4S9uIF/Bloom-Up?node-id=612-920&t=MSkh1mrjjty4PUrK-0"
              className="lp-btn-project-prototype"
            >
              Prototype
              <img
                src="/src/assets/workflow.svg"
                alt=""
                className="lp-project-icon"
              />
            </a>
            <a
              href="https://github.com/YunMatsuura-school-account/BloomUp"
              className="lp-btn-project-github"
            >
              GitHub
              <img
                src="/src/assets/github.svg"
                alt=""
                className="lp-project-icon"
              />
            </a>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="lp-contact-section">
        <div className="lp-contact-container">
          <h2 className="lp-section-title">Contact Us</h2>
          <div className="lp-contact-content">
            <div className="lp-contact-illustration">
              <img
                src="/src/assets/ContactUsImg.svg"
                alt="Contact Us"
                className="lp-contact-img"
              />
            </div>
            <div className="lp-contact-form-wrapper">
              <h3 className="lp-contact-subtitle">
                Have Questions? Let's Connect.
              </h3>
              {contactStatus.type && (
                <div
                  className={`lp-contact-message ${
                    contactStatus.type === "success"
                      ? "lp-contact-message-success"
                      : "lp-contact-message-error"
                  }`}
                >
                  {contactStatus.message}
                </div>
              )}
              <form className="lp-contact-form" onSubmit={handleContactSubmit}>
                <div className="lp-form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div className="lp-form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Youremail@example.com"
                    required
                  />
                </div>
                <div className="lp-form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    placeholder="Your message here..."
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="lp-btn-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Submit"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="lp-footer-top">
          <div className="lp-footer-logo">
            <a href="#hero">
              <img src="/src/assets/BloomUpLogoWhite.svg" alt="BloomUp" />
            </a>
          </div>
          <nav className="lp-footer-nav">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#team">Our Team</a>
            <a href="#project-assets">Project Assets</a>
            <a href="#contact">Contact Us</a>
          </nav>
        </div>
        <div className="lp-footer-divider"></div>
        <div className="lp-footer-bottom">
          <p className="lp-footer-copyright">
            © 2025 BloomUp. All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
