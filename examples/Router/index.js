import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { withStyles } from 'tss-react/mui';
import ExamplesGrid from './ExamplesGrid';
import examples from '../examples';
import { Button } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const styles = {
  root: {
    display: 'flex',
    justifyContent: 'center',
  },
  contentWrapper: {
    width: '100%',
  },
};

function Examples({ classes }) {
  const navigate = useNavigate();
  const location = useLocation();

  const defaultTheme = createTheme();
  const returnHomeStyle = { padding: '0px', margin: '20px 0 20px 0' };

  return (
    <ThemeProvider theme={defaultTheme}>
      <main className={classes.root}>
        <div className={classes.contentWrapper}>
          <Routes>
            <Route path="/" element={<ExamplesGrid examples={examples} />} />
            {Object.keys(examples).map((label, index) => (
              <Route
                key={index}
                path={`/${label.replace(/\s+/g, '-').toLowerCase()}`}
                element={React.createElement(examples[label])}
              />
            ))}
          </Routes>
          <div>
            {location.pathname !== '/' && (
              <div style={returnHomeStyle}>
                <Button color="primary" onClick={() => navigate('/')}>
                  Back to Example Index
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </ThemeProvider>
  );
}

const StyledExamples = withStyles(Examples, styles);

function App() {
  return (
    <Router>
      <StyledExamples />
    </Router>
  );
}

const container = document.getElementById('app-root');
const root = createRoot(container);
root.render(<App />);
