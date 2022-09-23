import {Request, Response, NextFunction} from 'express'
import {ObjectSchema, ValidationError} from 'yup'

const validate = (schema: ObjectSchema<any>) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    await schema.validate(req.body)
    return next()
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(500).json({type: error.name, message: error.message})
    } else {
      return res.status(500).json({message: 'An error accrued'})
    }
  }
}

export default validate
