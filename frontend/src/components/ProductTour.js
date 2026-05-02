import React, { useState, useEffect } from 'react';
import { Joyride, STATUS } from 'react-joyride';
import { useLocation } from 'react-router-dom';

const dashboardSteps = [
  {
    target: '[data-testid="nav-aptitude"]',
    content: 'Welcome to PlacementPrep! Start with Aptitude module to master quantitative, logical, and verbal skills.',
    disableBeacon: true,
  },
  {
    target: '[data-testid="nav-reasoning"]',
    content: 'Practice pattern recognition, analytical, and visual reasoning here.',
  },
  {
    target: '[data-testid="nav-coding"]',
    content: 'Solve DSA problems with our Monaco editor and instant feedback.',
  },
  {
    target: '[data-testid="nav-interview"]',
    content: 'Practice mock interviews with AI to build confidence.',
  },
  {
    target: '[data-testid="nav-profile"]',
    content: 'Set your career goals and track your progress here.',
  },
  {
    target: '[data-testid="theme-toggle-btn"]',
    content: 'Toggle between light and dark modes for your comfort.',
  },
];

const ProductTour = ({ run, onFinish }) => {
  const location = useLocation();
  const [steps, setSteps] = useState(dashboardSteps);

  useEffect(() => {
    // Update steps based on current page if needed
    if (location.pathname === '/dashboard') {
      setSteps(dashboardSteps);
    }
  }, [location]);

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      onFinish();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      disableOverlayClose
      spotlightClicks
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#6366f1',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: '12px',
          backgroundColor: 'hsl(var(--card))',
          color: 'hsl(var(--foreground))',
        },
        tooltipContent: {
          padding: '12px',
        },
        buttonNext: {
          backgroundColor: '#6366f1',
          borderRadius: '8px',
          padding: '8px 16px',
        },
        buttonBack: {
          color: '#6366f1',
        },
        buttonSkip: {
          color: '#94a3b8',
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip Tour',
      }}
    />
  );
};

export default ProductTour;
