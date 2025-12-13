export function validateEmail(email: string) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePassword(password: string) {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return re.test(password);
}

export function validateSlug(slug: string) {
  // Only lowercase letters, numbers, and hyphens
  const re = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  return re.test(slug) && slug.length >= 3 && slug.length <= 50;
}

export function validateDomain(domain: string) {
  const re = /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
  return re.test(domain);
}
