export const ErrorHandler = (error) => {
  if (error.response) {
    const status = error.response.status;
    if (status === 403) {
      localStorage.clear();
      window.location.href = "/login";
    };
    return (
      error.response.data?.message ||
      error.response.data?.error ||
      error.message ||
      "Something went wrong"
    );
  };
  return error.message;
};
