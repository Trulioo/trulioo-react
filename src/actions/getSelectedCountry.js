export default (userCountry, countries) => {
  if (countries.includes(userCountry)) {
    return userCountry;
  }
  return countries[0];
};
