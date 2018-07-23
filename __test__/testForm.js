import React from 'react';
import renderer from 'react-test-renderer';

import App from '../App';

describe('screens::MainScreen', () => {
  it('renders two Form elements');
  it('');
});

it('renders without crashing', () => {
  const rendered = renderer.create(<App />).toJSON();
  expect(rendered).toBeTruthy();
});
