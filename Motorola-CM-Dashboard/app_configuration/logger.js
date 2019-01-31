const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;
//Custom fromat for logging
const myFormat = printf(info => {
  return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
});
// define the custom settings for each transport (file, console)
var options = {
  file: {
    level: 'error',
    filename: './logs/app.log',
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: true
  },
  console: {
    level: 'error',
    handleExceptions: true,
    json: false,
    colorize: true
  }
};

// instantiate a new Winston Logger with the settings defined above
var logger = createLogger({
  format: combine(
    label({ label: 'Info' }),
    timestamp(),
    myFormat
  ),
  transports: [
    //Log to file
    new transports.File(options.file),
    //Log to console
    new transports.Console(options.console)
  ],
  exitOnError: false, // do not exit on handled exceptions
});
module.exports = logger;
