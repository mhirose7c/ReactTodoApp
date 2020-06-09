import React from 'react';
import Category from '../components/Category';
import renderer from 'react-test-renderer';

jest.mock("../components//Task", () => "Task");

it('matches to the snapshot', () => {
  const tree = renderer.create(<Category />).toJSON();
  expect(tree).toMatchSnapshot()

})