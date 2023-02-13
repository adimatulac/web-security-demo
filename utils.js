exports.generateAccessCode = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charsLength = chars.length;

  let code = "";
  for (let i = 0; i < 24; i++) {
    code += chars.charAt(Math.floor(Math.random() * charsLength));
  }
  return code;
};

exports.getUpdatedBalances = (amount, currentBalance) => {
  let transferAmount = amount;
  let updatedBalance = currentBalance;

  if (transferAmount <= currentBalance) {
    updatedBalance = currentBalance - transferAmount;
  } else {
    transferAmount = currentBalance;
    updatedBalance = 0;
  }
  return {
    transferAmount: transferAmount,
    updatedBalance: updatedBalance,
  };
};
