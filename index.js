const co = require('co');
const exec = require('child_process').exec;
const tixcraft = require('tixcraft');

class Tix {
  constructor (browser, showTime, date, keyword, concert) {
    this.showTime = showTime;
    this.keyword = keyword;
    this.concertId = concert[date].id;
    this.concertDate = concert[date].time;

    // browser
    browser = (browser || '').toLowerCase();
    if (browser !== '' && browser !== 'chrome' && browser !== 'firefox') {
      console.log(`Not support browser '${browser}', using default system browser.`);
      browser = '';
    }
    this.browser = browser;

    // bind method
    this.timeIsUp = this.timeIsUp.bind(this);
    this.openUrl = this.openUrl.bind(this);
    this.run = this.run.bind(this);
    this.getTicketUrl = this.getTicketUrl.bind(this);
  }

  timeIsUp () {
    const s = t => t.h * 60 * 60 + t.m * 60 + t.s;
    const p = n => (n < 10 ? '0' : '') + n; // "00" ~ "09"

    let t = this.showTime.split(':');
    const tt = {
      h: Number.parseInt(t[0]),
      m: Number.parseInt(t[1]),
      s: Number.parseInt(t[2])
    };

    t = new Date();
    const ct = {
      h: t.getHours(),
      m: t.getMinutes(),
      s: t.getSeconds()
    };

    const timeup = s(ct) >= s(tt);

    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(
      timeup ? this.showTime + '\n' : `${p(ct.h)}:${p(ct.m)}:${p(ct.s)}`
    );

    return timeup;
  }

  openUrl (url) {
    let cmd;
    switch (process.platform) {
      // Windows
      case 'win32':
        cmd = `start ${this.browser}`;
        break;

      // macOS
      case 'darwin': {
        let opt = '';
        if (this.browser === 'chrome') {
          opt = `-a "/Applications/Google Chrome.app"`;
        } else if (this.browser === 'firefox') {
          opt = `-a "/Applications/FireFox.app"`;
        }

        cmd = `open ${opt}`;
        break;
      }

      default:
        console.log(`not support platform: ${process.platform}.`);
        console.log(url);
        return;
    }

    exec(`${cmd} ${url}`);
  }

  run (done) {
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    if (this.browser)     console.log(`瀏覽器: ${this.browser}`);
    if (this.concertDate) console.log(`演場會: ${this.concertDate.split(' ')[0]}`);
    if (this.concertId)   console.log(`代號: ${this.concertId}`);
    if (this.keyword)     console.log(`座位區域: ${this.keyword}`);
    if (this.showTime)    console.log(`開賣時間: ${this.showTime}`);
    console.log('');

    this.id = setInterval(() => {
      if (this.timeIsUp(this.showTime)) {
        // stop timer
        clearInterval(this.id);
        this.id = null;
        console.log('Start Buying ... \n');

        const self = this;
        const allAreaUrl = `http://tixcraft.com/ticket/area/${this.concertId}`;

        co(function * () {
          for (;;) {
            try {
              if (typeof self.keyword !== 'string' || self.keyword.length === 0) {
                console.log(`Area is not selected, showing all area.`);
                console.log(allAreaUrl);
                self.openUrl(allAreaUrl);
              } else {
                if ((yield self.getTicketUrl()) === false) {
                  console.log(`Area '${self.keyword}' is not found, showing all area.`);
                  console.log(allAreaUrl);
                  self.openUrl(allAreaUrl);
                }
              }
            } catch (e) {
              console.log(e.stack);
              console.log('wait 1 second and try again ...');
              yield wait(1000);
              continue;
            }
            console.log('\n');
            break;
          }
        }).then(done);
      }
    }, 100); // update rate: 100ms
  }

  getTicketUrl () {
    return tixcraft(this.concertId).then(areaList => {

      if (this.browser)     console.log(`瀏覽器: ${this.browser}`);
      if (this.concertDate) console.log(`演場會: ${this.concertDate.split(' ')[0]}`);
      if (this.concertId)   console.log(`代號: ${this.concertId}`);
      if (this.keyword)     console.log(`座位區域: ${this.keyword}`);
      if (this.showTime)    console.log(`開賣時間: ${this.showTime}`);
      console.log('');

      if (areaList.length === 0) {
        console.log('已售完\n');
        return [];
      }

      let isFound = false;
      for (let i = 0; i < areaList.length; i++) {
        const area = areaList[i];
        console.log(`${area.info}:\t${area.url}`);

        if (isFound) {
          continue;
        }

        // check keyword
        if (typeof this.keyword !== 'string' || this.keyword.length === 0) {
          continue;
        }

        const regx = new RegExp(this.keyword, 'g');
        if (regx.test(area.info) === true) {
          this.openUrl(area.url);
          isFound = true;
        }
      }

      return isFound;
    });
  }
};

/**
 * @param {object} concertInfo
 * @return {function}
 */
module.exports = function (concertInfo) {
  /**
   * @param {object}  obj
   * @param {string}  obj.time
   * @param {string}  obj.date
   * @param {string?} obj.area
   * @param {string?} obj.browser
   * @return {promise}
   */
  return ({time, date, area, browser}) => new Promise((resolve, reject) => {
    new Tix(browser, time, date, area, concertInfo).run(resolve);
  });
}
