import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter as Router, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
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

class Examples extends React.Component {
  returnHome = () => {
    this.props.navigate('/');
  };

  render() {
    const { classes } = this.props;

    var returnHomeStyle = { padding: '0px', margin: '20px 0 20px 0' };

    const defaultTheme = createTheme();

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
              {this.props.location.pathname !== '/' && (
                <div style={returnHomeStyle}>
                  <Button color="primary" onClick={this.returnHome}>
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
}

const StyledExamples = withStyles(Examples, styles);

function RoutedExamples(props) {
  const navigate = useNavigate();
  const location = useLocation();

  return <StyledExamples {...props} navigate={navigate} location={location} />;
}

function App() {
  return (
    <Router hashType="noslash">
      <RoutedExamples />
    </Router>
  );
}
const container = document.getElementById('app-root') || document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
