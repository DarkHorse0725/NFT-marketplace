export const getAddressAbb = (address: string) => address.slice(0,6) + "..." + address.slice(-6)

export const getOwnerText = (itemOwner: string, account: string) => itemOwner.toLowerCase() === account.toLowerCase() ? 'ME' : getAddressAbb(itemOwner)