import { greet, version } from './utils';

describe('Utils', () => {
  test('greet returns proper message', () => {
    expect(greet('Test')).toBe('Hello, Test! Welcome to Football Management Simulator.');
  });

  test('greet defaults to World', () => {
    expect(greet()).toBe('Hello, World! Welcome to Football Management Simulator.');
  });

  test('version returns correct version', () => {
    expect(version()).toBe('0.1.0');
  });
});
