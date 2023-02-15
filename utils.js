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

exports.getUpdatedBalances = (quantity, currentBalance) => {
  let transferQuantity = quantity;
  let updatedBalance = currentBalance;

  if (transferQuantity <= currentBalance) {
    updatedBalance = currentBalance - transferQuantity;
  } else {
    transferQuantity = currentBalance;
    updatedBalance = 0;
  }
  return {
    transferQuantity: transferQuantity,
    updatedBalance: updatedBalance,
  };
};
