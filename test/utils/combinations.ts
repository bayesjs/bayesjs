import * as expect from 'expect';
import { buildCombinations, createNetwork } from '../../src/utils/index';
import { rain, sprinkler, grassWet } from '../../models/rain-sprinkler-grasswet';

describe('utils', () => {
  describe('combinations', () => {
    it('buildCombinations should woks', () => {
      const network = createNetwork(rain, sprinkler, grassWet);
      const combinations = buildCombinations(network);

      expect(combinations).toEqual(
        [
          {
            'RAIN': 'T',
            'SPRINKLER': 'T',
            'GRASS_WET': 'T'
          },
          {
            'RAIN': 'T',
            'SPRINKLER': 'T',
            'GRASS_WET': 'F'
          },
          {
            'RAIN': 'T',
            'SPRINKLER': 'F',
            'GRASS_WET': 'T'
          },
          {
            'RAIN': 'T',
            'SPRINKLER': 'F',
            'GRASS_WET': 'F'
          },
          {
            'RAIN': 'F',
            'SPRINKLER': 'T',
            'GRASS_WET': 'T'
          },
          {
            'RAIN': 'F',
            'SPRINKLER': 'T',
            'GRASS_WET': 'F'
          },
          {
            'RAIN': 'F',
            'SPRINKLER': 'F',
            'GRASS_WET': 'T'
          },
          {
            'RAIN': 'F',
            'SPRINKLER': 'F',
            'GRASS_WET': 'F'
          }
        ]
      );
    });

    it('buildCombinations given nodes to combine (1)', () => {
      const network = createNetwork(rain, sprinkler, grassWet);
      const combinations = buildCombinations(network, ['RAIN', 'SPRINKLER']);

      expect(combinations).toEqual(
        [
          {
            'RAIN': 'T',
            'SPRINKLER': 'T'
          },
          {
            'RAIN': 'T',
            'SPRINKLER': 'F'
          },
          {
            'RAIN': 'F',
            'SPRINKLER': 'T'
          },
          {
            'RAIN': 'F',
            'SPRINKLER': 'F'
          }
        ]
      );
    });

    it('buildCombinations given nodes to combine (2)', () => {
      const network = createNetwork(rain, sprinkler, grassWet);
      const combinations = buildCombinations(network, ['RAIN', 'GRASS_WET']);

      expect(combinations).toEqual(
        [
          {
            'RAIN': 'T',
            'GRASS_WET': 'T'
          },
          {
            'RAIN': 'T',
            'GRASS_WET': 'F'
          },
          {
            'RAIN': 'F',
            'GRASS_WET': 'T'
          },
          {
            'RAIN': 'F',
            'GRASS_WET': 'F'
          }
        ]
      );
    });

    it('buildCombinations given nodes to combine (3)', () => {
      const network = createNetwork(rain, sprinkler, grassWet);
      const combinations = buildCombinations(network, ['RAIN']);

      expect(combinations).toEqual(
        [
          {
            'RAIN': 'T'
          },
          {
            'RAIN': 'F'
          }
        ]
      );
    });
  });
});
