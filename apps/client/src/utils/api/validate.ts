import {
  InvalidPasswordError,
  InvalidEmailError,
  InvalidPhoneNumberError,
  InvalidNameError,
  InvalidCompanyNameError,
} from "@bot-dashboard/errors";

const validatePassword = (password: string) => {
  if (password.length < 8) {
    throw new InvalidPasswordError();
  }
};

const validateEmail = (email: string) => {
  const emailRegex = /^([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;

  if (!emailRegex.test(email)) {
    throw new InvalidEmailError();
  }
};

const validateName = (name: string) => {
  if (name.trim().length === 0 || name.match(/\d+/g)) {
    throw new InvalidNameError();
  }
};

const validatePhone = (phone: string) => {
  const phoneRegex = /^(?:\+65)?[689][0-9]{7}$/;
  if (!phoneRegex.test(phone)) {
    throw new InvalidPhoneNumberError();
  }
};

const validateCompanyName = (company: string) => {
  if (company.trim().length === 0) {
    throw new InvalidCompanyNameError();
  }
};

const hasRepeatedLetters = (text: string): boolean => {
  const regex = /([a-zA-Z])\1+/;
  return regex.test(text);
};

export { validatePassword, validateEmail, validateName, validatePhone, validateCompanyName };
