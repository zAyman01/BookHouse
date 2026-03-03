class ApiResponse {
  /**
   * Send a success response
   * @param {Object} res - Express response object
   * @param {*} data - Response payload
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code (default 200)
   */
  static success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * Send an error response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code (default 500)
   */
  static error(res, message = 'Something went wrong', statusCode = 500) {
    return res.status(statusCode).json({
      success: false,
      message,
      data: null,
    });
  }
}

export default ApiResponse;
