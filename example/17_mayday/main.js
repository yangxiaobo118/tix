const fs = require('fs');
const yaml = require('js-yaml');
const concert = yaml.safeLoad(fs.readFileSync('./concert.yml', 'utf8'));
const tix = o => require('../..')(concert)(o).catch(e => console.error(e.stack));

/**
 * time    (必填) : 開賣時間 (例如: 17:00:00)
 * date    (必填) : 演唱會日期 18, 19, 20, test
 * browser (選填) : 瀏覽器 chrome, firefox，若不填則使用系統預設隻瀏覽器
 * area    (選填) : 座位區域 (例如: A3)，如果不填則顯示全區的連結
 */
tix({
  time:     '15:00:00',
  date:     'test',
  browser:  'chrome',
  area:     'B2'
});
