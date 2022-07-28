const password = document.getElementById("password")
const confirmPassword = document.getElementById("confirm-password");

const validatePassword = () => {
  if (password.value !== confirmPassword.value) {
    confirmPassword.setCustomValidity("パスワードが一致しません");
  } else {
    confirmPassword.setCustomValidity('');
  }
}

password.onchange = validatePassword;
confirmPassword.onkeyup = validatePassword;
