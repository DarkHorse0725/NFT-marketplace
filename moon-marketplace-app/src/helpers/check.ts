export const cmpAddress = (addr1: string, addr2: string) => addr1.toLowerCase() === addr2.toLowerCase()

export const isEmpty = (value: any) => value === null || value === undefined || value === '' ||  (Array.isArray(value) && value.length === 0) || (typeof value === 'object' && Object.keys(value).length === 0) 