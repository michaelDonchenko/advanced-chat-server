import {Response} from 'express'

export const generic500Error = (res: Response, error: unknown) => {
  console.log(error)
  return res.status(500).json({message: 'Something went wrong!'})
}
