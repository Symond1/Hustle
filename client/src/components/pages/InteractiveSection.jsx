import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Lottie from 'react-lottie';

import coinAnimation from '@/assets/coin.json'; // Replace with the actual path
import moneyAnimation from '@/assets/money.json'; // Replace with the actual path

// Styled components
const Section = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  position: relative;
  background: white;
`;

const LoadingBarContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 80%;
`;

const LoadingBar = styled.div`
  width: 10px;
  height: 100%;
  background: #e0e0e0;
  border-radius: 20px;
  position: relative;
`;

const LoadingBarFill = styled.div`
  position: absolute;
  top: 0;
  width: 100%;
  height: ${(props) => props.height || '0%'};
  background: black; /* Black loading bar */
  border-radius: 20px;
  transition: height 0.3s ease-in-out;
`;

const TextContainer = styled.div`
  position: absolute;
  top: ${(props) => props.top}%;
  left: ${(props) => (props.align === 'left' ? '15%' : 'unset')};
  right: ${(props) => (props.align === 'right' ? '22%' : 'unset')};
  text-align: ${(props) => (props.align === 'left' ? 'left' : 'right')};
  max-width: 25%;
`;

const Text = styled.div`
  background: rgba(0, 0, 0, 0.05);
  padding: 15px;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  text-align: left; /* Ensures text is left-aligned inside the box */
  opacity: ${(props) => (props.isVisible ? 1 : 0)};
  transform: translateY(${(props) => (props.isVisible ? '0' : '50px')});
  transition: opacity 0.5s ease, transform 0.5s ease;
`;

const AnimationContainer = styled.div`
  position: absolute;
  top: ${(props) => props.top}%;
  left: ${(props) => (props.align === 'left' ? 'unset' : '15%')};
  right: ${(props) => (props.align === 'right' ? 'unset' : '15%')};
  transform: translateY(-50%);
  z-index: 1; /* Ensure animations are above the background but below text if needed */
`;

const InteractiveSection = () => {
  const [scrollPercent, setScrollPercent] = useState(0);

  const handleScroll = () => {
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    const totalScrollableHeight = docHeight - windowHeight;
    const scrolledPercentage = (scrollTop / totalScrollableHeight) * 100;
    setScrollPercent(scrolledPercentage);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const textData = [
    {
      text: "🚀 Hustle: Empowering your career journey seamless job discovery, effortless applications, and meaningful connections at your fingertips 🌐💼.",
      align: 'left',
      top: 15,
      visibleAt: [7, 45], // Visible between 7% to 45% scroll
      animationType: coinAnimation, // Animation type
    },
    {
      text: "🌟 Your career, simplified! Hustle bridges the gap between opportunity and talent with personalized profiles, real-time updates, and seamless event management 🎯📈.",
      align: 'right',
      top: 40,
      visibleAt: [45, 64], // Visible between 45% to 64% scroll
      animationType: moneyAnimation, // Animation type
    },
    {
      text: "🤝 Hustle: Where job seekers meet recruiters, opportunities find talent, and your next big career move begins 🚀👥💼!",
      align: 'left',
      top: 70,
      visibleAt: [65, 100], // Visible between 65% to 100% scroll
      animationType: coinAnimation, // Animation type
    },
  ];

  return (
    <Section>
      <LoadingBarContainer>
        <LoadingBar>
          {/* Adjust the height dynamically based on scroll percentage */}
          <LoadingBarFill height={`${scrollPercent}%`} />
        </LoadingBar>
      </LoadingBarContainer>
      {textData.map((item, index) => (
        <React.Fragment key={index}>
          {/* Text Section */}
          <TextContainer align={item.align} top={item.top}>
            <Text isVisible={scrollPercent >= item.visibleAt[0] && scrollPercent <= item.visibleAt[1]}>
              {item.text}
            </Text>
          </TextContainer>

          {/* Animation Section (opposite to text alignment) */}
          <AnimationContainer align={item.align === 'left' ? 'right' : 'left'} top={item.top}>
            <Lottie
              options={{
                loop: true,
                autoplay: scrollPercent >= item.visibleAt[0] && scrollPercent <= item.visibleAt[1], // Ensure animations are only visible in sync with text
                animationData: item.animationType,
                rendererSettings: {
                  preserveAspectRatio: 'xMidYMid slice',
                },
              }}
              height={120} // Adjust size as per your UI
              width={120} // Adjust size as per your UI
            />
          </AnimationContainer>
        </React.Fragment>
      ))}
    </Section>
  );
};

export default InteractiveSection;
