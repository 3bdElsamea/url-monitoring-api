exports.success = (res, status, data = {}) => {
  res.status(status).json({
    status: "success",
    ...data,
  });
};

exports.notFound = (res, message = "") => {
  res.status(404).json({
    message,
  });
};
