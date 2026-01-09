export const getToken = () =>
  typeof window === 'undefined'
    ? null
    : localStorage.getItem('access_token');

export const login = (token: string) => {
  localStorage.setItem('access_token', token);
};

export const logout = () => {
  localStorage.removeItem('access_token');
};
