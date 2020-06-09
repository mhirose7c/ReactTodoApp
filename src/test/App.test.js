import React from 'react';
import App from '../components/App';
import renderer from 'react-test-renderer';

it('matches to the snapshot', () => {
  const tree = renderer.create(<App />).toJSON();
  expect(tree).toMatchSnapshot()
})