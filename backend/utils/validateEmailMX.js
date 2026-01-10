import dns from "dns";

export const emailHasMX = (email) => {
  return new Promise((resolve) => {
    const domain = email.split("@")[1];

    dns.resolveMx(domain, (err, addresses) => {
      if (err || !addresses || addresses.length === 0) {
        return resolve(false);
      }
      return resolve(true);
    });
  });
};
