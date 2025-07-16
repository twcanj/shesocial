// Request Logging Middleware
import morgan from 'morgan'

// Custom token for response time in Chinese
morgan.token('response-time-zh', function (req, res) {
  const responseTime = morgan['response-time'](req, res)
  return responseTime ? `${responseTime}ms` : '-'
})

// Custom token for timestamp in Taiwan timezone
morgan.token('timestamp-tw', function () {
  return new Date().toLocaleString('zh-TW', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
})

// Development format with colors
const developmentFormat = morgan('combined', {
  skip: function (req, res) {
    // Skip logging for health checks in development
    return req.url === '/api/health'
  }
})

// Production format with Taiwan timestamp
const productionFormat = morgan(':timestamp-tw :remote-addr ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time-zh')

// Error logging format
const errorFormat = morgan('combined', {
  skip: function (req, res) {
    return res.statusCode < 400
  }
})

export {
  developmentFormat,
  productionFormat,
  errorFormat
}
