import React from "react";

const Company = () => {
  const companyLogos = [
    { src: '/logos/logo1.jpg', alt: 'Company 1' },
    { src: '/logos/logo2.jpg', alt: 'Company 2' },
    { src: '/logos/logo3.jpg', alt: 'Company 3' },
    { src: '/logos/logo4.jpg', alt: 'Company 4' },
    { src: '/logos/logo5.jpg', alt: 'Company 5' },
    { src: '/logos/logo6.jpg', alt: 'Company 6' },
    { src: '/logos/logo7.jpg', alt: 'Company 7' },
    { src: '/logos/logo8.jpg', alt: 'Company 8' },
    { src: '/logos/logo9.jpg', alt: 'Company 9' },
    { src: '/logos/logo10.jpg', alt: 'Company 10' },
  ];

  const containerStyle = {
    overflow: "hidden",
    whiteSpace: "nowrap",
    position: "relative",
    width: "100%",
    backgroundColor: "#f8f8f8",
    padding: "10px 0",
  };

  const trackStyle = {
    display: "flex",
    animation: "scroll 20s linear infinite",
  };

  const logoStyle = {
    width: "100px",
    height: "auto",
    margin: "0 20px",
  };

  const headerStyle = {
    textAlign: "left", // Aligns the text to the left
    fontSize: "24px",
    font:"Bold",
    fontWeight: "bold",
    marginBottom: "10px",
    color: "#333",
    marginLeft: "125px", // Optional: Adds some space from the left edge
  };

  const keyframes = `
    @keyframes scroll {
      0% {
        transform: translateX(0);
      }
      100% {
        transform: translateX(-100%);
      }
    }
  `;

  return (
    <>
      <style>{keyframes}</style>
      <div style={containerStyle}>
        {/* Line and Left-Aligned Header */}
        <div style={headerStyle}> <span> </span> Associated Companies</div>
        <br></br>
        <div style={trackStyle}>
          {companyLogos.map((logo, index) => (
            <img
              key={index}
              src={logo.src}
              alt={logo.alt}
              style={logoStyle}
            />
          ))}
          {/* Duplicate logos for smooth scrolling */}
          {companyLogos.map((logo, index) => (
            <img
              key={`duplicate-${index}`}
              src={logo.src}
              alt={logo.alt}
              style={logoStyle}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default Company;
