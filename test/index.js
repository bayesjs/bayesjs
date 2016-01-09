import expect from 'expect';
import hello from '../src/index';

describe('hello', () => {
  it('should say hello', () => {
    expect(hello).toBe('hello world');
  });
});
