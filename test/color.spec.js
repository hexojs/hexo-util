'use strict';

require('chai').should();

describe('color', () => {
  const Color = require('../lib/color');

  it('name', () => {
    const red = new Color('red');
    const pink = new Color('pink');
    const mid1 = red.mix(pink, 1 / 3);
    const mid2 = red.mix(pink, 2 / 3);

    `${red}`.should.eql('#f00');
    `${pink}`.should.eql('#ffc0cb');
    `${mid1}`.should.eql('#ff4044');
    `${mid2}`.should.eql('#ff8087');
  });

  it('hex', () => {
    const red = new Color('#f00');
    const pink = new Color('#ffc0cb');
    const mid1 = red.mix(pink, 1 / 3);
    const mid2 = red.mix(pink, 2 / 3);

    `${red}`.should.eql('#f00');
    `${pink}`.should.eql('#ffc0cb');
    `${mid1}`.should.eql('#ff4044');
    `${mid2}`.should.eql('#ff8087');
  });

  it('RGBA', () => {
    const steelblueA = new Color('rgba(70, 130, 180, 0.3)');
    const steelblue = new Color('rgb(70, 130, 180)');
    const mid1 = steelblueA.mix(steelblue, 1 / 3);
    const mid2 = steelblueA.mix(steelblue, 2 / 3);

    `${steelblueA}`.should.eql('rgba(70, 130, 180, 0.3)');
    `${steelblue}`.should.eql('#4682b4');
    `${mid1}`.should.eql('rgba(70, 130, 180, 0.53)');
    `${mid2}`.should.eql('rgba(70, 130, 180, 0.77)');
  });

  it('HSLA', () => {
    const steelblueA = new Color('hsla(207, 44%, 49%, 0.3)');
    const steelblue = new Color('hsl(207, 44%, 49%)');
    const mid1 = steelblueA.mix(steelblue, 1 / 3);
    const mid2 = steelblueA.mix(steelblue, 2 / 3);

    `${steelblueA}`.should.eql('rgba(70, 130, 180, 0.3)');
    `${steelblue}`.should.eql('#4682b4');
    `${mid1}`.should.eql('rgba(70, 130, 180, 0.53)');
    `${mid2}`.should.eql('rgba(70, 130, 180, 0.77)');
  });
});
