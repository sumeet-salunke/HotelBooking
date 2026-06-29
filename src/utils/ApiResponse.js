class ApiResponse {
  constructor(statusCode, message, data = null) {
    this.success = true;
    this.sta = statusCode;
    this.message = message;
    this.data - data;
  }
}

export default ApiResponse;