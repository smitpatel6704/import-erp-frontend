const tzs = ["America/New_York", "Asia/Kolkata", "Europe/London"];
tzs.forEach(tz => {
  const formatter = new Intl.DateTimeFormat('en', { timeZone: tz, timeZoneName: 'shortOffset' });
  const offset = formatter.formatToParts(new Date()).find(p => p.type === 'timeZoneName').value;
  console.log(`${tz}: ${offset}`);
});
