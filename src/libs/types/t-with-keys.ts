export type Overwrite<T1, T2> = {
  [P in Exclude<keyof T1, keyof T2>]?: T1[P]
} & T2

export type TWithStringKeys<T = any> = {
  [key: string]: T
}

export type TWithNumKeys<T = any> = {
  [key: number]: T
}

export type TArrayWithStringKeys<T = any[]> = {
  [key: string]: T
}

export type MappedKeys<T = any> = { [key in keyof T]: any }
export type MappedObj<T = any> = { [key in keyof T]: T[key] }

type Func = (...args: any) => any
export type PartialRet<T extends Func> = Partial<ReturnType<T>>
