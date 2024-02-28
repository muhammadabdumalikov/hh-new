export function formatLinkedinBirthDate(dateObj) {
  // Extract day, month, and year from the object
  const day = dateObj?.day;
  const month = dateObj?.month;
  const year = dateObj?.year;

  if (!day && !month && !year) {
    return null;
  }
  // Ensure day and month are formatted as two digits with leading zeros
  const formattedDay = String(day).padStart(2, '0');
  const formattedMonth = String(month).padStart(2, '0');

  // If year is null, use the current year
  const currentDate = new Date();
  const formattedYear = year !== null ? year : currentDate.getFullYear();

  // Return the formatted date string
  return `${formattedDay}-${formattedMonth}-${formattedYear}`;
}
