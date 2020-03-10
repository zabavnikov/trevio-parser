module.exports = date => new Date(Date.parse(date)).toISOString().replace('T', ' ').slice(0, 19);
