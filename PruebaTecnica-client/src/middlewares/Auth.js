export const isAuthenticated = () => {
  const token = sessionStorage.getItem("token");
  return token ? true : false;
};
