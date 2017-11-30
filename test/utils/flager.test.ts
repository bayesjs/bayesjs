import * as expect from 'expect';
import { flager } from '../../src/utils/index';


describe('utils', () => {
  describe('flager', () => {
    it('should mark', () => {
      const { mark, isMarked } = flager();
      
      mark('1');
      mark('2');
      expect(isMarked('1')).toBeTruthy();
      expect(isMarked('2')).toBeTruthy();
      expect(isMarked('3')).toBeFalsy();
    });

    it('should unmark', () => {
      const { mark, unmark, isMarked } = flager();
      
      mark('1');
      mark('2');

      unmark('1');

      expect(isMarked('1')).toBeFalsy();
      expect(isMarked('2')).toBeTruthy();
      expect(isMarked('3')).toBeFalsy();
    });

    it('should unmark all', () => {
      const { mark, unmarkAll, isMarked } = flager();
      
      mark('1');
      mark('2');

      unmarkAll();

      expect(isMarked('1')).toBeFalsy();
      expect(isMarked('2')).toBeFalsy();
      expect(isMarked('3')).toBeFalsy();
    });
  });
});