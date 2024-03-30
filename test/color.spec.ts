import chai from 'chai';
import Color from '../lib/color';
chai.should();

describe('color', () => {
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

    // s=0
    const grey = new Color('hsl(207, 0%, 49%)');
    // h=0
    const red1 = new Color('hsl(0, 100%, 50%)');
    // h=360
    const red2 = new Color('hsl(360, 100%, 50%)');

    `${grey}`.should.eql('#7d7d7d');
    `${red1}`.should.eql('#f00');
    `${red2}`.should.eql('#f00');
  });

  it('invalid color', () => {
    let color;
    try {
      // @ts-ignore
      color = new Color(200);
    } catch (e) {
      e.message.should.eql('color is required!');
    }
    try {
      color = new Color('rgb(300, 130, 180)');
    } catch (e) {
      e.message.should.eql('{r: 300, g: 130, b: 180, a: 1} is invalid.');
    }
    try {
      color = new Color('cmyk(0%,0%,0%,0%)');
    } catch (e) {
      e.message.should.eql('cmyk(0%,0%,0%,0%) is not a supported color format.');
    }
    (typeof color).should.eql('undefined');
  });

  it('mix()', () => {
    const red = new Color('red');
    const pink = new Color('pink');
    const mid1 = red.mix(pink, 0);
    const mid2 = red.mix(pink, 1);

    `${mid1}`.should.eql('#f00');
    `${mid2}`.should.eql('#ffc0cb');

    try {
      red.mix(pink, 2);
    } catch (e) {
      e.message.should.eql('Valid numbers is only between 0 and 1.');
    }
  });

});
