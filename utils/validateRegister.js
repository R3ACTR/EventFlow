export function validateRegister(data) {
  const errors = {};

  if (!data.name || data.name.trim().length < 3) {
    errors.name = "Name must be at least 3 characters long.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!data.password || data.password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  if (!data.role) {
    errors.role = "Please select a role.";
  }

  return errors;
}
