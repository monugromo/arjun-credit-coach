export function paymentSummary(accounts: readonly { status: string }[]) {
  return { onTime: accounts.filter(account => account.status === "On time").length, total: accounts.length };
}