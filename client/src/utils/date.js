export const formatDate = (
  date,
  locale = "en-IN"
) => {

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
  }).format(new Date(date));

};

export const formatDateTime = (
  date,
  locale = "en-IN"
) => {

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));

};